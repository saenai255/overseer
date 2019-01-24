import { IncomingMessage } from "http";
import Abstracts from "../misc/Abstracts";

export default abstract class Authorization {
    private isAuthorization: boolean;

    constructor() {
        this.isAuthorization = true;
    }

    public abstract getUser(info: Abstracts<any, any, any>): any;
}