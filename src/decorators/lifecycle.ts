import { MetaInstance } from "../misc/custom-types";

const enhanceDescriptor = (type: LifecycleEventType) => 
    (target: MetaInstance /* instance */ | any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    if(!target.__shadowMeta) {
        target.__shadowMeta = {
            lifecycle: { }
         }
    }

    target.__shadowMeta.lifecycle[type] = (descriptor.value as () => void);

    return descriptor;
}

export function LifecycleEvent(type: LifecycleEventType): any {
    return enhanceDescriptor(type);
};

export function OnInit() {
    return enhanceDescriptor('onInit');
};

export function AfterInit() {
    return enhanceDescriptor('afterInit');
};

export type LifecycleEventType = 'onInit' | 'afterInit';

export interface LifecycleCallbacks {
    onInit?: () => void;
    afterInit?: () => void;
}