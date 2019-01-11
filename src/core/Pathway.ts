import Overseer from "./Overseer";
import Route from "./Route";

/**
 * Used to specify an endpoint
 * @default asd
 */
export default function Pathway(baseDetails?: WayDetails): any {
    const details = WayDetails.defaults(baseDetails);
    
    // tslint:disable-next-line
    return function(target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
        // Overseer.instance.router.routes.push({path, method, handler: descriptor.value, handlerName: target.constructor.name})
        Overseer.instance.router.routes.push(new Route(details.path, details.method, descriptor.value, target.constructor.name, details.statusCode));

        console.info(`Waypoint:\tMapped endpoint [ ${details.method.toUpperCase()}, '${details.path}' ] to ${target.constructor.name}#${descriptor.value.name}(..) handler`);
        return descriptor;
    }
};


export class WayDetails {
    
    public static defaults(details: WayDetails): WayDetails {
        const out = {
            path: '/',
            method: 'get',
            statusCode: 200
        };

        if(!details) {
            return out;
        }

        if(!!details.path) {
            out.path = details.path;
        }

        if(!!details.method) {
            out.method = details.method;
        }

        if(!!details.statusCode) {
            out.statusCode = details.statusCode;
        }

        return out;
    }
    
    public path?: string = '/';
    public method?: string = 'get';
    public statusCode?: number = 200;

}