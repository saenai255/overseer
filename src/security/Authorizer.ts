import Authentication from "./authentications/Authentication";
import NoAuthentication from "./authentications/NoAuthentication";
import Route from "../routes/Route";
import Abstracts from "../routes/Abstracts";
import HttpError from "../errors/HttpError";
import { UNAUTHORIZED } from "../misc/StandardResponses";
import logger from "@jeaks03/logger";
import Requisites from "../core/Requisites";
import { loopWhile } from 'deasync';
import Utils from "../misc/Utils";
import { UserDetails } from "..";


export default class Authorizer {
    private auth: Authentication;

    onInit() {
        this.auth = Requisites.find(Authentication) || new NoAuthentication(null);
        logger.info(this, 'Proceeding with {} security', (<Object>this.auth).constructor.name)
    }

    authorizeRoute(route: Route, info: Abstracts<any, any, any>) {
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