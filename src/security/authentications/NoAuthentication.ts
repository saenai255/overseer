import Authentication from "./Authentication";
import { IncomingMessage } from "http";
import Abstracts from "../../routes/Abstracts";
import UserDetails from "../UserDetails";

export default class NoAuthentication extends Authentication  {
    public authenticate(info: Abstracts<any, any, any>): UserDetails {
        return null;
    }
}