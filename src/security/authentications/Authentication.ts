import { IncomingMessage } from "http";
import Abstracts from "../../routes/abstracts";
import UserDetails from "../user-details";
import { UserProvider } from "../../misc/custom-types";

export default class Authentication {
    constructor(protected userProvider: UserProvider) {
    }

    public async authenticate(info: Abstracts<any, any, any>): Promise<UserDetails> {
        throw new Error('Method not implemented');
    }
}