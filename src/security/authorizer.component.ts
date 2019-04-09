
import Authentication from "./authentications/authentication";
import NoAuthentication from "./authentications/no-authentication";
import Route from "../routes/route";
import Abstracts from "../routes/abstracts";
import HttpError from "../errors/http-error";
import { UNAUTHORIZED } from "../misc/standard-responses";
import logger from "@jeaks03/logger";
import { Requisites } from "../core/requisites";
import Utils from "../misc/utils";
import Events from "../core/events";
import { EventType } from "../misc/custom-types";
import Requisite from "../decorators/requisite";

@Requisite
export default class Authorizer {
    private auth: Authentication;

    constructor(private events: Events) { }

    onInit() {
        this.events.register(EventType.AfterFinishStartup, () => {
            this.auth = Requisites.find(Authentication) || new NoAuthentication(null);
            logger.info(this, 'Proceeding with {} security', (<Object>this.auth).constructor.name)
        });
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