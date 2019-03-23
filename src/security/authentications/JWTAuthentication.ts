import Authentication from "./Authentication";
import UserDetails from "../UserDetails";
import Abstracts from "../../routes/Abstracts";
import HttpError from "../../errors/HttpError";
import { UserProvider } from "../../misc/CustomTypes";
import { UNAUTHORIZED, BAD_REQUEST } from "../../misc/StandardResponses";
import * as jwt from "jsonwebtoken";
import Pathway from "../../decorators/Pathway";

export default class JWTAuthentication extends Authentication {
    /**
     * @param expiresIn time in milliseconds or a string like '5h', '15m', etc. until the token expires
     */
    constructor(private expiresIn: number | string, userProvider: UserProvider){
        super(userProvider);
        this.expiresIn = expiresIn;
    }

    @Pathway({path: '/access-token'})
    public createAccessToken(info:Abstracts<any, any, any>) {
        return (async () => {
            const authHeader = info.raw.request.headers.authorization;
            if(!authHeader || !authHeader.includes('Basic ') || authHeader.length < 10) {
                throw new HttpError(BAD_REQUEST);
            }

            const [username, password] = Buffer.from(authHeader.split('Basic ')[1], 'base64').toString('utf8').split(':');
            const foundUser = await this.userProvider(username);

            if(!foundUser || foundUser.password !== password) {
                throw new HttpError(UNAUTHORIZED);
            }

            foundUser.password = undefined;

            const token = jwt.sign({user: foundUser}, password, {expiresIn: this.expiresIn});
            const out = jwt.decode(token);

            return {
                token,
                ...out
            };
        })();
    }

    public async authenticate(info:Abstracts<any, any, any>): Promise<UserDetails> {
        const authHeader = info.raw.request.headers.authorization;
        if(!authHeader || !authHeader.includes('Bearer ') || authHeader.length < 10) {
            return null;
        }

        const token = authHeader.split('Bearer ')[1];
        const { user } = jwt.decode(token) as JwtToken;
        const foundUser = await this.userProvider(user.username);

        if(!foundUser) {
            return null;
        }

        try {
            jwt.verify(token, foundUser.password)
            return foundUser;
        } catch {
            return null;
        } 
    }

}

interface JwtToken {
    iat: number;
    exp: number;
    user: UserDetails;
}