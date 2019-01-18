import Route from "./Route";
import http, { IncomingMessage, ServerResponse } from "http";
import Abstracts from "../utils/Abstracts";
import CoreError from "../errors/CoreError";
import ResourceManager from "../core/ResourceManager";
import RouteUtils from "./RouteUtils";
import Redirect from "./Redirect";

export default class Router {
    public routes: Route[];

    constructor(private port: number, private resourceMgr: ResourceManager) {
        this.routes = [];
    }

    public init(): void {
        const server = http.createServer((req: IncomingMessage, res: ServerResponse) => {
            const route = this.routes.find((r: Route) => RouteUtils.routeMatches(req.url, r.path) && req.method.toLowerCase() === r.method.toLowerCase());
            if(!!route) {
                this.routeMatched(req, res, route);
                return;
            }

            if(req.method.toLowerCase() === 'get' && this.resourceMgr.fileExists(RouteUtils.getBaseUrl(req.url))) {
              this.resourceMgr.handleRequest(RouteUtils.getBaseUrl(req.url), res);
              return;
            }

            console.info(`Router:\t\tRoute ${req.method}@'${req.url}' could not be handled`);
            res.writeHead(404, {'Content-Type': 'application/json'});
            res.end();
        });

        server.listen(this.port, () => console.log("Application:\tDevelopment started on port " + this.port));
    }

    private routeMatched(req: IncomingMessage, res: ServerResponse, route: Route): void {
        this.parseRequest(req, res, route, (info: Abstracts) => {
            const output = this.handleRoute(route, info);
            
            /** @TODO forward the body too */
            if(output.body instanceof Redirect) {
                res.writeHead(302, { ...req.headers, 'Location': output.body.url });
                res.end();
                return;
            }

            this.writeResponse(res, output);
        });
    }

    private writeResponse(res: ServerResponse, output: Response): void {
        res.writeHead(output.status, {'Content-Type': 'application/json'});
        res.write(!output.body ? '' : JSON.stringify(output.body));
        res.end();
    }

    private parseRequest(req: IncomingMessage, res: ServerResponse, route: Route, callback: (info: Abstracts) => void): void {
        let requestBody = '';

        req.on('data', chunk => {
            requestBody += chunk.toString();
        });

        req.on('end', () => {
            const abstract: Abstracts = {
                body: requestBody === '' ? undefined : JSON.parse(requestBody),
                raw: {
                    request: req,
                    response: res
                },
                pathParams: RouteUtils.parsePathParams(req.url, route.path),
                queryParams: RouteUtils.parseQueryParams(req.url)
            };

            callback(abstract);
        });
    }

    private handleError(e: any, info: Abstracts): Response {
        const output: Response = {};


        if (e instanceof CoreError) {

            output.body = e.handle(info);
            output.status = e.getStatusCode();

        } else {

            console.error(e);
            output.status = 500;
            output.body = {
                error: (e as Error).stack,
                timestamp: new Date(),
                status: 500
            }
        }

        return output;
    }

    private handleRoute(route: Route, info: Abstracts): Response {
        try {
            return {
                body: route.handle(info),
                status: route.statusCode
            };
        } catch (e) {
            return this.handleError(e, info);
        }
    }
}

class Response {
    constructor(public status?: number, public body?: any) {}
}
