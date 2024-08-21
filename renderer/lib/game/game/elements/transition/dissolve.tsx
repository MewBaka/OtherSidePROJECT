import {ITransition, TransitionEventTypes} from "@lib/game/game/elements/transition/type";
import {Base} from "@lib/game/game/elements/transition/base";
import {animate, type DOMKeyframesDefinition} from "framer-motion";
import React, {ImgHTMLAttributes} from "react";
import {Scene} from "@lib/game/game/elements/scene";
import Isolated from "@lib/ui/elements/isolated";
import Background from "@lib/ui/elements/Background";
import {SrcManager} from "@lib/game/game/elements/srcManager";
import {GameState} from "@lib/ui/components/player/gameState";
import {StaticImageData} from "@lib/game/game/show";
import {Image} from "@lib/game/game/elements/image";


export type DissolveElementProps = {
    opacity: number;
}

type DissolveType = keyof DissolveElementProps;

export class Dissolve extends Base<Record<string, any>> implements ITransition<DissolveElementProps> {
    static Frames: {
        [K in DissolveType]: number[];
    } = {
        opacity: [1, 0],
    }
    private readonly duration: number;
    private state: DissolveElementProps = {
        opacity: 0,
    };
    private readonly src: string;

    constructor(src: string | StaticImageData, duration: number = 1000) {
        super();
        this.duration = duration;
        this.src = typeof src === "string"? src : Image.staticImageDataToSrc(src);
    }

    public start(onComplete?: () => void): void {
        this.state.opacity = Dissolve.Frames["opacity"][0];
        this.events.emit(TransitionEventTypes.start, null);

        animate(Dissolve.Frames["opacity"][0], Dissolve.Frames["opacity"][1], {
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

    public toElementProps(): {
        [K in 0 | 1]: {
            style: DOMKeyframesDefinition;
            src?: string;
        }
    } {
        return {
            0: {
                style: {
                    opacity: this.state.opacity,
                }
            },
            1: {
                style: {
                    opacity: 1 - this.state.opacity,
                },
            }
        }
    }

    public toElements(scene: Scene, props: Record<string, any> = {}, {state}: {state:GameState}): React.ReactElement {
        const loaded = [];
        let onLoaded = () => {
            loaded.push(null);
            if (loaded.length === 2) {
                this.events.emit(TransitionEventTypes.ready, null);
            }
        }
        return (
            <>
                <Background>
                    <img {...props} {...(this.toElementProps()[0] as any)} alt={"image"} onLoad={onLoaded}/>
                </Background>
                <Background>
                    <img {...props}
                         {...(this.toElementProps()[1] as any)}
                         src={SrcManager.cacheablize(this.src, state.clientGame.clientAPI.window.location.origin)}
                         alt={"image"}
                         onLoad={onLoaded}
                    />
                </Background>
            </>
        )
    }
}


