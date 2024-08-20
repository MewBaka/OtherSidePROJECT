import type {EventDispatcher} from "@lib/util/data";
import React from "react";
import {Scene} from "@lib/game/game/elements/scene";


export interface ITransition<T extends Record<string, any> = Record<string, any>> {
    events: EventDispatcher<EventTypes<[T]>>;

    start(onComplete?: () => void): void;

    toElementProps(): Record<string, any>;

    toElements(scene: Scene, props: Record<string, any>): React.ReactElement;
}

export type EventTypes<T extends any[]> = {
    "start": [null];
    "update": T;
    "end": [null];
};

export const TransitionEventTypes: {
    [K in keyof EventTypes<any>]: K;
} = {
    "start": "start",
    "update": "update",
    "end": "end",
} as {
    [K in keyof EventTypes<any>]: K;
};


