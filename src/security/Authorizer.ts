import Requisite from "../decorators/Requisite";
import Authentication from "./authentications/Authentication";
import NoAuthentication from "./authentications/NoAuthentication";
import Overseer from "../core/Overseer";
import Route from "../routes/Route";
import Abstracts from "../routes/Abstracts";
import RouterError from "../errors/HttpError";
import { UNAUTHORIZED } from "../misc/StandardResponses";
import logger from "../misc/Logger";

@Requisite
export default class Authorizer {
    private auth: Authentication;

    onInit() {
        this.auth = Overseer.getAuthentication() || new NoAuthentication(null);
        logger.info(this, 'Loaded {} security', (<Object>this.auth).constructor.name)
    }

    authorizeRoute(route: Route, info: Abstracts<any, any, any>) {
        for (const guard of route.details.guards) {
            if(!(new guard()).canAccess(this.auth.authenticate(info), info)) {
                throw new RouterError(UNAUTHORIZED);
            }
        }
    }

}