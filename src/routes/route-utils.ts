import { IncomingMessage } from "http";

export default class RouteUtils {

    public static routeMatches(baseUrl: string, basePattern: string): boolean {
        let url = this.getBaseUrl(baseUrl);
        let pattern = basePattern;

        if(url.endsWith('/') && url.length >= 2) {
            url = url.substring(0, url.length - 2);
        }

        if(pattern.endsWith('/') && pattern.length >= 2) {
            pattern = pattern.substring(0, pattern.length - 2);
        }

        const urlParts = url.split('/');
        const patternParts = pattern.split('/');

        if (urlParts.length !== patternParts.length) {
            return false;
        }

        for (let i = 0; i < patternParts.length; i++) {
            const urlPart = urlParts[i];
            const patternPart = patternParts[i];

            if(patternPart.startsWith(':')) {
                continue;
            }

            if(urlPart.toLowerCase() !== patternPart.toLowerCase()) {
                return false;
            }
        }

        return true;
    }

    public static getBaseUrl(url: string): string {
        return url.split('?')[0].split('#')[0];
    }

    public static getUrlPattern(baseUrl: string): string[] {
        let path = baseUrl;

        if(path.startsWith('/')) {
            path = path.substring(1);
        }

        if(path.endsWith('/')) {
            path = path.substring(0, path.length - 1);
        }

        const url = this.getBaseUrl(path);
        return url.split('/');
    }

    public static parsePathParams(baseUrl: string, basePattern: string): object {
        let url = baseUrl;
        let pattern = basePattern;
        const out = {};

        if(url.endsWith('/') && url.length >= 2) {
            url = url.substring(0, url.length - 2);
        }

        if(pattern.endsWith('/') && pattern.length >= 2) {
            pattern = pattern.substring(0, pattern.length - 2);
        }

        const urlParts = url.split('/');
        const patternParts = pattern.split('/');

        for (let i = 0; i < patternParts.length; i++) {
            const urlPart = urlParts[i];
            const patternPart = patternParts[i];

            if(!patternPart.startsWith(':')) {
                continue;
            }

            out[patternPart.substring(1)] = this.parseValue(urlPart);
        }

        return out;
    }

    public static parseQueryParams(url: string): object {
        const out = {};
        const paramsArray = url.split('?');

        if(paramsArray.length <= 1) {
            return out;
        }

        const params = paramsArray[1];
        params.split('&').forEach((param: string) => {
            const [field, value] = param.split('=');
            out[field] = this.parseValue(value);
        })

        return out;
    }

    public static parseValue(value: string): any {
        if(!value) {
            return '';
        }

        if(value.includes(',')) {
            return value.split(',').map(val => this.parseValue(val));
        }

        if(value === 'true' || value === 'false') {
            return value === 'true';
        }

        if(value.includes('.') && !!parseFloat(value)) {
            return parseFloat(value);
        }

        if(!!parseInt(value, 10)) {
            return parseInt(value, 10);
        }

        return decodeURIComponent(value);
    }

    public static isMethod(serverRequest: IncomingMessage, method: string): boolean {
        return serverRequest.method.toLowerCase() === method.toLowerCase();
    }
}