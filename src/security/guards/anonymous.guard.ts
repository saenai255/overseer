import Guard from "./guard";
import Abstracts from "../../routes/abstracts";
import UserDetails from "../user-details";

export default class AnonymousGuard implements Guard {
    canAccess(user: UserDetails, info: Abstracts<any, any, any>): boolean {
        return !user;
    }

}