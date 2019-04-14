import logger from "@jeaks03/logger";
import { Requisites, ComposedPackage, ComposedPackageImpl } from "./requisites";
import { performance } from "perf_hooks";
import { EventType, MetaInstance, MetaClass, Class, AsyncFunction, ShadowMeta } from "../misc/custom-types";
import path from "path";
import { GlobalConfig } from "../configs/global";
import { Events, IEvents } from "./events";
import { Resources } from "./resources";
import { MimeFinder } from "../misc/mime-finder";
import { Router } from "../routes/router";
import { Route } from "../routes/route";
import { LifecycleEventType } from "../decorators/lifecycle";

export class Overseer {
    private static instance: Overseer;
    private static packages: ComposedPackageImpl[] = [];

    private constructor(private port: number) {
        Overseer.instance = Overseer.instance || this;
        logger.info(this, 'Initialized in base directory {}', this.basePath);
    }

    public static loadPackages(packages: ComposedPackage[]): typeof Overseer {
        packages.forEach(pack => Overseer.packages.push(pack as ComposedPackageImpl));
        return Overseer;
    }

    public static composePackage(nodeModule: NodeModule): ComposedPackage {
        return new ComposedPackageImpl(nodeModule);
    }

    public static serve(port: number): void {
        const timeStart = performance.now();

        Overseer.instance = new Overseer(port);
        Overseer.instance.init().then(() => {
            const timeEnd = performance.now();
            logger.info(this, 'Application started running in {} seconds', Math.ceil(timeEnd - timeStart) / 1000)
        });

    }

    private get basePath(): string {
        let rootModule = module;
        while(rootModule.parent) {
            rootModule = rootModule.parent;
        }

        return path.join(rootModule.filename, '..');
    }
    
    private async init(): Promise<void> {
        this.loadPrerequisites();
        this.loadLibs();
        await this.initializeRequisites();
        // this.setupRouter();
        await this.triggerAfterStartupLifecycle();
        
        logger.info(this, '{} a total of {} requisites from sources', GlobalConfig.isLibraryPackage ? 'Packed' : 'Loaded', Requisites.instances().length);
    }

    private loadLibs(): void {
        Requisites.findClassesFromSourceFiles(this.basePath);

        const myModule = module;
        Overseer.packages
            .map(item => path.join(item.module.filename, '..'))
            .forEach(item => Requisites.findClassesFromSourceFiles(item));
    }

    private loadPrerequisites(): void {
        const resources = new Resources(this.basePath,  new MimeFinder());

        Requisites.addInstance(new Events());
        Requisites.addInstance(this);
        Requisites.addInstance(resources);
        Requisites.addInstance(new Router(this.port, resources));
    }

    private setupRouter(): void {
        const router = Requisites.find(Router);

        router.routes.forEach((route: Route) => {
            const controller = Requisites.findByName(route.handlerName);
            route.handler.bind(controller);
        });

        router.initializeServer();
    }

    private async initializeRequisites(): Promise<void> {
        // tslint:disable-next-line: array-type
        let metaClasses: MetaClass<any>[] = [ ...Requisites.classes() ];

        const addInstance = (metaClass: MetaClass<any>, metaInstance: MetaInstance) => {
            if(!Requisites.instances().includes(metaInstance)) {
                Requisites.instances().push(metaInstance);
            }
        };

        const removeMetaClass = (metaClass: MetaClass<any>, metaClassesParam: Array<MetaClass<any>>): Array<MetaClass<any>> => {
            return metaClassesParam.filter(item => item !== metaClass);
        }

        // Should be enough
        let stackLimit = 5000;
        while(metaClasses.length !== 0) {
            for(const metaClass of metaClasses) {
                // Constructor doesn't require any other dependencies
                if(!metaClass.prototype.__shadowMeta.required) {
                    metaClass.prototype.__shadowMeta.required = []; // Just in case
                }

                // Dependencies are not instantiated yet
                if(!this.canInstantiate(metaClass)) {
                    continue;
                }

                // All OK. Create instance and add to array
                addInstance(metaClass, await this.instantiateMetaClass(metaClass));
                // Update remaining meta classes
                metaClasses = removeMetaClass(metaClass, metaClasses);
            }

            if(--stackLimit < 0) {
                logger.error(this, 'Exceeded maximum iteration count for dependency injection. Check for circular dependencies in the following classes: {}', metaClasses);
                throw new Error(`Dependency injection stack overflow!`)
            }
        }
    }

    private async instantiateMetaClass(metaClass: MetaClass<any>): Promise<MetaInstance> {
        const required = metaClass.prototype.__shadowMeta.required as Array<MetaClass<any>> || [];
        const args = [];

        for(const requiredClass of required) {
            for(const resource of Requisites.instances()) {
                if(requiredClass === resource.constructor) {
                    args.push(resource);
                    break;
                }
            }
        }

        const metaInstance = new metaClass(...args) as MetaInstance
        await this.performLifecycle(metaInstance, 'onInit');

        return metaInstance;
    }

    private async triggerAfterStartupLifecycle() {
        const metaInstances: MetaInstance[] = Requisites.instances();

        for(const metaInstance of metaInstances) {
            await this.performLifecycle(metaInstance, 'afterInit');
        }
    }

    private async performLifecycle(metaInstance: MetaInstance, lifecycle: LifecycleEventType) {
        const shadowMeta: ShadowMeta = (metaInstance as any).__proto__.__shadowMeta;

        if(!shadowMeta || !shadowMeta.lifecycle || !shadowMeta.lifecycle[lifecycle]) {
            return;
        }

        const fn: () => void = shadowMeta.lifecycle[lifecycle].bind(metaInstance);

        if(fn) {
            if(fn instanceof AsyncFunction) {
                await fn();
            } else {
                fn()
            }
        }
    }

    private canInstantiate(metaClass: MetaClass<any>) {
        const required = [ ...metaClass.prototype.__shadowMeta.required as Array<MetaClass<any>> ];

        for(const requiredClass of required) {
            let found = false;

            for(const resource of Requisites.instances()) {
                if(requiredClass === resource.constructor) {
                    found = true;
                    break;
                }
            }

            if(!found) {
                return false;
            }
        }

        return true;
    }
}