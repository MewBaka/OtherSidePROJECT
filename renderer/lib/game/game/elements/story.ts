import {Constructable} from "../constructable";
import {Game} from "../game";
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

    toData() {
        return {
            id: this.id,
            name: this.name,
            config: this.config,
            actions: this.actions.map(action => action.toData())
        }
    }
}

