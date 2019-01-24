import Guard from "./Guard";
import Abstracts from "../../misc/Abstracts";
import UserDetails from "../UserDetails";

export default class AnonymousGuard implements Guard {
    canAccess(user: UserDetails, info: Abstracts<any, any, any>): boolean {
        return !user;
    }

}