import { Class } from "../misc/custom-types";
import { GlobalConfig } from "../configs/global";
import { Utils } from "../misc/utils";
import { Requisite } from "../decorators/requisite";

export interface RestrictedRequisiteManager {
    addInstance: (instance, isController?: boolean) => void;
    find: <T>(clazz: Class<T>) => T;
    findByName: <T>(className: string) => T;
    findAll: <T>(clazz: Class<T>) => T[];
}

export class RequisiteManager implements RestrictedRequisiteManager {
    private classList = [];
    private instanceList = [];

    public addClass(clazz: Class<any>) {
        this.classList.push(clazz);
    }

    public addInstance(instance, isController = false) {
        if(isController) {
            Requisite(instance.__proto__.constructor);
        }
        
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

export interface ComposedPackage { }

export class ComposedPackageImpl implements ComposedPackage {
    constructor(private readonly nodeModule: NodeModule) { }

    get module(): NodeModule {
        return this.nodeModule;
    }
}

export const Requisites =  new RequisiteManager();