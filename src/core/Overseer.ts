import fs from "fs";
import Router from "./Router";
import Route from "./Route";

export default class Overseer {
    public static instance: Overseer;
    
    public static emerge(port: number): void {
        const paths = module.parent.filename.split('\\');
        const baseDir = module.parent.filename.replace(paths[paths.length - 1], '');
        
        const instance = new Overseer(baseDir, port);
        Overseer.instance = instance;
        instance.loadClasses();
        instance.createInstances();
        instance.setupRouter();
    }
    
    public router: Router;

    private basePath: string;
    private prerequisites: any[] = [];
    private instances: any[] = [];
    
    constructor(basePath: string, port: number) {
        this.basePath = basePath;
        this.router = new Router(port);
        console.info(`Overseer:\tInitialized in base directory ${basePath}`);
    }

    public setupRouter(): void {
        this.router.routes.forEach((route: Route) => {
            const controller = this.getRequisite(route.handlerName);
            route.handler.bind(controller);
        })
        this.router.init();
    }

    public getRequisite(name: string): any {
        return this.instances.find(x => x.__proto__.constructor.name === name);
    }

    public createInstances(): void {
        const created = [];
        let waiting = [];
        this.instances = [];

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

    public checkAndAddDependencies(instance: any, created: any[]): void {
        created.forEach(c => {
            if(instance.prerequisites.includes(c.constructor)) {
                const propName = c.constructor.name[0].toLowerCase() + c.constructor.name.substring(1);
                instance[propName] = c;
                instance.prerequisites = instance.prerequisites.filter(x => x !== c.constructor);
            }
        });
    }

    public loadClasses(): void {
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