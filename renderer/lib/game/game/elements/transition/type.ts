import type {EventDispatcher} from "@lib/util/data";
import React from "react";
import {DOMKeyframesDefinition} from "framer-motion";

export type ElementProp<T extends Element = Element> =
    React.JSX.IntrinsicAttributes
    & React.ClassAttributes<T>
    & React.ImgHTMLAttributes<T>;
export type CSSElementProp<T extends React.CSSProperties | DOMKeyframesDefinition> = ElementProp & { style: T };

export interface ITransition<T extends ElementProp = {}> {
    events: EventDispatcher<EventTypes<[T]>>;

    start(onComplete?: () => void): void;

    toElementProps(): T[];
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
};


