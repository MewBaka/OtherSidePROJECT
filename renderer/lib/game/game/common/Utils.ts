import {NextJSStaticImageData} from "@lib/game/game/show";

export class Utils {
    public static srcToString(src: string | NextJSStaticImageData): string {
        return typeof src === "string" ? src : src.src;
    }

    public static staticImageDataToSrc(image: NextJSStaticImageData | string): string {
        return typeof image === "string" ? image : image.src;
    }

    public static isStaticImageData(src: any): src is NextJSStaticImageData {
        return src.src !== undefined;
    }
}

