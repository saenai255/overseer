import Overseer from "../core/Overseer";
import Route from "../routes/Route";
import WayDetails from "../routes/WayDetails";

/**
 * Used to specify an endpoint
 */
export default function Pathway(baseDetails?: WayDetails): any {
    const details = WayDetails.defaults(baseDetails);

    // tslint:disable-next-line
    return function(target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
        // Overseer.instance.router.routes.push({path, method, handler: descriptor.value, handlerName: target.constructor.name})
        Overseer.getRouter().routes.push(new Route(details, descriptor.value, target.constructor.name));

        console.info(`Pathway:\t\tMapped endpoint [ ${details.method.toUpperCase()}, '${details.path}' ] to ${target.constructor.name}#${descriptor.value.name}(..) handler`);
        return descriptor;
    }
};
