import { Authentication } from "./authentication";
import { Abstracts } from "../../routes/abstracts";
import { UserDetails } from "../user-details";


export class BasicAuthentication extends Authentication {
    public async authenticate(info: Abstracts<any, any, any>): Promise<UserDetails> {
        const authHeader = info.raw.request.headers.authorization;
        if(!authHeader || !authHeader.includes('Basic ') || authHeader.length < 10) {
            return null;
        }

        const [username, password] = Buffer.from(authHeader.split('Basic ')[1], 'base64').toString('utf8').split(':');
        const foundUser = await this.userProvider(username);

        if(foundUser.password === password) {
            return foundUser;
        }

        return null;
    }

}