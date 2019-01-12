import fs from "fs";
import Router from "./Router";
import Route from "./Route";
import ResourceManager from "./ResourceManager";
import MimeFinder from "../utils/MimeFinder";

export default class Overseer {

    public static emerge(nodeModule: NodeModule, port: number): void {
        const paths = nodeModule.filename.split('\\');
        const baseDir = nodeModule.filename.replace(paths[paths.length - 1], '');

        const instance = new Overseer(baseDir, port);
        Overseer.instance = instance;
        instance.loadClasses();
        instance.instances = [ instance, instance.router ];
        instance.createInstances();
        instance.setupRouter();
    }

    public static getRequisite<T>(name: string): T {
        if(!Overseer.instance) {
            throw new Error('Overseer:\tCould not find instance');
        }

        return Overseer.instance.instances.find(x => x.__proto__.constructor.name === name) as T;
    }

    public static addRequisite(instance: any): void {
        if(!Overseer.instance) {
            throw new Error('Overseer:\tCould not find instance');
        }

        Overseer.instance.instances.push(instance);
    }

    public static getRouter(): Router {
        if(!Overseer.instance) {
            throw new Error('Overseer:\tCould not find instance');
        }

        return Overseer.instance.router;
    }

    private static instance: Overseer;


    private router: Router;

    private basePath: string;
    private prerequisites: any[] = [];
    private instances: any[] = [];

    private constructor(basePath: string, port: number) {
        this.basePath = basePath;

        const mimeFinder = new MimeFinder();
        const resMgr = new ResourceManager(basePath, mimeFinder);

        this.router = new Router(port, resMgr);
        console.info(`Overseer:\tInitialized in base directory ${basePath}`);
    }

    private setupRouter(): void {
        this.router.routes.forEach((route: Route) => {
            const controller = Overseer.getRequisite(route.handlerName);
            route.handler.bind(controller);
        })
        this.router.init();
    }

    private createInstances(): void {
        const created = [];
        let waiting = [];

        this.prerequisites.forEach(clazz => {
            waiting.push(new clazz());
        });

        while(waiting.length !== 0) {
            waiting.forEach(instance => {
                this.checkAndAddDependencies(instance, created);

                if(!instance.prerequisites || instance.prerequisites.length === 0) {
                    created.push(instance);
                    if(!!instance.__proto__.onInit) {
                        instance.__proto__.onInit.bind(instance).call();
                    }

                    waiting = waiting.filter(x => x !== instance);
                }
            });
        }

        this.instances.push(...created);
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
        this.prerequisites = [];

        const files = this.sourceFiles(this.basePath);

        files.forEach(file => {
            const clazz = require(file);

            if(!clazz || !clazz.default || !clazz.default.prototype.isPrerequisite) {
                return;
            }

            if(this.prerequisites.includes(clazz.default)) {
                return;
            }

            this.prerequisites.push(clazz.default)
        });

        console.info(`Overseer:\tFound a total of ${this.prerequisites.length} prerequisites`);
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
