import WayDetails from "./WayDetails";
import Authorizer from "../security/Authorizer";
import Abstracts from "./Abstracts";
import Requisites from "../core/Requisites";
import { loopWhile } from 'deasync';
import HttpError from "../errors/HttpError";
import { INTERVAL_SERVER_ERROR } from "../misc/StandardResponses";

export default class Route {
    public details: WayDetails;
    public handler: any;
    public handlerName: string;

    private cachedData: any;

    constructor(details: WayDetails, handler: any, handlerName: string) {
        this.handler = handler;
        this.handlerName = handlerName;
        this.details = details;
    }

    public handle(info: Abstracts<any, any, any>): any {
        Requisites.find(Authorizer).authorizeRoute(this, info);

        if(this.details.cacheEnabled && !!this.cachedData) {
            return this.cachedData;
        } else if(this.details.cacheEnabled) {
            return this.resolveAndCache(info);
        }
        
        return this.resolve(info);
    }

    private resolveAndCache(info): any {
        this.cachedData = this.resolve(info);
        setTimeout(() => this.cachedData = null, this.details.cacheExpiresIn)
        return this.cachedData;
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
