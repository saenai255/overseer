import { IncomingMessage, ServerResponse } from "http";

export default class Abstracts<B, P, Q> {
    public raw: RawAbstracts;
    public body: B;
    public queryParams: Q;
    public pathParams: P;
}

export class RawAbstracts {
    public request: IncomingMessage;
    public response: ServerResponse;
}