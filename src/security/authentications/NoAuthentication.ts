import Authentication from "./Authentication";
import { IncomingMessage } from "http";
import Abstracts from "../../routes/Abstracts";
import UserDetails from "../UserDetails";

export default class NoAuthentication extends Authentication  {
    public async authenticate(info: Abstracts<any, any, any>): Promise<UserDetails> {
        return null;
    }
}