import {EventDispatcher} from "@lib/util/data";
import {EventTypes, ITransition} from "@lib/game/game/elements/transition/type";


export class Base<T extends Record<string, any>> implements ITransition<T> {
    public events: EventDispatcher<EventTypes<[T]>> = new EventDispatcher();

    public start(onComplete?: () => void): void {
    }

    public toElementProps() {
        return {} as T;
    }

    public toElements(...args: any[]) {
        return null;
    }
}


