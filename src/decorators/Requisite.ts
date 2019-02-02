import Requisites from "../core/Requisites";
import Router from "../routes/Router";
import Route from "../routes/Route";
import logger from "../misc/Logger";
import GlobalConfig from "../configs/GlobalConfig";

const getArgs = (target) => {
    const classImpl = target.prototype.constructor.toString();
    if(!classImpl.includes('constructor(') || classImpl.includes('constructor()')) {
        return [];
    }
    return classImpl.split('constructor(')[1].split(')')[0].split(",").map(x => x.trim()).map((x: string) => x[0].toUpperCase() + x.substring(1));
}

export default function Requisite(target: any /* class */): void {
    if(GlobalConfig.isLibraryPackage) {
        return;
    }

    target.prototype.isPrerequisite = true;
    target.prototype.prerequisites = getArgs(target);

    const foundRoutes = target.prototype.routes;
    if(foundRoutes) {
        Requisites.find(Router).routes.push(...foundRoutes);
        foundRoutes.forEach((route: Route) => logger.info(Router, 'Mapped endpoint [ {}, `{}` ] to {}.{}(..) handler', route.details.method, route.details.path, route.handlerName, route.handler.name))
    }

}
