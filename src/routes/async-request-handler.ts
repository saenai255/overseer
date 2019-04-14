import { IncomingMessage, ServerResponse } from "http";
import { PathInfo } from "./abstracts";
import { INTERVAL_SERVER_ERROR, UNSUPPORTED_MEDIA_TYPE } from "../misc/standard-responses";
import { Requisites } from "../core/requisites";
import { Route } from "./route";
import { Router } from "./router";
import { RouteUtils } from "./route-utils";
import { HttpError } from "../errors/http-error";
import { Redirect } from "./redirect";
import { Response } from "./response";
import { CoreError } from "../errors/core-error";
import { Converter } from "../converters/converter";

export class AsyncRequestHandler {
    private foundRoute: Route;
    static async doHandle(serverRequest: IncomingMessage, serverResponse: ServerResponse, router: Router) {
        const handler = new AsyncRequestHandler(serverRequest, serverResponse, router);
        await handler.handle();
        handler.serverResponse.end();
    }

    private constructor(private serverRequest: IncomingMessage, 
        private serverResponse: ServerResponse,
        private router: Router) { }

    private async handle() {

        // Handle cross origin headers and OPTIONS requests
        this.appendInitialHeaders();
        if(RouteUtils.isMethod(this.serverRequest, 'options')) {
            return this.handleCORS();
        }

        try {
            await this.checkAvailableRoute();
        } catch(e) {
            if(e.response) {
                e.handle(this.serverResponse);
            } else {
                HttpError.handleServerError(this.serverResponse, e);
            }
        }
    }

    /**
     * Handles possible routing scenarios such as: route exists, resource exists or not found
     */
    private async checkAvailableRoute() {
        const route = this.findRoute();

        // Handle existing route
        if(route) {
            this.foundRoute = route;
            await this.routeMatched();
            return;
        }

        // If no route then handle public resources
        if(RouteUtils.isMethod(this.serverRequest, 'get') && this.router.resourceMgr.fileOrIndexExists(RouteUtils.getBaseUrl(this.serverRequest.url))) {
          this.router.resourceMgr.handleRequest(RouteUtils.getBaseUrl(this.serverRequest.url), this.serverResponse);
          return;
        }

        // If no public resource then send 404
        this.serverResponse.statusCode = 404;
        this.serverResponse.setHeader('Content-Type', 'application/json')
    }

    /**
     * Triggered when a route was found
     */
    private async routeMatched() {
        const rawBody = await this.parseRequest();

        const messageConverter = MessageConverterScout.
            using(this.serverRequest, this.foundRoute)
            .findReadConverter(rawBody);
        const body = messageConverter.doRead(rawBody);

        const pathInfo = this.generatePathInfo(body);

        // Triggers the controller method associated with this route
        const output = this.handleRoute(pathInfo);
        
        // Handle redirect
        if(output.body instanceof Redirect) {
            this.handleRedirect(output.body);
            return;
        }

        // Request is done, write output
        this.writeResponse(output);
    }

    /**
     * Triggers the controller method associated with the route
     * @param info param to pass to controller method
     */
    private handleRoute(info: PathInfo): Response {
        try {
            return {
                body: this.foundRoute.handle(info),
                status: this.foundRoute.details.statusCode
            };
        } catch (e) {
            return this.handleError(e, info);
        }
    }

