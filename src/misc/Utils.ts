import { Class } from "./CustomTypes";
import fs from "fs";
import path from "path"


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

    public static getSourceFiles(relativePath: string): string[] {
        const out: string[] = [];
        const files = fs.readdirSync(relativePath);

        for (const file of files) {
            const currentPath = path.join(relativePath, file);
            if(this.isDirectory(currentPath)) {
                const result = this.getSourceFiles(currentPath);

                if(result.length !== 0) {
                    out.push(...result);
                }

                continue;
            }

            if(file.endsWith(".js") && file[0].toUpperCase() === file[0]) {
                out.push(path.join(relativePath, file));
            }
        }

        return out;
    }
}