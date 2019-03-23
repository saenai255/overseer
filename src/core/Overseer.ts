import fs from "fs";
import Router from "../routes/Router";
import Route from "../routes/Route";
import Resources from "./Resources";
import MimeFinder from "../misc/MimeFinder";
import logger from "@jeaks03/logger";
import Requisites, { RequisitePackage } from "./Requisites";
import { performance } from "perf_hooks";
import { Class, EventType } from "../misc/CustomTypes";
import path from "path";
import Requisite from "../decorators/Requisite";
import FormDataConverter from "../converters/FormDataConverter";
import JsonConverter from "../converters/JsonConverter";
import XWWWFormUrlEncoded from "../converters/XWWWFormUrlEncoded";
import Authorizer from "../security/Authorizer";
import GlobalConfig from "../configs/GlobalConfig";
import Events, { IEvents } from "./Events";
import { eventNames } from "cluster";

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
        Requisites.findClassesFromSourceFiles(this.basePath).forEach(clazz => Requisites.addClass(clazz));
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
        Requisites.addClass(FormDataConverter);
        Requisites.addClass(JsonConverter);
        Requisites.addClass(XWWWFormUrlEncoded);
        Requisites.addClass(Authorizer);

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
        let waiting = [];
        Requisites.classes().forEach(clazz => waiting.push(new clazz()));

        while(waiting.length !== 0) {
            waiting.forEach(instance => this.injectInstance(instance));
            waiting.filter(instance => !instance.prerequisites || instance.prerequisites.length === 0).forEach(instance => {
                Requisites.addInstance(instance);
                waiting = waiting.filter(x => x !== instance);
            });
        }
    }

    private injectInstance<T>(instance: Exclude<T, Class<T>>): T {
        Requisites.instances().filter(c => (<any>instance).prerequisites.includes(c.constructor.name)).forEach(c => {
            const propName = c.constructor.name[0].toLowerCase() + c.constructor.name.substring(1);
            instance[propName] = c;
            (<any>instance).prerequisites = (<any>instance).prerequisites.filter(x => x !== c.constructor.name);
        });

        return instance as T;
    }
}