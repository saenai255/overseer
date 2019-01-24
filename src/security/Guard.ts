import { IncomingMessage } from "http";
import Abstracts from "../misc/Abstracts";

export default interface Guard {
    canAccess(user: any, info: Abstracts<any, any, any>): boolean;
}