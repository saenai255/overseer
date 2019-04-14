import { Authentication } from "./authentication";
import { Abstracts } from "../../routes/abstracts";
import { UserDetails } from "../user-details";

export class NoAuthentication extends Authentication  {
    public async authenticate(info: Abstracts<any, any, any>): Promise<UserDetails> {
        return null;
    }
}