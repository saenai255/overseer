import { Requisites } from "../core/requisites";
import { Router } from "../routes/router";
import { Route } from "../routes/route";
import logger from "@jeaks03/logger";
import { ShadowMeta, Class, MetaClass } from "../misc/custom-types";
import { GlobalConfig } from "../configs/global";

const getShadowMeta = <T>(target: MetaClass<T>): ShadowMeta => {
    if(!target.prototype.__shadowMeta) {
        return null;
    }

    return target.prototype.__shadowMeta;
}

export const Requisite: ClassDecorator = <T>(target: MetaClass<T> | any) => {
    if(GlobalConfig.isLibraryPackage) {
        return;
    }

    let shadowMeta = getShadowMeta(target);
    if(shadowMeta && shadowMeta.isRequisite) {
        return;
    }

    Requisites.addClass(target);
    if(!shadowMeta) {
        target.prototype.__shadowMeta = {
            isRequisite: true
        };

        shadowMeta = getShadowMeta(target);
    }

    shadowMeta.required = Reflect.getOwnMetadata("design:paramtypes", target) || [];
    const foundRoutes = shadowMeta.routes;
    if(foundRoutes) {
        const router = Requisites.find(Router);

        foundRoutes.forEach((route: Route) => {
            router.addRoute(route)
            logger.info(Router, 'Mapped endpoint [ {}, `{}` ] to {}.{}(..) handler', route.details.method, route.details.path, route.handlerName, route.handler.name);
        });
    }
}