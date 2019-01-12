import Route from "./Route";
import http, { IncomingMessage, ServerResponse } from "http";
import Abstracts from "./Abstracts";
import CoreError from "./CoreError";

export default class Router {
    public routes: Route[];

    constructor(private port: number) {
        this.routes = [];
    }

    public init(): void {
        const server = http.createServer((req: IncomingMessage, res: ServerResponse) => {
            const route = this.routes.find((r: Route) => this.routeMatches(req.url, r.path) && req.method.toLowerCase() === r.method.toLowerCase())
            if(!!route) {
                this.routeMatched(req, res, route);
                return;
            }

            console.debug(`Router:\t\tRoute '${req.url}' could not be handled`);
            res.writeHead(404, {'Content-Type': 'application/json'});
            res.end();
        });

        server.listen(this.port, () => console.log("Application:\tDevelopment started on port " + this.port));
    }

    private routeMatched(req: IncomingMessage, res: ServerResponse, route: Route): void {
        let body = '';
        let statusCode = route.statusCode;
        let responseBody;

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            const abstract: Abstracts = {
                body: body === '' ? undefined: JSON.parse(body),
                raw: {
                    request: req,
                    response: res
                },
                pathParams: this.parsePathParams(req.url, route.path),
                queryParams: this.parseQueryParams(req.url)
            };


          try {
              responseBody = route.handle(abstract);
            } catch (e) {

                if(e instanceof CoreError) {
                    responseBody = e.handle(abstract);
                    statusCode = e.getStatusCode();
                } else {
                    console.error(e);
                    statusCode = 500;
                    responseBody = {
                      error: (e as Error).stack,
                      timestamp: new Date(),
                      status: 500
                    }
                }
            }

            res.writeHead(statusCode, {'Content-Type': 'application/json'});
            res.write(!responseBody ? JSON.stringify({}) : JSON.stringify(responseBody));
          res.end();

        });
    }

    private routeMatches(baseUrl: string, basePattern: string): boolean {
        let url = baseUrl.split('?')[0];
        let pattern = basePattern;

        if(url.endsWith('/') && url.length >= 2) {
            url = url.substring(0, url.length - 2);
        }

        if(pattern.endsWith('/') && pattern.length >= 2) {
            pattern = pattern.substring(0, pattern.length - 2);
        }

        const urlParts = url.split('/');
        const patternParts = pattern.split('/');

        if (urlParts.length !== patternParts.length) {
            return false;
        }

        for (let i = 0; i < patternParts.length; i++) {
            const urlPart = urlParts[i];
            const patternPart = patternParts[i];

            if(patternPart.startsWith(':')) {
                continue;
            }

            if(urlPart.toLowerCase() !== patternPart.toLowerCase()) {
                return false;
            }
        }

        return true;
    }

    private parsePathParams(baseUrl: string, basePattern: string): object {
        let url = baseUrl;
        let pattern = basePattern;
        const out = {};

        if(url.endsWith('/') && url.length >= 2) {
            url = url.substring(0, url.length - 2);
        }

        if(pattern.endsWith('/') && pattern.length >= 2) {
            pattern = pattern.substring(0, pattern.length - 2);
        }

        const urlParts = url.split('/');
        const patternParts = pattern.split('/');

        for (let i = 0; i < patternParts.length; i++) {
            const urlPart = urlParts[i];
            const patternPart = patternParts[i];

            if(!patternPart.startsWith(':')) {
                continue;
            }

            out[patternPart.substring(1)] = this.parseValue(urlPart);
        }

        return out;
    }

    private parseQueryParams(url: string): object {
        const out = {};
        const paramsArray = url.split('?');

        if(paramsArray.length <= 1) {
            return out;
        }

        const params = paramsArray[1];
        params.split('&').forEach((param: string) => {
            const [field, value] = param.split('=');
            out[field] = this.parseValue(value);
        })

        return out;
    }

    private parseValue(value: string): any {
        if(!value) {
            return '';
        }

        if(value.includes(',')) {
            return value.split(',').map(val => this.parseValue(val));
        }

        if(value === 'true' || value === 'false') {
            return value === 'true';
        }

        if(value.includes('.') && !!parseFloat(value)) {
            return parseFloat(value);
        }

        if(!!parseInt(value, 10)) {
            return parseInt(value, 10);
        }

        return value;
    }
}
