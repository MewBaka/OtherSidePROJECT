import {ITransition, TransitionEventTypes} from "@lib/game/game/elements/transition/type";
import {Base} from "@lib/game/game/elements/transition/base";
import {animate} from "framer-motion";
import React from "react";
import {Scene} from "@lib/game/game/elements/scene";
import Background from "@lib/ui/elements/Background";


export type FadeElementProps = {
    opacity: number;
}

type FadeType = "in" | "out";

export class Fade extends Base<Record<string, any>> implements ITransition<FadeElementProps> {
    static Frames: {
        [K in FadeType]: number[];
    } = {
        "in": [0, 1],
        "out": [1, 0],
    }
    private readonly duration: number;
    private readonly type: FadeType;
    private state: FadeElementProps = {
        opacity: 1,
    };

    constructor(duration: number = 1000, type: FadeType = "in") {
        super();
        this.duration = duration;
        this.type = type;
    }

    public start(onComplete?: () => void): void {
        this.state.opacity = Fade.Frames[this.type][0];
        this.events.emit(TransitionEventTypes.start, null);

        animate(Fade.Frames[this.type][0], Fade.Frames[this.type][1], {
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

    public toElementProps(): Record<string, any> {
        return {
            style: {
                opacity: this.state.opacity,
            }
        }
    }

    public toElements(scene: Scene, props: Record<string, any> = {}): React.ReactElement {
        return (
            <Background>
                <img {...props} {...this.toElementProps()}/>
            </Background>
        )
    }
}


