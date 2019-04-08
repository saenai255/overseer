import Route from "./Route";
import http, { IncomingMessage, ServerResponse } from "http";
import Resources from "../core/Resources";
import logger from "@jeaks03/logger";
import AsyncRequestHandler from "./AsyncRequestHandler";

export default class Router {
    public readonly routes: Route[];
    public readonly routeTree: any;
    public readonly routeSym: symbol;

    constructor(private port: number, public resourceMgr: Resources) {
        this.routes = [];
        this.routeTree = {};
        this.routeSym = Symbol('Route object index');
    }

    public init(): void {
        const server = http.createServer((req: IncomingMessage, res: ServerResponse) => AsyncRequestHandler.doHandle(req, res, this));
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