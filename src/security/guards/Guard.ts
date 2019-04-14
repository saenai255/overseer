import { UserDetails } from "../user-details";
import { Abstracts } from "../../routes/abstracts";

export interface Guard {
    canAccess(user: UserDetails, info: Abstracts<any, any, any>): boolean;
}