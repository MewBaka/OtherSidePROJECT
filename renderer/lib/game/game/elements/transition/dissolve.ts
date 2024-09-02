import {ElementProp, ITransition} from "@lib/game/game/elements/transition/type";
import {Base} from "@lib/game/game/elements/transition/base";
import {Scene} from "@lib/game/game/elements/scene";
import {NextJSStaticImageData} from "@lib/game/game/show";
import {Image} from "@lib/game/game/elements/image";


export type DissolveElementProps = {
    opacity: number;
}

type DissolveProps = {
    style: {
        opacity: number;
    },
    src?: string;
};

/**
 * @class Dissolve
 * @implements ITransition
 * @extends Base
 * @description Dissolve transition effect
 */
export class Dissolve extends Base<DissolveProps> implements ITransition {
    static Frames: [number, number] = [1, 0]
    private readonly duration: number;
    private state: DissolveElementProps = {
        opacity: 0,
    };
    private readonly src: string;

    constructor(src: string | NextJSStaticImageData | Scene, duration: number = 1000) {
        super();
        this.duration = duration;
        this.src = typeof src === "string" ? src :
            src instanceof Scene ? Scene.backgroundToSrc(src.config.background) :
                Image.staticImageDataToSrc(src);
    }

    public start(onComplete?: () => void): void {
        this.state.opacity = Dissolve.Frames[0];
        this.requestAnimation({
            start: Dissolve.Frames[0],
            end: Dissolve.Frames[1],
            duration: this.duration
        }, {
            onComplete,
            onUpdate: (value) => {
                this.state.opacity = value;
            }
        })

    }

    public toElementProps(): (DissolveProps & ElementProp)[] {
        return [
            {
                style: {opacity: this.state.opacity},
            },
            {
                style: {opacity: 1 - this.state.opacity},
                src: this.src,
            }
        ];
    }
}


