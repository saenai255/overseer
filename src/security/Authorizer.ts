import Requisite from "../decorators/Requisite";
import Authorization from "./Authorization";
import NoAuth from "./NoAuth";
import Overseer from "../core/Overseer";
import Route from "../routes/Route";
import Abstracts from "../misc/Abstracts";
import RouterError from "../errors/RouterError";
import { UNAUTHORIZED } from "../routes/StandardResponses";

@Requisite
export default class Authorizer {
    private auth: Authorization;

    onInit() {
        this.auth = Overseer.getAuthorization() || new NoAuth();
    }

    authorizeRoute(route: Route, info: Abstracts<any, any, any>) {
        for (const guard of route.details.guards) {
            if(!(new guard()).canAccess(this.auth.getUser(info), info)) {
                throw new RouterError(UNAUTHORIZED);
            }
        }
    }

}