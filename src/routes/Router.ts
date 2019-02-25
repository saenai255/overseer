import Route from "./Route";
import http, { IncomingMessage, ServerResponse } from "http";
import Abstracts from "./Abstracts";
import CoreError from "../errors/CoreError";
import Resources from "../core/Resources";
import RouteUtils from "./RouteUtils";
import Redirect from "./Redirect";
import Converter from "../converters/Converter";
import HttpError from "../errors/HttpError";
import Response from "./Response";
import { UNSUPPORTED_MEDIA_TYPE, INTERVAL_SERVER_ERROR } from "../misc/StandardResponses";
import Requisites from "../core/Requisites";
import logger from "@jeaks03/logger";

export default class Router {
    public routes: Route[];

    public routeTree: any;

    private routeSym: symbol;
    private serverRequest: IncomingMessage;
    private serverResponse: ServerResponse;
    private foundRoute: Route;

    constructor(private port: number, private resourceMgr: Resources) {
        this.routes = [];
        this.routeTree = {};
        this.routeSym = Symbol('Route object index');
    }

    public init(): void {
        const server = http.createServer((req: IncomingMessage, res: ServerResponse) => {
            this.serverRequest = req;
            this.serverResponse = res;

            try {
                this.checkAvailableRoute();
            } catch(e) {
                if(!!e.response) {
                    e.handle(this.serverResponse);
                } else {
                    HttpError.handleServerError(this.serverResponse, e);
                }
            }
        });
        server.listen(this.port);
    }

    public addRoute(route: Route): void {
        let tree = this.routeTree;
        const parts = route.getParts();

        if(parts[0] === '') {
            if(!this.routeTree[this.routeSym]) {
                this.routeTree[this.routeSym] = {};
            }
            const branch = this.routeTree[this.routeSym];

            if(branch[route.details.method.toLowerCase()]) {
                logger.error(this, 'Route overlap on path `{}`@`{}`', route.details.method, route.details.path);
                throw new Error();
            }

            branch[route.details.method.toLowerCase()] = route;
        }

        parts.forEach((part, i) => {
            const isVariable = (part.startsWith('{') && part.endsWith('}')) || part === '*';
            const branch = isVariable ? '*' : part;

            if(!tree[branch]) {
                tree[branch] = {};
            }

            tree = tree[branch];

            if(i === parts.length - 1) {
                if(!tree[this.routeSym]) {
                    tree[this.routeSym] = {};
                }

                const branch = tree[this.routeSym];

                if(branch[route.details.method.toLowerCase()]) {
                    logger.error(this, 'Route overlap on path `{}`@`{}`', route.details.method, route.details.path);
                    throw new Error();
                }

                tree[this.routeSym][route.details.method.toLowerCase()] = route;
            }
        });
    }

    private findRoute(): Route {
        const parts = RouteUtils.getUrlPattern(this.serverRequest.url);
        let tree = this.routeTree;

        for(const part of parts) {
            if(!tree[part]) {
                return null;
            }

            tree = tree[part];
        }

        if(!tree || !tree[this.routeSym]) {
            return null;
        }

        return tree[this.routeSym][this.serverRequest.method.toLowerCase()] || null;
    }

    private checkAvailableRoute(): void {
        //const route = this.routes.find((r: Route) => RouteUtils.routeMatches(this.serverRequest.url, r.details.path) && this.serverRequest.method.toLowerCase() === r.details.method.toLowerCase());
        const route = this.findRoute();
        if(route) {
            this.foundRoute = route;
            this.routeMatched();
            return;
        }

        if(this.serverRequest.method.toLowerCase() === 'get' && this.resourceMgr.fileOrIndexExists(RouteUtils.getBaseUrl(this.serverRequest.url))) {
          this.resourceMgr.handleRequest(RouteUtils.getBaseUrl(this.serverRequest.url), this.serverResponse);
          return;
        }

        this.serverResponse.writeHead(404, {'Content-Type': 'application/json'});
        this.serverResponse.end();
    }

    private routeMatched(): void {
        this.parseRequest((info: Abstracts<any, any, any>) => {
            const output = this.handleRoute(info);
            
            /** @TODO forward the body too */
            if(output.body instanceof Redirect) {
                this.serverResponse.writeHead(302, { ...this.serverRequest.headers, 'Location': output.body.url });
                this.serverResponse.end();
                return;
            }

            this.writeResponse(output);
        });
    }

    private writeResponse(output: Response): void {
        const converter = this.findWriteConverter(output.body);

        this.serverResponse.writeHead(output.status, {'Content-Type': converter.getContentType()});
        this.serverResponse.write(converter.doWrite(output.body));
        this.serverResponse.end();
    }

    private parseRequest(callback: (info: Abstracts<any, any, any>) => void): void {
        let requestBody = '';

        this.serverRequest.on('data', chunk => {
            requestBody += chunk.toString();
        });

        
        this.serverRequest.on('end', () => {
            try {
                this.onRequestParsed(requestBody, callback);                
            } catch(e) {
                if(!!e.response) {
                    e.handle(this.serverResponse);
                } else {
                    HttpError.handleServerError(this.serverResponse, e);
                }
            }
        });

       
    }

    private onRequestParsed(body: string, callback: (info: Abstracts<any, any, any>) => void) {
        const messageConverter = this.findReadConverter(body);

        const abstract: Abstracts<any, any, any> = {
            body: messageConverter.doRead(body),
            raw: {
                request: this.serverRequest,
                response: this.serverResponse
            },
            pathParams: RouteUtils.parsePathParams(this.serverRequest.url, this.foundRoute.details.path),
            queryParams: RouteUtils.parseQueryParams(this.serverRequest.url)
        };

        callback(abstract);
    }

    private handleError(e: any, info: Abstracts<any, any, any>): Response {
        let output: Response = {};


        if (e instanceof CoreError) {

            output.body = e.handle(info);
            output.status = e.getStatusCode();

        } else if (e instanceof HttpError){
            output = e.response;
        } else {
            console.error(e)
            output = INTERVAL_SERVER_ERROR;
        }

        return output;
    }

    private handleRoute(info: Abstracts<any, any, any>): Response {
        try {
            return {
                body: this.foundRoute.handle(info),
                status: this.foundRoute.details.statusCode
            };
        } catch (e) {
            return this.handleError(e, info);
        }
    }

    private findReadConverter(body: string): Converter {
        const type = this.findContentType(this.serverRequest.headers["content-type"], this.foundRoute.details.consumes);
        const converter =  Requisites.findAll(Converter).find((x: Converter) => x.canRead(body, type));

        if(!converter) {
            throw new HttpError(UNSUPPORTED_MEDIA_TYPE);
        }

        return converter;
    }

    private findWriteConverter(body: any): Converter {
        const type = this.findContentType(this.serverRequest.headers.accept, this.foundRoute.details.produces);
        const converter =  Requisites.findAll(Converter).find((x: Converter) => x.canWrite(body, type));
        
        if(!converter) {
            throw new HttpError(UNSUPPORTED_MEDIA_TYPE);
        }

        return converter;
    }

    private findContentType(contentTypeHeader: string, allowedContentTypes: string[]) {
        const contentTypes = contentTypeHeader;
        let requiredContentTypes;

        if(contentTypes) {
            requiredContentTypes = contentTypes.split(',').map(x => x.trim()).map(x => x.split(';')[0]);
        }

        let type;
        if(!requiredContentTypes || contentTypes.includes('*/*')) {
            type = allowedContentTypes[0];
        } else if(requiredContentTypes) {
            type = requiredContentTypes.find(ctype => allowedContentTypes.includes(ctype));
        }

        return type;
    }
}