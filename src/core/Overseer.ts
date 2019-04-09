import Router from "../routes/router";
import Route from "../routes/route";
import Resources from "./resources";
import MimeFinder from "../misc/mime-finder";
import logger from "@jeaks03/logger";
import { Requisites, RequisitePackage } from "./requisites";
import { performance } from "perf_hooks";
import { EventType, MetaInstance, MetaClass } from "../misc/custom-types";
import path from "path";
import Requisite from "../decorators/requisite";
import { GlobalConfig } from "../configs/global";
import Events, { IEvents } from "./events";

export default class Overseer {
    private static instance: Overseer;

    private constructor(private basePath: string, private port: number) {
        Overseer.instance = Overseer.instance || this;
        logger.info(this, 'Initialized in base directory {}', basePath);
    }

    public static loadPackages(packs: RequisitePackage[] = []) {
        packs.flatMap(pack => pack.classList).forEach(clazz => Requisites.addClass(clazz));
        return Overseer;
    }

    public static serve(nodeModule: NodeModule, port: number): void {
        const timeStart = performance.now();

        Overseer.instance = new Overseer(path.join(nodeModule.filename, '..'), port);
        Overseer.instance.init();

        const timeEnd = performance.now();
        logger.info(this, 'Application started running in {} seconds on port {}', Math.ceil(timeEnd - timeStart) / 1000, port)
    }
    
    private init(): void {
        this.loadPrerequisites();

        Requisites.findClassesFromSourceFiles(this.basePath);
        this.initializeRequisites();
        this.setupRouter();
        this.performLifeCycles();
        
        (Requisites.find(Events) as unknown as IEvents).dispatch(EventType.AfterFinishStartup);

        logger.info(this, '{} a total of {} requisites from sources', GlobalConfig.isLibraryPackage ? 'Packed' : 'Loaded', Requisites.instances().length);
    }

    private performLifeCycles(): void {
        Requisites.instances().forEach(instance => {
            // onInit
            if(!!instance.__proto__.onInit && !instance.__proto__.onInitCompleted) {
                instance.__proto__.onInit.bind(instance).call();
                instance.__proto__.onInitCompleted = true;
            }


            // is configurer
            if(!!instance.__proto__.initialize) {
                const requisites: any[] = instance.__proto__.initialize.bind(instance).call();
                requisites.forEach(requisiteInstance => (
                    Requisite(requisiteInstance.__proto__.constructor), 
                    Requisites.addInstance(requisiteInstance)))
            }
        });

    }

    private loadPrerequisites(): void {
        const resources = new Resources(this.basePath,  new MimeFinder());


        Requisites.addInstance(new Events());
      // Requisites.addClass(FormDataConverter);
      // Requisites.addClass(JsonConverter);
     //  Requisites.addClass(XWWWFormUrlEncoded);
      // Requisites.addClass(Authorizer);

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

        router.init();
    }

    private initializeRequisites(): void {
        debugger
        // tslint:disable-next-line: array-type
        let metaClasses: MetaClass<any>[] = [ ...Requisites.classes() ];
        const metaInstances: MetaInstance[] = [ ...Requisites.instances() ];

        const addInstance = (metaClass: MetaClass<any>, metaInstance: MetaInstance) => {
            metaClasses = metaClasses.filter(item => item !== metaClass);
            metaInstances.push(metaInstance);
        };

        // Should be enough
        let stackLimit = 5000;
        while(metaClasses.length !== 0) {
            for(const metaClass of metaClasses) {
                // Constructor doesn't require any other dependencies
                if(!metaClass.prototype.__shadowMeta.required) {
                    addInstance(metaClass, new metaClass());
                    continue;
                }

                // Dependencies are not instantiated yet
                if(!this.canInstantiate(metaClass, metaInstances)) {
                    continue;
                }

                // All OK. Create instance and add to array
                addInstance(metaClass, this.instantiateMetaClass(metaClass, metaInstances));
            }

            if(--stackLimit < 0) {
                logger.error(this, 'Exceeded maximum iteration count for dependency injection. Check for circular dependencies in the following classes: {}', metaClasses);
                throw new Error(`Dependency injection stack overflow!`)
            }
        }

        metaInstances.forEach(item => Requisites.addInstance(item));
    }

    private instantiateMetaClass(metaClass: MetaClass<any>, resources: any[]): MetaInstance {
        const required = metaClass.prototype.__shadowMeta.required as Array<MetaClass<any>>;
        const args = [];

        for(const requiredClass of required) {
            for(const resource of resources) {
                if(requiredClass === resource.constructor) {
                    args.push(resource);
                    break;
                }
            }
        }

        return new metaClass(...args) as MetaInstance;
    }

    private canInstantiate(metaClass: MetaClass<any>, resources: any[]) {
        const required = [ ...metaClass.prototype.__shadowMeta.required as Array<MetaClass<any>> ];

        for(const requiredClass of required) {
            let found = false;

            for(const resource of resources) {
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