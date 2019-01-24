import Requisite from "../decorators/Requisite";
import Authentication from "./authentications/Authentication";
import NoAuth from "./authentications/NoAuth";
import Overseer from "../core/Overseer";
import Route from "../routes/Route";
import Abstracts from "../misc/Abstracts";
import RouterError from "../errors/HttpError";
import { UNAUTHORIZED } from "../misc/StandardResponses";

@Requisite
export default class Authorizer {
    private auth: Authentication;

    onInit() {
        this.auth = Overseer.getAuthorization() || new NoAuth(null);
    }

    authorizeRoute(route: Route, info: Abstracts<any, any, any>) {
        for (const guard of route.details.guards) {
            if(!(new guard()).canAccess(this.auth.getUser(info), info)) {
                throw new RouterError(UNAUTHORIZED);
            }
        }
    }

}