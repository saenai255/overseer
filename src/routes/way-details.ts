import Guard from "../security/guards/guard";
import { Class } from "../misc/custom-types";

export default class WayDetails {

    public static defaults(details: WayDetails): WayDetails {
        return {
            path: '/',
            method: 'get',
            statusCode: 200,
            produces: ['application/json'],
            consumes: ['application/json', 'multipart/form-data', 'application/x-www-form-urlencoded'],
            guards: [],
            ...details
        };
    }

    public path?: string;
    public method?: 'get' | 'post' | 'put' | 'patch' | 'delete' | 'head';
    public statusCode?: number;
    public produces?: string[];
    public consumes?: string[];
    public guards?: Array<Class<Guard>>;
}