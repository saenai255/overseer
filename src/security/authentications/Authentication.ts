import { IncomingMessage } from "http";
import Abstracts from "../../routes/Abstracts";
import UserDetails from "../UserDetails";
import { UserProvider } from "../../misc/CustomTypes";

export default abstract class Authentication {
    constructor(protected userProvider: UserProvider) {
    }

    public abstract authenticate(info: Abstracts<any, any, any>): UserDetails;
}