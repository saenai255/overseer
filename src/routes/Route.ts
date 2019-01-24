import Overseer from "../core/Overseer";
import WayDetails from "../misc/WayDetails";
import Authorizer from "../security/Authorizer";
import Abstracts from "../misc/Abstracts";
import RouterError from "../errors/HttpError";

export default class Route {
    public details: WayDetails;
    public handler: any;
    public handlerName: string;

    constructor(details: WayDetails, handler: any, handlerName: string) {
        this.handler = handler;
        this.handlerName = handlerName;
        this.details = details;
    }

    public handle(info: Abstracts<any, any, any>): any {
        const controller = Overseer.getRequisiteByName(this.handlerName);  
        Overseer.getRequisite(Authorizer).authorizeRoute(this, info);

        return this.handler.apply(controller, [info]);
    }
}
