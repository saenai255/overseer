import { Authentication } from "./authentication";
import { PathInfo } from "../../routes/abstracts";
import { UserDetails } from "../user-details";


export class BasicAuthentication extends Authentication {
    public async authenticate(info: PathInfo): Promise<UserDetails> {
        const authHeader = info.raw.request.headers.authorization;
        if(!authHeader || !authHeader.includes('Basic ') || authHeader.length < 8) {
            return null;
        }

        const [username, password] = Buffer.from(authHeader.split('Basic ')[1], 'base64').toString('utf8').split(':');
        const foundUser = await this.userProvider(username);

        if (this.passwordEncoder.matches(foundUser.password, password)) {
            return foundUser;
        }

        return null;
    }

}