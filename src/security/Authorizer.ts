import Requisite from "../decorators/Requisite";
import Authentication from "./authentications/Authentication";
import NoAuthentication from "./authentications/NoAuthentication";
import Overseer from "../core/Overseer";
import Route from "../routes/Route";
import Abstracts from "../routes/Abstracts";
import RouterError from "../errors/HttpError";
import { UNAUTHORIZED } from "../misc/StandardResponses";

@Requisite
export default class Authorizer {
    private auth: Authentication;

    onInit() {
        this.auth = Overseer.getAuthorization() || new NoAuthentication(null);

        console.info('Authorizer:\t\tLoaded ' + (<Object>this.auth).constructor.name + ' security');
    }

    authorizeRoute(route: Route, info: Abstracts<any, any, any>) {
        for (const guard of route.details.guards) {
            if(!(new guard()).canAccess(this.auth.authenticate(info), info)) {
                throw new RouterError(UNAUTHORIZED);
            }
        }
    }

}