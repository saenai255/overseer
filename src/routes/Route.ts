import WayDetails from "./way-details";
import Authorizer from "../security/authorizer.component";
import Abstracts from "./abstracts";
import { Requisites } from "../core/requisites";
import { loopWhile } from 'deasync';

export default class Route {
    constructor(public details: WayDetails, public handler: any, public handlerName: string) {
        let path = this.details.path;

        if(path.startsWith('/')) {
            path = path.substring(1);
        }

        if(path.endsWith('/')) {
            path = path.substring(0, path.length - 1);
        }

        this.details.path = path;
    }

    public getParts(): string[] {
        return this.details.path.split('/');
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
