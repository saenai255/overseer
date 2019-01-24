import Converter from "./Converter";
import Requisite from "../decorators/Requisite";
import Overseer from "../core/Overseer";

@Requisite
export default class JsonConverter extends Converter {
    private type = 'application/json';

    canRead(target: string, contentType: string): boolean {
        return contentType === this.type;
    }
    
    canWrite(target: any, contentType: string): boolean {
        return contentType === this.type;
    }

    doWrite(target: any): string {
        return JSON.stringify(target);
    }

    doRead(target: string): any {
        return !target ? undefined : JSON.parse(target);
    }
}