    /**
     * Handles the given error
     * @param e the error
     * @param info param to pass to error handler method
     */
    private handleError(e: CoreError<any, any, any> | HttpError | Error | any, info: PathInfo): Response {
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

    /**
     * Generates PathInfo for the controller method to use
     */
    private generatePathInfo(body: any): PathInfo {
        return {
            body,
            raw: {
                request: this.serverRequest,
                response: this.serverResponse
            },
            pathParams: RouteUtils.parsePathParams(this.serverRequest.url, this.foundRoute.details.path),
            queryParams: RouteUtils.parseQueryParams(this.serverRequest.url)
        }
    }

    /**
     * Parses the raw http request body to a string promise
     */
    private parseRequest(): Promise<string> {
        let requestBody = '';
        this.serverRequest.on('data', chunk => requestBody += chunk.toString());
        return new Promise((resolve) => this.serverRequest.on('end', () => resolve(requestBody)));
    }

    /**
     * Returns the route associated with the current server request
     */
    private findRoute(): Route {
        const parts = RouteUtils.getUrlPattern(this.serverRequest.url);
        let tree = this.router.routeTree;

        for(const part of parts) {
            if(!tree[part]) {
                return null;
            }

            tree = tree[part];
        }

        if(!tree || !tree[this.router.routeSym]) {
            return null;
        }

        return tree[this.router.routeSym][this.serverRequest.method.toLowerCase()] || null;
    }

    /**
     * Adds necessary headers to avoid CORS issues
     */
    private appendInitialHeaders(): void {
        this.serverResponse.setHeader('Access-Control-Allow-Origin', '*');
        this.serverResponse.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
    }

    /**
     * Handles redirects
     */
    private handleRedirect(body: Redirect) {
        this.serverResponse.statusCode = 302;
        this.serverResponse.setHeader('Location', body.url);
    }

    /**
     * Adds necessary headers to avoid CORS issues in case of OPTIONS requests
     */
    private handleCORS(): void {
        this.serverResponse.setHeader('Access-Control-Allow-Headers', `Accept, Accept-CH, Accept-Charset, Accept-Datetime, Accept-Encoding, Accept-Ext, Accept-Features, Accept-Language, Accept-Params, Accept-Ranges, Access-Control-Allow-Credentials, Access-Control-Allow-Headers, Access-Control-Allow-Methods, Access-Control-Allow-Origin, Access-Control-Expose-Headers, Access-Control-Max-Age, Access-Control-Request-Headers, Access-Control-Request-Method, Age, Allow, Alternates, Authentication-Info, Authorization, C-Ext, C-Man, C-Opt, C-PEP, C-PEP-Info, CONNECT, Cache-Control, Compliance, Connection, Content-Base, Content-Disposition, Content-Encoding, Content-ID, Content-Language, Content-Length, Content-Location, Content-MD5, Content-Range, Content-Script-Type, Content-Security-Policy, Content-Style-Type, Content-Transfer-Encoding, Content-Type, Content-Version, Cookie, Cost, DAV, DELETE, DNT, DPR, Date, Default-Style, Delta-Base, Depth, Derived-From, Destination, Differential-ID, Digest, ETag, Expect, Expires, Ext, From, GET, GetProfile, HEAD, HTTP-date, Host, IM, If, If-Match, If-Modified-Since, If-None-Match, If-Range, If-Unmodified-Since, Keep-Alive, Label, Last-Event-ID, Last-Modified, Link, Location, Lock-Token, MIME-Version, Man, Max-Forwards, Media-Range, Message-ID, Meter, Negotiate, Non-Compliance, OPTION, OPTIONS, OWS, Opt, Optional, Ordering-Type, Origin, Overwrite, P3P, PEP, PICS-Label, POST, PUT, Pep-Info, Permanent, Position, Pragma, ProfileObject, Protocol, Protocol-Query, Protocol-Request, Proxy-Authenticate, Proxy-Authentication-Info, Proxy-Authorization, Proxy-Features, Proxy-Instruction, Public, RWS, Range, Referer, Refresh, Resolution-Hint, Resolver-Location, Retry-After, Safe, Sec-Websocket-Extensions, Sec-Websocket-Key, Sec-Websocket-Origin, Sec-Websocket-Protocol, Sec-Websocket-Version, Security-Scheme, Server, Set-Cookie, Set-Cookie2, SetProfile, SoapAction, Status, Status-URI, Strict-Transport-Security, SubOK, Subst, Surrogate-Capability, Surrogate-Control, TCN, TE, TRACE, Timeout, Title, Trailer, Transfer-Encoding, UA-Color, UA-Media, UA-Pixels, UA-Resolution, UA-Windowpixels, URI, Upgrade, User-Agent, Variant-Vary, Vary, Version, Via, Viewport-Width, WWW-Authenticate, Want-Digest, Warning, Width, X-Content-Duration, X-Content-Security-Policy, X-Content-Type-Options, X-CustomHeader, X-DNSPrefetch-Control, X-Forwarded-For, X-Forwarded-Port, X-Forwarded-Proto, X-Frame-Options, X-Modified, X-OTHER, X-PING, X-PINGOTHER, X-Powered-By, X-Requested-With`);
        this.serverResponse.statusCode = 200;
    }

    /**
     * Writes to the http response object
     * @param output what to write
     */
    private writeResponse(output: Response): void {
        const converter = MessageConverterScout
            .using(this.serverRequest, this.foundRoute)
            .findWriteConverter(output.body);

        this.serverResponse.statusCode = output.status;
        this.serverResponse.setHeader('Content-Type', converter.getContentType())
        this.serverResponse.write(converter.doWrite(output.body));
    }
}

class MessageConverterScout {
    public static using(serverRequest: IncomingMessage, foundRoute: Route): MessageConverterScout {
        return new MessageConverterScout(serverRequest, foundRoute);
    }

    private constructor(private serverRequest: IncomingMessage,
        private foundRoute: Route) { }

    public findReadConverter(body: string): Converter {
        const type = this.findContentType(this.serverRequest.headers["content-type"], this.foundRoute.details.consumes);
        const converter =  Requisites.findAll(Converter).find((x: Converter) => x.canRead(body, type));

        if(!converter) {
            throw new HttpError(UNSUPPORTED_MEDIA_TYPE);
        }

        return converter;
    }

    public findWriteConverter(body: any): Converter {
        const type = this.findContentType(this.serverRequest.headers.accept, this.foundRoute.details.produces);
        const converter =  Requisites.findAll(Converter).find((x: Converter) => x.canWrite(body, type));
        
        if(!converter) {
            throw new HttpError(UNSUPPORTED_MEDIA_TYPE);
        }

        return converter;
    }

    public findContentType(contentTypeHeader: string, allowedContentTypes: string[]): string {
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