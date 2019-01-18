import { IncomingMessage, ServerResponse } from "http";

export default class Abstracts {
    public raw: RawAbstracts;
    public body: any;
    public queryParams: any;
    public pathParams: any;
}

export class RawAbstracts {
    public request: IncomingMessage;
    public response: ServerResponse;
}