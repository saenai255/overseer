import WayDetails from "./WayDetails";
import Authorizer from "../security/Authorizer";
import Abstracts from "./Abstracts";
import Requisites from "../core/Requisites";

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
        const controller = Requisites.findByName(this.handlerName);  
        Requisites.find(Authorizer).authorizeRoute(this, info);

        return this.handler.apply(controller, [info]);
    }
}
