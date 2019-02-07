import WayDetails from "./WayDetails";
import Authorizer from "../security/Authorizer";
import Abstracts from "./Abstracts";
import Requisites from "../core/Requisites";
import { loopWhile } from 'deasync';

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
        Requisites.find(Authorizer).authorizeRoute(this, info);  
        return this.resolve(info);
    }

    private resolve(info): any {
        const controller = Requisites.findByName(this.handlerName);

        let result = (<Function>this.handler).apply(controller, [info]);
        if(result instanceof Promise) {
            result.then(response => {
                result = response
            }).catch(err => { 
                result = err;
            })
            loopWhile(() => result instanceof Promise);
            if(result instanceof Error) {
                throw result;
            }
        }

        return result;
    }
}
