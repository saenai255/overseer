import { UNAUTHORIZED } from "../misc/standard-responses";
import logger from "@jeaks03/logger";
import { Requisites } from "../core/requisites";
import { Requisite } from "../decorators/requisite";
import { Authentication } from "./authentications/authentication";
import { NoAuthentication } from "./authentications/no-authentication";
import { Route } from "../routes/route";
import { PathInfo } from "../routes/abstracts";
import { Utils } from "../misc/utils";
import { HttpError } from "../errors/http-error";
import { AfterInit } from "../decorators/lifecycle";

@Requisite
export class Authorizer {
    private auth: Authentication;

    @AfterInit()
    onStart() {
        this.auth = Requisites.find(Authentication) || new NoAuthentication(null);
        logger.info(this, 'Proceeding with {} security', this.auth.constructor.name)
    }

    authorizeRoute(route: Route, info: PathInfo) {
        const principalPromise = this.auth.authenticate(info);
        const principal = Utils.clearPromise(principalPromise);

        info.user = principal;

        for (const guard of route.details.guards) {
            if(!(new guard()).canAccess(principal, info)) {
                throw new HttpError(UNAUTHORIZED);
            }
        }
    }

}