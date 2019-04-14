import { EventType, Event } from "../misc/custom-types";

export interface IEvents {
    register(type: EventType, event: Event): void;

    dispatch(type: EventType): void
}

export class Events {
    private events: { type: EventType, handle: Event }[];

    constructor() {
        this.events = [];
    }

    public register(type: EventType, event: Event): void {
        this.events.push({type, handle: event});
    }

    private dispatch(type: EventType): void {
        this.events.filter(event => event.type === type).forEach(event => event.handle());
    }
}