import Guard from "./Guard";
import Abstracts from "../../misc/Abstracts";
import UserDetails from "../UserDetails";

export default class AuthenticatedGuard implements Guard {
    canAccess(user: UserDetails, info: Abstracts<any, any, any>): boolean {
        return !!user;
    }

}