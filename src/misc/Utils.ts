import { Class } from "./CustomTypes";
import fs from "fs";

export default class Utils {
    public static instanceOf<T>(target, clazz: Class<T>): boolean {
        const classKeys = Object.keys(new clazz());
        return Object.keys(target).filter(key => !classKeys.includes(key)).length == 0;
    }

    public static isDirectory(path): boolean {
        try {
            const stat = fs.lstatSync(path);
            return stat.isDirectory();
        } catch (e) {
            return false;
        }
    }

    public static getSourceFiles(path: string): string[] {
        const out: string[] = [];
        const files = fs.readdirSync(path);

        for (const file of files) {
            if(this.isDirectory(path + file)) {
                const result = this.getSourceFiles(path + file + '\\');

                if(result.length !== 0) {
                    out.push(...result);
                }

                continue;
            }

            if(file.endsWith(".js") && file[0].toUpperCase() === file[0]) {
                out.push(path + file);
            }
        }

        return out;
    }
}