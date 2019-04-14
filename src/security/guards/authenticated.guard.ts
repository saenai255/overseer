import { Guard } from "./guard";
import { UserDetails } from "../user-details";
import { Abstracts } from "../../routes/abstracts";

export class AuthenticatedGuard implements Guard {
    canAccess(user: UserDetails, info: Abstracts<any, any, any>): boolean {
        return !!user;
    }

}