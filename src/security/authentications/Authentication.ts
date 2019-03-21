import { IncomingMessage } from "http";
import Abstracts from "../../routes/Abstracts";
import UserDetails from "../UserDetails";
import { UserProvider } from "../../misc/CustomTypes";

export default class Authentication {
    constructor(protected userProvider: UserProvider) {
    }

    public async authenticate(info: Abstracts<any, any, any>): Promise<UserDetails> {
        throw new Error('Method not implemented');
    }
}