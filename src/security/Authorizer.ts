import Requisite from "../decorators/Requisite";
import Authentication from "./authentications/Authentication";
import NoAuthentication from "./authentications/NoAuthentication";
import Overseer from "../core/Overseer";
import Route from "../routes/Route";
import Abstracts from "../routes/Abstracts";
import HttpError from "../errors/HttpError";
import { UNAUTHORIZED } from "../misc/StandardResponses";
import logger from "@jeaks03/logger";
import Requisites from "../core/Requisites";

@Requisite
export default class Authorizer {
    private auth: Authentication;

    onInit() {
        this.auth = Requisites.find(Authentication) || new NoAuthentication(null);
        logger.info(this, 'Proceeding with {} security', (<Object>this.auth).constructor.name)
    }

    authorizeRoute(route: Route, info: Abstracts<any, any, any>) {
        const principal = this.auth.authenticate(info);
        info.user = principal;

        for (const guard of route.details.guards) {
            if(!(new guard()).canAccess(principal, info)) {
                throw new HttpError(UNAUTHORIZED);
            }

            
        }
    }

}