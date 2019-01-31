import fs from "fs";
import Router from "../routes/Router";
import Route from "../routes/Route";
import ResourceManager from "./ResourceManager";
import MimeFinder from "../misc/MimeFinder";
import DependencyUtils from "./DependencyUtils";
import { Class } from "../misc/CustomTypes"
import Converter from "../converters/Converter";
import Authentication from "../security/authentications/Authentication";
import Utils from "../misc/Utils";
import logger from "../misc/Logger";
import Requisites from "./Requisites";
import { performance } from "perf_hooks";

export default class Overseer {
    private static instance: Overseer;
    
    private router: Router;
    private basePath: string;
    private requisiteClasses: any[] = [];
    private requisiteInstances: any[] = [];

    private constructor(basePath: string, port: number) {
        Overseer.instance = this;
        this.basePath = basePath;
        this.router = new Router(port, new ResourceManager(basePath,  new MimeFinder()));
        this.requisiteInstances = [];

        logger.info(this, 'Initialized in base directory {}', basePath);
    }

    public static serve(nodeModule: NodeModule, port: number): void {
        const timeStart = performance.now();

        Overseer.instance = new Overseer(DependencyUtils.getBaseDir(nodeModule.filename), port);
        Overseer.instance.initialize();

        const timeEnd = performance.now();
        logger.info(this, 'Application fully loaded in {} seconds', (timeEnd - timeStart) / 1000)
    }
    
    private initialize(): void {
        logger.info(this, 'im here')
        this.requisiteClasses = Requisites.findClassesFromSourceFiles(this.basePath);
        this.loadPrerequisites();
        this.initializeRequisites();
        this.setupRouter();
        this.performLifeCycles();
    }

    public static getAuthentication(): Authentication {
        if(!Overseer.instance) {
            throw new Error('Overseer:\t\tNot yet instantiated');
        }

        return Overseer.instance.requisiteInstances.find(x => x instanceof Authentication);
    }

    public static getConverters(): Converter[] {
        if(!Overseer.instance) {
            throw new Error('Overseer:\t\tNot yet instantiated');
        }

        return Overseer.instance.requisiteInstances.filter(x => x.isConverter) as Converter[];
    }

    public static getRouter(): Router {
        if(!Overseer.instance) {
            throw new Error('Overseer:\t\tCould not find instance');
        }

        return Overseer.instance.router;
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
        this.requisiteInstances.push(this, this.router);
    }

    private setupRouter(): void {
        this.router.routes.forEach((route: Route) => {
            const controller = Requisites.findByName(route.handlerName);
            route.handler.bind(controller);
        })
        this.router.init();
    }

    private initializeRequisites(): void {
        let waiting = [];
        this.requisiteClasses.forEach(clazz => waiting.push(new clazz()));

        while(waiting.length !== 0) {
            waiting.forEach(instance => Requisites.injectInstance(instance));
            waiting.filter(instance => !instance.prerequisites || instance.prerequisites.length === 0).forEach(instance => {
                this.requisiteInstances.push(instance);
                waiting = waiting.filter(x => x !== instance);
            });
        }
    }
}