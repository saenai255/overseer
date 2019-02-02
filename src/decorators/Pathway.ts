import Route from "../routes/Route";
import WayDetails from "../routes/WayDetails";
import { AsyncFunction } from "../misc/CustomTypes";
import logger from "../misc/Logger";
import { Router } from "..";

/**
 * Used to specify an endpoint
 */
export default function Pathway(baseDetails?: WayDetails): any {
    const details = WayDetails.defaults(baseDetails);

    // tslint:disable-next-line
    return function(target: any /* instance */, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
        if(descriptor.value instanceof AsyncFunction) {
            logger.error(Router, 'Controller methods must not be async. They may however return a promise');
            throw new Error(`Method ${target.constructor.name}.${propertyKey.toString()}(..) cannot be async`)
        }

        if(!target.routes) {
            target.routes = [];
        }

        target.routes.push(new Route(details, descriptor.value, target.constructor.name));
        return descriptor;
    }
};
