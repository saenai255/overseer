import Overseer from "./Overseer";
import { Class } from "../misc/CustomTypes";
import Utils from "../misc/Utils";
import { logger } from "..";

export default class Requisites {
    public static pack(module: NodeModule) {

    }

    public static add(instance) {
        Requisites.all().push(instance);
    }

    public static find<T>(clazz: Class<T>): T {
        return Requisites.all().find(x => x instanceof clazz);
    }

    public static findByName<T>(name: string): T {
        return Requisites.all().find(x => x.__proto__.constructor.name === name) as T;
    }

    public static findAll<T>(clazz: Class<T>): T[] {
        return Requisites.all().filter(x => x instanceof clazz);
    }

    public static findClassesFromSourceFiles(path: string): any[] {
        const foundClasses = [];
        const files = Utils.getSourceFiles(path);

        files.map(file => require(file))
            .filter(script => !!script)
            .filter(script => !!script.default)
            .filter(script => !!script.default.prototype)
            .filter(script => !!script.default.prototype.isPrerequisite)
            .map(script => script.default)
            .filter(clazz => !foundClasses.includes(clazz))
            .forEach(clazz => foundClasses.push(clazz));

        logger.info(this, 'Found a total of {} prerequisites in root path `{}`', foundClasses.length, path);
        return foundClasses;
    }

    private static all(): any[] {
        const overseer = (<any>Overseer).instance;

        if(!overseer) {
            throw new Error('Overseer instance could not be found');
        }

        return overseer.requisiteInstances as any[];
    }
}