import Abstracts from "../../routes/abstracts";
import UserDetails from "../user-details";

export default interface Guard {
    canAccess(user: UserDetails, info: Abstracts<any, any, any>): boolean;
}