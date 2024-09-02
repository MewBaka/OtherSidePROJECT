import {ElementProp, ITransition, TransitionEventTypes} from "@lib/game/game/elements/transition/type";
import {Base} from "@lib/game/game/elements/transition/base";
import {animate} from "framer-motion";
import {Scene} from "@lib/game/game/elements/scene";
import {StaticImageData} from "next/image";
import {Utils} from "@lib/game/game/common/Utils";

type FadeInElementProps = {
    opacity: number;
    transform: string;
}

type FadeInProps = {
    style?: {
        opacity: number;
        transform: string;
    },
    src?: string;
}

export class FadeIn extends Base<FadeInProps> implements ITransition {
    private readonly duration: number;
    private readonly direction: 'left' | 'right' | 'top' | 'bottom';
    private readonly offset: number;
    private state: FadeInElementProps = {
        opacity: 0,
        transform: ''
    };
    private readonly src: string;

    constructor(src: Scene | StaticImageData | string, duration: number = 1000, direction: 'left' | 'right' | 'top' | 'bottom', offset: number) {
        super();
        this.duration = duration;
        this.direction = direction;
        this.offset = offset;
        this.src = typeof src === "string" ? src :
            src instanceof Scene ? Utils.backgroundToSrc(src.config.background) :
                Utils.staticImageDataToSrc(src);
    }

    public start(onComplete?: () => void): void {
        this.state.opacity = 0;
        this.state.transform = this.getInitialTransform();
        this.events.emit(TransitionEventTypes.start, null);

        animate(0, 1, {
            duration: this.duration / 1000,
            onUpdate: (value) => {
                this.state.opacity = value;
                this.state.transform = this.getTransform(value);
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

    private getInitialTransform(): string {
        switch (this.direction) {
            case 'left':
                return `translateX(-${this.offset}px)`;
            case 'right':
                return `translateX(${this.offset}px)`;
            case 'top':
                return `translateY(-${this.offset}px)`;
            case 'bottom':
                return `translateY(${this.offset}px)`;
            default:
                return '';
        }
    }

    private getTransform(progress: number): string {
        switch (this.direction) {
            case 'left':
                return `translateX(${(1 - progress) * -this.offset}px)`;
            case 'right':
                return `translateX(${(1 - progress) * this.offset}px)`;
            case 'top':
                return `translateY(${(1 - progress) * -this.offset}px)`;
            case 'bottom':
                return `translateY(${(1 - progress) * this.offset}px)`;
            default:
                return '';
        }
    }

    public toElementProps(): (FadeInProps & ElementProp)[] {
        return [
            {},
            {
                style: {
                    opacity: this.state.opacity,
                    transform: this.state.transform,
                },
                src: this.src,
            }
        ];
    }
}