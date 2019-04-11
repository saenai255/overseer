import { Class } from "../misc/custom-types";
import Utils from "../misc/utils";
import { GlobalConfig } from "../configs/global";


export class RequisiteManager {
    private classList = [];
    private instanceList = [];

    public addClass(clazz: Class<any>) {
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

    public findClassesFromSourceFiles(path: string, pack = false): void {
        const files = Utils.getSourceFiles(path);
        GlobalConfig.isLibraryPackage = pack;

        files.forEach(file => require(file));
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

export const Requisites =  new RequisiteManager();