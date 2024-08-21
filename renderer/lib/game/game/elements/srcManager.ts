import {Sound} from "@lib/game/game/elements/sound";
import {StaticImageData} from "@lib/game/game/show";
import {Image} from "@lib/game/game/elements/image";
import {Transform, Utils} from "@lib/game/game/common/core";
import {Constants} from "@lib/api/config";
import React from "react";

export type SrcType = "image" | "video" | "audio";
export type Src = {
    type: "image";
    src: Image;
} | {
    type: "video";
    src: string;
} | {
    type: "audio";
    src: Sound;
};

export class SrcManager {
    static SrcTypes: {
        [key in SrcType]: key;
    } = {
        image: "image",
        video: "video",
        audio: "audio",
    } as const;
    src: Src[] = [];

    static cacheablize(url: string, base: string): string {
        if (url.startsWith(Constants.app.request.cacheableRoute)) return url;
        if (!url.startsWith("/")) {
            const u = new URL(Constants.app.request.cacheableRoute);
            u.searchParams.append(Constants.app.request.cacheableRouteParam, url);
            return u.toString();
        }

        const separator = url.includes("?") ? "&" : "?";
        const urlSearchParams = new URLSearchParams();
        const target = base ? new URL(url, base) : null;
        urlSearchParams.append(
            Constants.app.request.cacheableRouteParam,
            `${target?.toString() || ""}${separator}${urlSearchParams.toString()}`
        );

        const endpoint = base ? new URL(Constants.app.request.cacheableRoute, base) : "";
        return `${endpoint.toString()}${endpoint.toString().endsWith("/") ? "": "/"}${separator}${urlSearchParams.toString()}`;
    }

    register(src: Src): this;
    register(src: Src[]): this;
    register(src: Sound): this;
    register(src: Image): this;
    register(type: SrcType, src: Src["src"]): this;
    register(arg0: Src | Src[] | SrcType | Sound | Image, src?: Src["src"]): this {
        if (Array.isArray(arg0)) {
            arg0.forEach(src => this.register(src));
        } else if (arg0 instanceof Sound) {
            if (this.isSrcRegistered(arg0.getSrc())) return;
            this.src.push({type: "audio", src: arg0});
        } else if (arg0 instanceof Image) {
            if (this.isSrcRegistered(Utils.srcToString(arg0.state.src))) return;
            this.src.push({type: "image", src: arg0});
        } else if (typeof arg0 === "object") {
            if (this.isSrcRegistered(arg0["src"] || "")) return;
            this.src.push(arg0);
        } else {
            if (arg0 === "audio") {
                if (this.isSrcRegistered(src || "")) return;
                this.src.push({
                    type: arg0, src: src instanceof Sound ? src : new Sound({
                        src: (src as Sound["config"]["src"]),
                    })
                });
            } else {
                if (this.isSrcRegistered(src || "")) return;
                this.src.push({type: arg0, src: src} as Src);
            }
        }
        return this;
    }

    isSrcRegistered(src: string | Sound | Image): boolean {
        const target = src instanceof Sound ? src.getSrc() : src;
        return this.src.some(s => {
            if (s.type === SrcManager.SrcTypes.audio) {
                return target === s.src.getSrc();
            } else if (s.type === SrcManager.SrcTypes.image) {
                return target === Utils.srcToString(s.src.state.src);
            } else {
                return target === s.src;
            }
        });
    }

    getSrc(): Src[] {
        return this.src;
    }

    getSrcByType(type: SrcType): Src[] {
        return this.src.filter(src => src.type === type);
    }
}

