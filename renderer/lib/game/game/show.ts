import {StaticImageData as _NextJSStaticImageData} from 'next/image';
import {IPosition} from "@lib/game/game/elements/transform/position";


export type color = string | {
    r: number;
    g: number;
    b: number;
    a?: number;
}

export type RGBColor = {
    r: number;
    g: number;
    b: number;
}

export type RGBAColor = RGBColor & {
    a: number;
}

export type Color = {
    color: color;
}

export type CommonText = {
    text: string;
} & Color;

export type NextJSStaticImageData = _NextJSStaticImageData;

export type Background = {
    background: {
        url: string;
    } | color | null | undefined | NextJSStaticImageData;
}

export type CommonImagePosition = "left" | "center" | "right";
export type CommonImage = {
    height?: number;
    width?: number;
    scale?: number;
    rotation?: number;
    position?: IPosition;
    opacity: number;
}

export const ImagePosition: {
    [K in CommonImagePosition]: K;
} = {
    center: "center",
    left: "left",
    right: "right"
} as const;