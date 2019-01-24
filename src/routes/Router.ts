import Route from "./Route";
import http, { IncomingMessage, ServerResponse } from "http";
import Abstracts from "../misc/Abstracts";
import CoreError from "../errors/CoreError";
import ResourceManager from "../core/ResourceManager";
import RouteUtils from "./RouteUtils";
import Redirect from "./Redirect";
import { Overseer } from "..";
import Converter from "../converters/Converter";
import RouterError from "../errors/RouterError";
import Response from "./Response";
import { UNSUPPORTED_MEDIA_TYPE, INTERVAL_SERVER_ERROR } from "./StandardResponses";

export default class Router {
    public routes: Route[];

    private serverRequest: IncomingMessage;
    private serverResponse: ServerResponse;
    private foundRoute: Route;

    constructor(private port: number, private resourceMgr: ResourceManager) {
        this.routes = [];
    }

    public init(): void {
        const server = http.createServer((req: IncomingMessage, res: ServerResponse) => {
            this.serverRequest = req;
            this.serverResponse = res;

            try {
                this.findRoute();
            } catch(e) {
                if(!!e.response) {
                    e.handle(this.serverResponse);
                } else {
                    RouterError.handleServerError(this.serverResponse, e);
                }
            }
        });

        server.listen(this.port, () => console.log("Application:\tDevelopment started on port " + this.port));
    }

    private findRoute(): void {
        const route = this.routes.find((r: Route) => RouteUtils.routeMatches(this.serverRequest.url, r.details.path) && this.serverRequest.method.toLowerCase() === r.details.method.toLowerCase());
        if(route) {
            this.foundRoute = route;
            this.routeMatched();
            return;
        }

        if(this.serverRequest.method.toLowerCase() === 'get' && this.resourceMgr.fileExists(RouteUtils.getBaseUrl(this.serverRequest.url))) {
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
        this.serverResponse.writeHead(output.status, {'Content-Type': 'application/json'});
        this.serverResponse.write(converter.doWrite(output.body));
        this.serverResponse.end();
    }

    private parseRequest(callback: (info: Abstracts<any, any, any>) => void): void {
        let requestBody = '';

        this.serverRequest.on('data', chunk => {
            requestBody += chunk.toString();
        });

        

            this.serverRequest.on('end', () => {
                
                    this.onRequestParsed(requestBody, callback);
               
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

        } else if (e instanceof RouterError){
            output = e.response;
        } else {
            console.error(e);
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
        const converter =  Overseer.getConverters().find((x: Converter) => x.canRead(body, type));

        if(!converter) {
            throw new RouterError(UNSUPPORTED_MEDIA_TYPE);
        }

        return converter;
    }

    private findWriteConverter(body: any): Converter {
        const type = this.findContentType(this.serverRequest.headers.accept, this.foundRoute.details.produces);
        const converter =  Overseer.getConverters().find((x: Converter) => x.canRead(body, type));
        
        if(!converter) {
            throw new RouterError(UNSUPPORTED_MEDIA_TYPE);
        }

        return converter;
    }

    private findContentType(contentTypeHeader: string, allowedContentTypes: string[]) {
        const contentTypes = contentTypeHeader;
        let requiredContentTypes;

        if(contentTypes) {
            requiredContentTypes = contentTypes.split(',').map(x => x.trim());
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