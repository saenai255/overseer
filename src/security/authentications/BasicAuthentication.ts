import Authentication from "./Authentication";
import Abstracts from "../../routes/Abstracts";
import UserDetails from "../UserDetails";
import HttpError from "../../errors/HttpError";
import { UNAUTHORIZED } from "../../misc/StandardResponses";

export default class BasicAuthentication extends Authentication {
    public async authenticate(info: Abstracts<any, any, any>): Promise<UserDetails> {
        const authHeader = info.raw.request.headers.authorization;
        if(!authHeader || !authHeader.includes('Basic ') || authHeader.length < 10) {
            throw new HttpError(UNAUTHORIZED);
        }

        const [username, password] = Buffer.from(authHeader.split('Basic ')[1], 'base64').toString('utf8').split(':');
        const foundUser = await this.userProvider(username);

        if(foundUser.password === password) {
            return foundUser;
        }

        throw new HttpError(UNAUTHORIZED);
    }

}