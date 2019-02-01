import fs from "fs";
import Router from "../routes/Router";
import Route from "../routes/Route";
import ResourceManager from "./ResourceManager";
import MimeFinder from "../misc/MimeFinder";
import DependencyUtils from "./DependencyUtils";
import Converter from "../converters/Converter";
import Authentication from "../security/authentications/Authentication";
import logger from "../misc/Logger";
import Requisites from "./Requisites";
import { performance } from "perf_hooks";
import { Class } from "../misc/CustomTypes";

export default class Overseer {
    private static instance: Overseer;
    
    private requisiteClasses: any[];
    private requisiteInstances: any[];

    private constructor(private basePath: string, private port: number) {
        Overseer.instance = Overseer.instance || this;

        this.requisiteInstances = [];
        this.requisiteClasses = [];

        logger.info(this, 'Initialized in base directory {}', basePath);
    }

    public static serve(nodeModule: NodeModule, port: number): void {
        const timeStart = performance.now();

        Overseer.instance = new Overseer(DependencyUtils.getBaseDir(nodeModule.filename), port);
        Overseer.instance.init();

        const timeEnd = performance.now();
        logger.info(this, 'Application started running in {} seconds on port {}', Math.ceil(timeEnd - timeStart) / 1000, port)
    }
    
    private init(): void {
        this.loadPrerequisites();
        this.requisiteClasses = Requisites.findClassesFromSourceFiles(this.basePath);
        this.initializeRequisites();
        this.setupRouter();
        this.performLifeCycles();
    }

    private performLifeCycles(): void {
        this.requisiteInstances.forEach(instance => {
            // onInit
            if(!!instance.__proto__.onInit) {
                instance.__proto__.onInit.bind(instance).call();
            }


            // is configurer
            if(!!instance.__proto__.initialize) {
                const requisites: any[] = instance.__proto__.initialize.bind(instance).call();
                this.requisiteInstances.push(...requisites);
            }
        });

    }

    private loadPrerequisites(): void {
        this.requisiteInstances.push(this, new Router(this.port, new ResourceManager(this.basePath,  new MimeFinder())));
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
        let waiting = [];
        this.requisiteClasses.forEach(clazz => waiting.push(new clazz()));

        while(waiting.length !== 0) {
            waiting.forEach(instance => this.injectInstance(instance));
            waiting.filter(instance => !instance.prerequisites || instance.prerequisites.length === 0).forEach(instance => {
                this.requisiteInstances.push(instance);
                waiting = waiting.filter(x => x !== instance);
            });
        }
    }

    private injectInstance<T>(instance: Exclude<T, Class<T>>): T {
        this.requisiteInstances.filter(c => (<any>instance).prerequisites.includes(c.constructor.name)).forEach(c => {
            const propName = c.constructor.name[0].toLowerCase() + c.constructor.name.substring(1);
            instance[propName] = c;
            (<any>instance).prerequisites = (<any>instance).prerequisites.filter(x => x !== c.constructor.name);
        });

        return instance as T;
    }
}