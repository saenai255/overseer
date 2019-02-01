import Overseer from "../core/Overseer";
import Route from "../routes/Route";
import WayDetails from "../routes/WayDetails";
import logger from "../misc/Logger";
import Requisites from "../core/Requisites";
import Router from "../routes/Router";

/**
 * Used to specify an endpoint
 */
export default function Pathway(baseDetails?: WayDetails): any {
    const details = WayDetails.defaults(baseDetails);

    // tslint:disable-next-line
    return function(target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
        if(!target.isPrerequisite) {
            return descriptor;
        }

        Requisites.find(Router).routes.push(new Route(details, descriptor.value, target.constructor.name));

        logger.info(Pathway, 'Mapped endpoint [ {}, `{}` ] to {}#{}(..) handler', details.method.toUpperCase(), details.path, target.constructor.name, descriptor.value.name)
        return descriptor;
    }
};
