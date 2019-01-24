import { Class } from "../misc/CustomTypes";

export default abstract class Converter {
    private isConverter: boolean;

    constructor() {
        this.isConverter = true;
    }

    abstract canRead(target: string, contentType: string): boolean;
    abstract canWrite(target: any, contentType: string): boolean;
 
    abstract doWrite(target: any): string;
    abstract doRead(target: string): any;
}