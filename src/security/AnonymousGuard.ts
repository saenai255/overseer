import Guard from "./Guard";
import Abstracts from "../misc/Abstracts";

export default class AnonymousGuard implements Guard {
    canAccess(user: any, info: Abstracts<any, any, any>): boolean {
        return !user;
    }

}