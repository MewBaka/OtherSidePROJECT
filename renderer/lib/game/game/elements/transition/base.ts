import {EventDispatcher} from "@lib/util/data";
import {ElementProp, EventTypes, ITransition, TransitionEventTypes} from "@lib/game/game/elements/transition/type";
import {animate, AnimationPlaybackControls, ValueAnimationTransition} from "framer-motion";


export class Base<T extends ElementProp> implements ITransition<T> {
    public events: EventDispatcher<EventTypes<[T[]]>> = new EventDispatcher();

    public start(onComplete?: () => void): void {
    }

    public toElementProps(): T[] {
        return [] as T[];
    }

    protected requestAnimation(
        {
            start, end, duration
        }: {
            start: number;
            end: number;
            duration: number;
        },
        {
            onComplete, onUpdate
        }: {
            onComplete?: () => void;
            onUpdate?: (value: number) => void;
        },
        options?: ValueAnimationTransition<number>
    ): AnimationPlaybackControls {
        this.events.emit(TransitionEventTypes.start, null);

        return animate(start, end, {
            duration: duration / 1000,
            onUpdate: (value) => {
                if (onUpdate) {
                    onUpdate(value);
                }
                this.events.emit(TransitionEventTypes.update, this.toElementProps());
            },
            onComplete: () => {
                this.events.emit(TransitionEventTypes.end, null);
                if (onComplete) {
                    onComplete();
                }
            },
            ...options,
        });
    }
}


