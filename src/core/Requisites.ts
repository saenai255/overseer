import { Class } from "../misc/CustomTypes";
import Utils from "../misc/Utils";
import { logger } from "..";
import path from "path";
import GlobalConfig from "../configs/GlobalConfig";
import Requisite from "../decorators/Requisite";


export class RequisiteManager {
    private classList = [];
    private instanceList = [];

    public pack(module: NodeModule) {
        return RequisitePackage.of(
            ...this.findClassesFromSourceFiles(path.join(module.filename, '..'), true)
        )
    }

    public addClass(clazz: Class<any>) {
        Requisite(clazz);
        debugger
        this.classList.push(clazz);
    }

    public addInstance(instance) {
        this.instanceList.push(instance);
    }

    public find<T>(clazz: Class<T>): T {
        return this.instanceList.find(x => x instanceof clazz);
    }

    public findByName<T>(name: string): T {
        return this.instanceList.find(x => x.__proto__.constructor.name === name) as T;
    }

    public findAll<T>(clazz: Class<T>): T[] {
        return this.instanceList.filter(x => x instanceof clazz);
    }

    public findClassesFromSourceFiles(path: string, pack = false): Class<any>[] {
        const foundClasses = [];
        const files = Utils.getSourceFiles(path);
        GlobalConfig.isLibraryPackage = pack;

        files.map(file => require(file))
            .filter(script => !!script)
            .filter(script => !!script.default)
            .filter(script => !!script.default.prototype)
            .filter(script => !!script.default.prototype.isPrerequisite)
            .map(script => script.default)
            .filter(clazz => !foundClasses.includes(clazz))
            .forEach((clazz, i) => (foundClasses.push(clazz), logger.debug(this, 'Found requisite class {} in file `{}`', clazz.prototype.constructor.name, files[i])));

        logger.info(this, '{} a total of {} requisites from sources path `{}`', pack ? 'Packed' : 'Loaded', foundClasses.length, path);
        return foundClasses;
    }

    public instances() {
        return this.instanceList;
    }

    public classes() {
        return this.classList;
    }
}

export class RequisitePackage {
    public classList: Class<any>[];

    public static of(...classes: Class<any>[]): RequisitePackage {
        const pack = new RequisitePackage();
        pack.classList = classes;
        return pack;
    }
}

export default new RequisiteManager();