import {Constructable} from "../constructable";
import {Game, LogicAction} from "../game";
import {deepMerge} from "@lib/util/data";
import {SceneAction, StoryAction} from "@lib/game/game/actions";
import {RawData} from "@lib/game/game/save/rollback";

export type StoryConfig = {};

export class Story extends Constructable<
    any,
    SceneAction<"scene:action">,
    StoryAction<"story:action">
> {
    static defaultConfig: StoryConfig = {};
    static targetAction = StoryAction;
    readonly id: string;
    readonly name: string;
    readonly config: StoryConfig;

    constructor(name: string, config: StoryConfig = {}) {
        super();
        this.id = Game.getIdManager().getStringId();
        this.name = name;
        this.config = deepMerge<StoryConfig>(Story.defaultConfig, config);
    }

    /**@internal */
    getFutureActions(): LogicAction.Actions[] {
        const set = new Set<LogicAction.Actions>();
        this.getActions().forEach(sceneAction => {
            const queue: LogicAction.Actions[] = [];
            queue.push(sceneAction);
            set.add(sceneAction);

            while (queue.length > 0) {
                const action = queue.shift();
                set.add(action);
                queue.push(...action.getFutureActions());
            }
        });

        return Array.from(set);
    }

    /**@internal */
    findActionById(id: string, actions?: LogicAction.Actions[]): LogicAction.Actions | null {
        const action = actions || this.getFutureActions();
        const found = action.find(action => action.contentNode.id === id);
        return found || null;
    }

    /**@internal */
    getAllElements(actions?: LogicAction.Actions[]): LogicAction.GameElement[] {
        const action = actions || this.getFutureActions();
        const set = new Set<LogicAction.GameElement>(
            action.map(action => action.callee)
        );
        return Array.from(set);
    }

    /**@internal */
    getAllData(actions?: LogicAction.Actions[]): RawData<Record<string, any>>[] {
        const action = actions || this.getFutureActions();
        return action
            .map(action => ({
                id: action.contentNode.id,
                data: action.callee.toData()
            }))
            .filter(data => data.data !== null);
    }

    /**@internal */
    setAllData(data: RawData<any>[], actions?: LogicAction.Actions[]): void {
        const action = actions || this.getFutureActions();
        const map = new Map<string, any>();
        action.forEach((action, index) => {
            map.set(action.contentNode.id, data[index]);
        });
        action.forEach(action => action.callee.fromData(map.get(action.contentNode.id)));
    }

    toData() {
        return null;
    }

    fromData(_: any) {
        return this;
    }
}

