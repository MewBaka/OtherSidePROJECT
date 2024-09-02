import {ElementProp, ITransition, TransitionEventTypes} from "@lib/game/game/elements/transition/type";
import {Base} from "@lib/game/game/elements/transition/base";
import {animate} from "framer-motion";
import {Scene} from "@lib/game/game/elements/scene";
import {StaticImageData} from "next/image";
import {Utils} from "@lib/game/game/common/Utils";


export type FadeElementProps = {
    opacity: number;
}

type FadeProps = {
    style?: {
        opacity: number;
    },
    src?: string;
}

export class Fade extends Base<FadeProps> implements ITransition {
    static Frames: [number, number] = [0, 1];
    private readonly duration: number;
    private state: FadeElementProps = {
        opacity: 1,
    };
    private readonly src: string;

    constructor(src: Scene | StaticImageData | string, duration: number = 1000) {
        super();
        this.duration = duration;
        this.src = typeof src === "string" ? src :
            src instanceof Scene ? Utils.backgroundToSrc(src.config.background) :
                Utils.staticImageDataToSrc(src);
    }

    public start(onComplete?: () => void): void {
        this.state.opacity = Fade.Frames[0];
        this.events.emit(TransitionEventTypes.start, null);

        animate(Fade.Frames[0], Fade.Frames[1], {
            duration: this.duration / 1000,
            onUpdate: (value) => {
                this.state.opacity = value;
                this.events.emit(TransitionEventTypes.update, this.toElementProps());
            },
            onComplete: () => {
                this.events.emit(TransitionEventTypes.end, null);
                if (onComplete) {
                    onComplete();
                }
            },
        });
    }

    public toElementProps(): (FadeProps & ElementProp)[] {
        return [
            {},
            {
                style: {
                    opacity: this.state.opacity,
                },
                src: this.src,
            }
        ];
    }
}


