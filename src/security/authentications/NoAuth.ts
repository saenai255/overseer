import Authentication from "./Authentication";
import { IncomingMessage } from "http";
import Abstracts from "../../misc/Abstracts";
import UserDetails from "../UserDetails";

export default class NoAuth extends Authentication {

    public authenticate(info: Abstracts<any, any, any>): UserDetails {
        return null;
    }

}