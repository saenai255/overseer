import { Class } from "./CustomTypes";

export default class Utils {
    public static instanceOf<T>(target, clazz: Class<T>): boolean {
        const classKeys = Object.keys(new clazz());
        return Object.keys(target).filter(key => !classKeys.includes(key)).length == 0;
    }
}