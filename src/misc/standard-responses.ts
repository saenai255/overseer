import { Response } from "../routes/response";

const getBase = (code, status): Response => {
    return {
        body: {
            status,
            statusCode: code,
            timestamp: new Date().getTime(),
        },
        status: code
    }
}

export const BAD_REQUEST = getBase(400, 'BAD_REQUEST');
export const UNAUTHORIZED = getBase(401, 'UNAUTHORIZED');
export const PAYMENT_REQUIRED = getBase(402, 'PAYMENT_REQUIRED');
export const FORBIDDEN = getBase(403, 'FORBIDDEN');
export const NOT_FOUND = getBase(404, 'NOT_FOUND');
export const METHOD_NOT_ALLOWED = getBase(405, 'METHOD_NOT_ALLOWED');
export const NOT_ACCEPTABLE = getBase(406, 'NOT_ACCEPTABLE');
export const PROXY_AUTHENTICATION_REQUIRED = getBase(407, 'PROXY_AUTHENTICATION_REQUIRED');
export const REQUEST_TIMEOUT = getBase(408, 'REQUEST_TIMEOUT');
export const CONFLICT = getBase(409, 'CONFLICT');
export const GONE = getBase(410, 'GONE');
export const LENGTH_REQUIRED = getBase(411, 'LENGTH_REQUIRED');
export const PRECONDITION_FAILED = getBase(412, 'PRECONDITION_FAILED');
export const PAYLOAD_TOO_LARGE = getBase(413, 'PAYLOAD_TOO_LARGE');
export const URI_TOO_LONG = getBase(414, 'URI_TOO_LONG');
export const UNSUPPORTED_MEDIA_TYPE = getBase(415, 'UNSUPPORTED_MEDIA_TYPE');
export const RANGE_NOT_SATISFIABLE = getBase(416, 'RANGE_NOT_SATISFIABLE');
export const EXPECTATION_FAILED = getBase(417, 'EXPECTATION_FAILED');
export const IM_A_TEAPOT = getBase(418, 'IM_A_TEAPOT');
export const MISDIRECTED_REQUEST = getBase(421, 'MISDIRECTED_REQUEST');
export const UNPROCESSABLE_ENTITY = getBase(422, 'UNPROCESSABLE_ENTITY');
export const LOCKED = getBase(423, 'LOCKED');
export const FAILED_DEPENDENCY = getBase(424, 'FAILED_DEPENDENCY');
export const UPGRADE_REQUIRED = getBase(426, 'UPGRADE_REQUIRED');
export const PRECONDITION_REQUIRED = getBase(428, 'PRECONDITION_REQUIRED');
export const TOO_MANY_REQUESTS = getBase(429, 'TOO_MANY_REQUESTS');
export const REQUEST_HEADER_FIELDS_TOO_LARGE = getBase(431, 'REQUEST_HEADER_FIELDS_TOO_LARGE');
export const UNAVAILABLE_FOR_LEGAL_REASONS = getBase(451, 'UNAVAILABLE_FOR_LEGAL_REASONS');
export const INTERVAL_SERVER_ERROR = getBase(500, 'INTERVAL_SERVER_ERROR');