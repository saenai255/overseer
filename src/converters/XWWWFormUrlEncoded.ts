import Converter from "./Converter";
import Requisite from "../decorators/Requisite";
import Overseer from "../core/Overseer";

@Requisite
export default class XWWWFormUrlEncoded extends Converter {
    getContentType(): string {
        return 'application/x-www-form-urlencoded';
    }

    canRead(target: string, contentType: string): boolean {
        return this.getContentType() === contentType;
    }
    
    canWrite(target: any, contentType: string): boolean {
        return false;
    }

    doRead(target: string): any {
        return !target ? undefined : this.parse(target);
    }

    private parse(body: string) {
        const result = {};
        body.split('&')
            .map(x => x.split('='))
            .map(x => {
                x[0] = decodeURIComponent(x[0].trim());
                x[1] = decodeURIComponent(x[1].trim());
                return x;
            })
            .forEach(x => result[x[0]] = x[1]);

        return result;
    }
}