import React from "react";
import {Sound} from "@lib/game/game/elements/sound";
import {Src} from "@lib/game/game/elements/srcManager";
import {EventDispatcher} from "@lib/util/data";
import {Image} from "@lib/game/game/elements/image";
import {Utils} from "@lib/game/game/common/Utils";

export type PreloadedSrcTypes = "image" | "audio" | "video";
export type PreloadedSrc<T extends PreloadedSrcTypes = undefined> = ({
    type: "image"; src: Image; preloaded: React.ReactElement;
} | {
    type: "audio"; src: Sound;
} | {
    type: "video"; src: string; preloaded: React.ReactElement;
}) & (T extends undefined ? {} :
    ({
        type: T;
    } & T extends "image" ? { src: Image; preloaded: React.ReactElement } :
        T extends "audio" ? { src: Sound } :
            T extends "video" ? { src: string; preloaded: React.ReactElement } : {}));

export type PreloadedEventTypes = {
    "event:preloaded.add": [PreloadedSrc | string];
    "event:preloaded.remove": [PreloadedSrc | string];
    "event:preloaded.change": [];
}

export class Preloaded {
    static EventTypes: { [K in keyof PreloadedEventTypes]: K } = {
        "event:preloaded.add": "event:preloaded.add",
        "event:preloaded.remove": "event:preloaded.remove",
        "event:preloaded.change": "event:preloaded.change",
    }
    preloaded: PreloadedSrc[] = [];
    events: EventDispatcher<PreloadedEventTypes> = new EventDispatcher();

    public add<T extends PreloadedSrcTypes = undefined>(src: PreloadedSrc<T>): this {
        if (this.has(this.getSrc(src))) return this;
        this.preloaded.push(src);
        this.events.emit(Preloaded.EventTypes["event:preloaded.add"], src);
        this.events.emit(Preloaded.EventTypes["event:preloaded.change"]);
        return this;
    }

    public get<T extends PreloadedSrcTypes = undefined>(src: string): PreloadedSrc<T> | undefined {
        return this.preloaded.find(p => this.getSrc(p) === src);
    }

    public has(src: string): boolean;
    public has(src: string[]): boolean;
    public has(src: string | string[]): boolean {
        if (Array.isArray(src)) {
            return src.every(s => this.has(s));
        }
        return this.preloaded.some(p => this.getSrc(p) === src);
    }

    public remove(src: string): this;
    public remove(src: PreloadedSrc): this;
    public remove(src: string[]): this;
    public remove(src: PreloadedSrc[]): this;
    public remove(src: string | PreloadedSrc | string[] | PreloadedSrc[]): this {
        if (Array.isArray(src)) {
            const removeNeeded = src.map(s => this.getSrc(s));
            this.preloaded = this.preloaded.filter(p => !removeNeeded.includes(this.getSrc(p)));
            return this;
        }
        const thisSrc = this.getSrc(src);
        this.preloaded = this.preloaded.filter(p => this.getSrc(p) !== thisSrc);
        this.events.emit(Preloaded.EventTypes["event:preloaded.remove"], src);
        this.events.emit(Preloaded.EventTypes["event:preloaded.change"]);
        return this;
    }

    public clear(): this {
        this.preloaded = [];
        return this;
    }

    getSrc(src: Src | string): string {
        if (typeof src === "string") {
            return src;
        }
        if (src.type === "image") {
            return Utils.srcToString(src.src.state.src);
        } else if (src.type === "video") {
            return src.src;
        } else if (src.type === "audio") {
            return src.src.getSrc();
        }
        return "";
    }
}
