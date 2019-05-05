import { Authentication } from "./authentication";
import { Abstracts } from "../../routes/abstracts";
import { UserDetails } from "../user-details";

export class NoAuthentication extends Authentication  {
    constructor() {
        super(null, null);
    }

    public async authenticate(): Promise<UserDetails> {
        return null;
    }
}