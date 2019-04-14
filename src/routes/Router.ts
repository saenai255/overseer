import http, { IncomingMessage, ServerResponse } from "http";
import logger from "@jeaks03/logger";
import { Route } from "./route";
import { Resources } from "../core/resources";
import { AsyncRequestHandler } from "./async-request-handler";
import { AfterInit } from "../decorators/lifecycle";

export class Router {
    public readonly routes: Route[];
    public readonly routeTree: any;
    public readonly routeSym: symbol;

    constructor(private port: number, public resourceMgr: Resources) {
        this.routes = [];
        this.routeTree = {};
        this.routeSym = Symbol('Route object index');
    }

   @AfterInit()
    public initializeServer(): void {
        const server = http.createServer((req: IncomingMessage, res: ServerResponse) => AsyncRequestHandler.doHandle(req, res, this));
        server.on('listening', () => logger.info(this, 'HTTP Server started listening on port {} using {}', (server.address() as any).port, (server.address() as any).family))
        server.on('close', () => logger.warn(this, 'HTTP Server stopped listening'))
        server.listen(this.port);
    }

    public addRoute(route: Route): void {
        let tree = this.routeTree;
        const parts = route.getParts();

        if (parts[0] === '') {
            if (!this.routeTree[this.routeSym]) {
                this.routeTree[this.routeSym] = {};
            }
            const branch = this.routeTree[this.routeSym];

            if (branch[route.details.method.toLowerCase()]) {
                logger.error(this, 'Route overlap on path `{}`@`{}`', route.details.method, route.details.path);
                throw new Error();
            }

            branch[route.details.method.toLowerCase()] = route;
        }

        parts.forEach((part, i) => {
            const isVariable = (part.startsWith('{') && part.endsWith('}')) || part === '*';
            const branch = isVariable ? '*' : part;

            if (!tree[branch]) {
                tree[branch] = {};
            }

            tree = tree[branch];

            if (i === parts.length - 1) {
                if (!tree[this.routeSym]) {
                    tree[this.routeSym] = {};
                }

                const currentBranch = tree[this.routeSym];

                if (currentBranch[route.details.method.toLowerCase()]) {
                    logger.error(this, 'Route overlap on path `{}`@`{}`', route.details.method, route.details.path);
                    throw new Error();
                }

                tree[this.routeSym][route.details.method.toLowerCase()] = route;
            }
        });
    }
}