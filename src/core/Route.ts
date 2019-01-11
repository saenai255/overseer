import Overseer from "./Overseer";

export default class Route {
    public method: string;
    public path: string;
    public handler: any;
    public handlerName: string;
    public statusCode: number;

    constructor(path: string, method: string, handler: any, handlerName: string, statusCode: number) {
        this.handler = handler;
        this.path = path;
        this.handlerName = handlerName;
        this.method = method;
        this.statusCode = statusCode;
    }

    public handle(args: any): any {
        const controller = Overseer.instance.getRequisite(this.handlerName);
        return this.handler.apply(controller, [args]);
    }
}