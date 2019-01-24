import { IncomingMessage } from "http";
import Abstracts from "../../misc/Abstracts";
import UserDetails from "../UserDetails";

export default abstract class Authentication {
    constructor(protected userProvider: (username: string) => UserDetails) {
    }

    public abstract authenticate(info: Abstracts<any, any, any>): UserDetails;
}