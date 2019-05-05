import { UserProvider } from "../../misc/custom-types";
import { UNAUTHORIZED, BAD_REQUEST } from "../../misc/standard-responses";
import * as jwt from "jsonwebtoken";
import { Authentication, PasswordEncoder } from "./authentication";
import { Pathway } from "../../decorators/pathway";
import { PathInfo } from "../../routes/abstracts";
import { HttpError } from "../../errors/http-error";
import { UserDetails } from "../user-details";
import { BasicAuthentication } from "./basic-authentication";

export class JWTAuthentication extends Authentication {
    /**
     * @param expiresIn time in milliseconds or a string like '5h', '15m', etc. until the token expires
     */
    constructor(private expiresIn: number | string,
            userProvider: UserProvider,
            passwordEncoder: PasswordEncoder,
            private secret: string
            ) {

        super(userProvider, passwordEncoder);
        this.expiresIn = expiresIn;
    }

    @Pathway({path: '/access-token'})
    public createAccessToken(info: PathInfo) {
        return (async () => {
            const basicAuth = new BasicAuthentication(this.userProvider, this.passwordEncoder)
            const foundUser = await basicAuth.authenticate(info);

            if(!foundUser) {
                throw new HttpError(UNAUTHORIZED);
            }

            return this.generateToken(foundUser);
        })();
    }

    public generateToken<T extends UserDetails>(user: T): ExplicitJwtToken<T> {
        const purifiedUser = { ...user };
        delete purifiedUser.password;

        const token = jwt.sign({ user: purifiedUser }, this.secret, { expiresIn: this.expiresIn });
        const out = jwt.decode(token) as { user: T };

        return {
            token,
            ...out
        };
    }

    public async authenticate(info: PathInfo): Promise<UserDetails> {
        const authHeader = info.raw.request.headers.authorization;
        if(!authHeader || !authHeader.includes('Bearer ') || authHeader.length < 10) {
            return null;
        }

        const token = authHeader.split('Bearer ')[1];
        const { user } = jwt.decode(token) as JwtToken<UserDetails>;
        const foundUser = await this.userProvider(user.username);

        if(!foundUser) {
            return null;
        }

        try {
            jwt.verify(token, this.secret)
            return foundUser;
        } catch {
            return null;
        } 
    }

}

export interface JwtToken<T extends UserDetails> {
    iat: number;
    exp: number;
    user: T;
}

export interface ExplicitJwtToken<T extends UserDetails> {
    token: string;
    user: T;
}