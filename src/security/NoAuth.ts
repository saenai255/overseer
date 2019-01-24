import Authorization from "./Authorization";
import { IncomingMessage } from "http";
import Abstracts from "../misc/Abstracts";

export default class NoAuth extends Authorization {

    public getUser(info: Abstracts<any, any, any>) {
        return null;
    }

}