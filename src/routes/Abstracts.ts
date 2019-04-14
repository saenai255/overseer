import { IncomingMessage, ServerResponse } from "http";
import { UserDetails } from "../security/user-details";

export class Abstracts<B, P, Q> {
    public raw: RawAbstracts;
    public body: B;
    public queryParams: Q;
    public pathParams: P;
    public user?: UserDetails;
}

export class RawAbstracts {
    public request: IncomingMessage;
    public response: ServerResponse;
}

export class PathInfo extends Abstracts<any, any, any> { }