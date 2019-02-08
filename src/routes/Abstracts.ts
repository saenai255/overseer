import { IncomingMessage, ServerResponse } from "http";
import UserDetails from "../security/UserDetails";

export default class Abstracts<B, P, Q> {
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