import {NextJSStaticImageData} from "@lib/game/game/show";

export class Utils {
    public static srcToString(src: string | NextJSStaticImageData): string {
        return typeof src === "string" ? src : src.src;
    }
}

