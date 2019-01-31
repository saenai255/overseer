import Overseer from "./Overseer";
import { Class } from "../misc/CustomTypes";
import Utils from "../misc/Utils";
import { logger } from "..";

export default class Requisites {
    public static pack(module: NodeModule) {

    }

    public static add(instance) {
        Requisites.retrieveList().push(instance);
    }

    public static find<T>(clazz: Class<T>): T {
        return Requisites.retrieveList().find(x => x instanceof clazz);
    }

    public static findByName<T>(name: string): T {
        return Requisites.retrieveList().find(x => x.__proto__.constructor.name === name) as T;
    }

    public static findAll<T>(clazz: Class<T>): T[] {
        return Requisites.retrieveList().filter(x => x instanceof clazz);
    }

    public static injectClass<T>(clazz: Class<T>): T {
        return Requisites.injectInstance<any>(new (<any>clazz));
    }

    public static injectInstance<T>(instance: Exclude<T, Class<T>>): T {
        Requisites.retrieveList().filter(c => (<any>instance).prerequisites.includes(c.constructor.name)).forEach(c => {
            const propName = c.constructor.name[0].toLowerCase() + c.constructor.name.substring(1);
            instance[propName] = c;
            (<any>instance).prerequisites = (<any>instance).prerequisites.filter(x => x !== c.constructor.name);
        });

        return instance as T;
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

    private static retrieveList(): any[] {
        const overseer = (<any>Overseer).instance;

        if(!overseer) {
            throw new Error('Overseer instance could not be found');
        }

        return overseer.requisiteInstances as any[];
    }
}