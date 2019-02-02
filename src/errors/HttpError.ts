import { ServerResponse } from "http";
import { INTERVAL_SERVER_ERROR } from "../misc/StandardResponses";
import Response from "../routes/Response";
import logger from "../misc/Logger";

export default class RouterError extends Error {
    constructor(public response: Response){
        super();
    }

    static handleServerError(serverResponse: ServerResponse, e: any) {
        console.error(e)
        new RouterError(INTERVAL_SERVER_ERROR).handle(serverResponse);
    }

    handle(serverResponse: ServerResponse) {
        serverResponse.writeHead(this.response.status, {'Content-Type': 'application/json'});
        serverResponse.write(!this.response.body ? '' : JSON.stringify(this.response.body));
        serverResponse.end();
    }
}