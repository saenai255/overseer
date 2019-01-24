import fs from "fs";
import Router from "../routes/Router";
import Route from "../routes/Route";
import ResourceManager from "./ResourceManager";
import MimeFinder from "../misc/MimeFinder";
import DependencyUtils from "./DependencyUtils";
import { Class } from "../misc/CustomTypes"
import Converter from "../converters/Converter";
import Authentication from "../security/authentications/Authentication";

export default class Overseer {
    private static instance: Overseer;
    
    private router: Router;
    private basePath: string;
    private requisiteClasses: any[] = [];
    private requisiteInstances: any[] = [];

    private constructor(basePath: string, port: number) {
        this.basePath = basePath;
        this.router = new Router(port, new ResourceManager(basePath,  new MimeFinder()));
        this.requisiteInstances = [];

        console.info(`Overseer:\tInitialized in base directory ${basePath}`);
    }

    public static serve(nodeModule: NodeModule, port: number): void {
        const instance = new Overseer(DependencyUtils.getBaseDir(nodeModule.filename), port);
        Overseer.instance = instance;

        instance.loadClasses();
        instance.loadPrerequisites();
        instance.createInstances();
        instance.setupRouter();
        instance.performLifeCycles();
    }

    public static getAuthorization(): Authentication {
        if(!Overseer.instance) {
            throw new Error('Overseer:\tNot yet instantiated');
        }

        return Overseer.instance.requisiteInstances.find(x => x instanceof Authentication);
    }

    public static getConverters(): Converter[] {
        if(!Overseer.instance) {
            throw new Error('Overseer:\tNot yet instantiated');
        }

        return Overseer.instance.requisiteInstances.filter(x => x.isConverter) as Converter[];
    }

    public static getRequisite<T>(clazz: Class<T>): T {
        if(!Overseer.instance) {
            throw new Error('Overseer:\tNot yet instantiated');
        }

        return this.getRequisiteByName<T>(clazz.name);
    }

    public static getRequisiteByName<T>(name: string): T {
        if(!Overseer.instance) {
            throw new Error('Overseer:\tNot yet instantiated');
        }

        return Overseer.instance.requisiteInstances.find(x => x.__proto__.constructor.name === name) as T;
    }

    public static addRequisite(instance: any): void {
        if(!Overseer.instance) {
            throw new Error('Overseer:\tCould not find instance');
        }

        Overseer.instance.requisiteInstances.push(instance);
    }

    public static getRouter(): Router {
        if(!Overseer.instance) {
            throw new Error('Overseer:\tCould not find instance');
        }

        return Overseer.instance.router;
    }

    private performLifeCycles(): void {
        this.requisiteInstances.forEach(instance => this.handleLifeCycle(instance));

    }

    private loadPrerequisites(): void {
        this.requisiteInstances.push(this, this.router);
    }

    private setupRouter(): void {
        this.router.routes.forEach((route: Route) => {
            const controller = Overseer.getRequisiteByName(route.handlerName);
            route.handler.bind(controller);
        })
        this.router.init();
    }

    private createInstances(): void {
        let waiting = [];

        this.requisiteClasses.forEach(clazz => {
            waiting.push(new clazz());
        });

        while(waiting.length !== 0) {
            waiting.forEach(instance => {
                this.checkAndAddDependencies(instance, this.requisiteInstances);

                if(!instance.prerequisites || instance.prerequisites.length === 0) {
                    this.requisiteInstances.push(instance);
                    waiting = waiting.filter(x => x !== instance);
                }
            });
        }
    }

    private handleLifeCycle(instance: any) {
        // onInit
        if(!!instance.__proto__.onInit) {
            instance.__proto__.onInit.bind(instance).call();
        }


        // is configurer
        if(!!instance.__proto__.initialize) {
            const requisites: any[] = instance.__proto__.initialize.bind(instance).call();
            this.requisiteInstances.push(...requisites);
        }
    }

    private checkAndAddDependencies(instance: any, created: any[]): void {
        created.forEach(c => {
            if(instance.prerequisites.includes(c.constructor.name)) {
                const propName = c.constructor.name[0].toLowerCase() + c.constructor.name.substring(1);
                instance[propName] = c;
                instance.prerequisites = instance.prerequisites.filter(x => x !== c.constructor.name);
            }
        });
    }

    private loadClasses(): void {
        this.requisiteClasses = [];
        const files = this.sourceFiles(this.basePath);

        files.forEach(file => {
            const clazz = require(file);

            if(!clazz || !clazz.default || !clazz.default.prototype.isPrerequisite) {
                return;
            }

            if(this.requisiteClasses.includes(clazz.default)) {
                return;
            }

            this.requisiteClasses.push(clazz.default)
        });

        console.info(`Overseer:\tFound a total of ${this.requisiteClasses.length} prerequisites`);
    }

    private isDirectory(path): boolean {
        try {
            const stat = fs.lstatSync(path);
            return stat.isDirectory();
        } catch (e) {
            return false;
        }
    }

    private sourceFiles(path: string): string[] {
        const out: string[] = [];
        const files = fs.readdirSync(path);

        for (const file of files) {
            if(this.isDirectory(path + file)) {
                const result = this.sourceFiles(path + file + '\\');

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
