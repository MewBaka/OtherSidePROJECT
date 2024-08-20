import {StaticImageData} from "@lib/game/game/show";

export class Utils {
    public static srcToString(src: string | StaticImageData): string {
        return typeof src === "string" ? src : src.src;
    }
}

