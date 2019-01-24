import { IncomingMessage } from "http";
import Abstracts from "../../misc/Abstracts";
import UserDetails from "../UserDetails";

export default interface Guard {
    canAccess(user: UserDetails, info: Abstracts<any, any, any>): boolean;
}