import { AsyncFunction, MetaInstance } from "../misc/custom-types";
import logger from "@jeaks03/logger";
import { WayDetails } from "../routes/way-details";
import { Router } from "../routes/router";
import { Route } from "../routes/route";

/**
 * Used to specify an endpoint
 */
export function Pathway(baseDetails?: WayDetails): any {
    const details = WayDetails.defaults(baseDetails);

    // tslint:disable-next-line
    return function(target: MetaInstance /* instance */, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
        if(descriptor.value instanceof AsyncFunction) {
            logger.error(Router, 'Controller methods must not be async. They may however return a promise');
            throw new Error(`Method ${target.constructor.name}.${propertyKey.toString()}(..) cannot be async`)
        }

        if(!target.__shadowMeta) {
            target.__shadowMeta = {
                routes: []
             };
        }
        
        target.__shadowMeta.routes.push(new Route(details, descriptor.value, target.constructor.name));
        return descriptor;
    }
};
