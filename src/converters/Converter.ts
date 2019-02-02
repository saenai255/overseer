import { Class } from "../misc/CustomTypes";

export default class Converter {
    public getContentType(): string {
        throw new Error('Method not implemented');
    }

    public canRead(target: string, contentType: string): boolean { 
        throw new Error('Method not implemented');
    }

    public canWrite(target: any, contentType: string): boolean { 
        throw new Error('Method not implemented');
    }
 
    public doWrite(target: any): string { 
        throw new Error('Method not implemented');
    }

    public doRead(target: string): any { 
        throw new Error('Method not implemented');
    }
}