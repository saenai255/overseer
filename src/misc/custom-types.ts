import { UserDetails } from "../security/user-details";
import { Route } from "../routes/route";
import { LifecycleCallbacks } from "../decorators/lifecycle";

export interface Class<T> {
    new (...args: any[]): T,
    length: number,
    name: string,
}

export interface MetaInstance {
    __shadowMeta: ShadowMeta
}

export interface MetaClass<T> extends Class<T> {
    prototype: MetaInstance;
}

export interface UserProvider extends Function { (username: string): UserDetails | Promise<UserDetails> };
export const AsyncFunction = (async () => {}).constructor;

export interface ShadowMeta {
    isRequisite?: boolean;
    routes?: Route[];
    required?: any[] | Array<MetaClass<any>>;
    lifecycle?: LifecycleCallbacks;
}

declare type ClassDecorator = <T extends Function>(target: T) => T | void;
declare type MethodDecorator = <T>(target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<T>) => TypedPropertyDescriptor<T> | void;

export interface Event extends Function { (): void };
export enum EventType {
    AfterFinishStartup
}