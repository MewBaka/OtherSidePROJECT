import {Constructable} from "../constructable";
import {Game, LogicAction} from "../game";
import {deepMerge} from "@lib/util/data";
import {SceneAction, StoryAction} from "@lib/game/game/actions";

export type StoryConfig = {};

export class Story extends Constructable<
    any,
    SceneAction<"scene:action">,
    StoryAction<"story:action">
> {
    static defaultConfig: StoryConfig = {};
    static targetAction = StoryAction;
    id: string;
    name: string;
    config: StoryConfig;
    scenes: SceneAction<"scene:action">[] = [];

    constructor(name: string, config: StoryConfig = {}) {
        super();
        this.id = Game.getIdManager().getStringId();
        this.name = name;
        this.config = deepMerge<StoryConfig>(Story.defaultConfig, config);
    }

    public registerScene(scene: SceneAction<"scene:action">): this {
        this.scenes.push(scene);
        return this;
    }

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

    findActionById(id: string): LogicAction.Actions | null {
        const action = this.getFutureActions();
        const found = action.find(action => action.contentNode.id === id);
        return found || null;
    }

    toData() {
        return {
            id: this.id,
            name: this.name,
            config: this.config,
            actions: this.getActions().map(action => action.toData())
        }
    }
}

