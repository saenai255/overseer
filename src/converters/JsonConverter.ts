import Converter from "./Converter";
import Requisite from "../decorators/Requisite";
import Overseer from "../core/Overseer";

@Requisite
export default class JsonConverter extends Converter {
    getContentType(): string {
        return 'application/json';
    }

    canRead(target: string, contentType: string): boolean {
        return this.getContentType() === contentType;
    }
    
    canWrite(target: any, contentType: string): boolean {
        return this.getContentType() === contentType;
    }

    doWrite(target: any): string {
        return target ? JSON.stringify(target) : '';
    }

    doRead(target: string): any {
        return !target ? undefined : JSON.parse(target);
    }
}