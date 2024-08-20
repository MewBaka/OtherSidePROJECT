import {Constructable} from "../constructable";
import {Game} from "../game";
import {Awaitable, deepMerge, EventDispatcher} from "@lib/util/data";
import {Background} from "../show";
import {ContentNode} from "../save/rollback";
import {LogicAction} from "@lib/game/game/logicAction";
import {SceneAction} from "@lib/game/game/actions";
import {Transform} from "@lib/game/game/elements/transform/transform";
import {TransformDefinitions} from "@lib/game/game/elements/transform/type";
import {ITransition} from "@lib/game/game/elements/transition/type";
import {SrcManager} from "@lib/game/game/elements/srcManager";
import Actions = LogicAction.Actions;
import SceneBackgroundTransformProps = TransformDefinitions.SceneBackgroundTransformProps;

export type SceneConfig = {
    invertY?: boolean;
    invertX?: boolean;
} & Background;
export type SceneState = {
};

// @todo: scene生命周期管理

export type SceneEventTypes = {
    "event:scene.setTransition": [ITransition];
    "event:scene.remove": [];
    "event:scene.applyTransition": [ITransition];
    "event:scene.load": [],
    "event:scene.unload": [],
    "event:scene.mount": [],
    "event:scene.unmount": [],
};

// @todo: 将只读配置和动态状态分开

export class Scene extends Constructable<
    any,
    Actions,
    SceneAction<"scene:action">
> {
    static EventTypes: { [K in keyof SceneEventTypes]: K } = {
        "event:scene.setTransition": "event:scene.setTransition",
        "event:scene.remove": "event:scene.remove",
        "event:scene.applyTransition": "event:scene.applyTransition",
        "event:scene.load": "event:scene.load",
        "event:scene.unload": "event:scene.unload",
        "event:scene.mount": "event:scene.mount",
        "event:scene.unmount": "event:scene.unmount",
    }
    static defaultConfig: SceneConfig = {
        background: null,
        invertY: false,
    };
    static defaultState: SceneState = {};
    static targetAction = SceneAction;
    id: string;
    name: string;
    config: SceneConfig;
    state: SceneConfig & SceneState;
    srcManager: SrcManager = new SrcManager();
    events: EventDispatcher<SceneEventTypes> = new EventDispatcher();
    private _actions: SceneAction<any>[] = [];

    constructor(name: string, config: SceneConfig = Scene.defaultConfig) {
        super();
        this.id = Game.getIdManager().getStringId();
        this.name = name;
        this.config = deepMerge<SceneConfig>(Scene.defaultConfig, config);
        this.state = deepMerge<SceneConfig & SceneState>(Scene.defaultState, this.config);
    }

    static backgroundToSrc(background: Background["background"]) {
        return Transform.isStaticImageData(background) ? background.src : (
            background["url"] || null
        );
    }

    public activate(): this {
        return this.init();
    }

    public deactivate(): this {
        return this.exit();
    }

    private exit(): this {
        this._actions.push(new SceneAction(
            this,
            "scene:exit",
            new ContentNode(
                Game.getIdManager().getStringId(),
            ).setContent([])
        ));
        return this;
    }

    public setSceneBackground(background: Background["background"]) {
        this._actions.push(new SceneAction(
            this,
            "scene:setBackground",
            new ContentNode<[Background["background"]]>(
                Game.getIdManager().getStringId(),
            ).setContent([
                background,
            ])
        ));
        return this;
    }

    public sleep(ms: number): this;
    public sleep(promise: Promise<any>): this;
    public sleep(awaitable: Awaitable<any, any>): this;
    public sleep(content: number | Promise<any> | Awaitable<any, any>): this {
        this._actions.push(new SceneAction(
            this,
            "scene:sleep",
            new ContentNode(
                Game.getIdManager().getStringId(),
            ).setContent(content)
        ));
        return this;
    }

    _setTransition(transition: ITransition) {
        this._actions.push(new SceneAction(
            this,
            "scene:setTransition",
            new ContentNode(
                Game.getIdManager().getStringId(),
            ).setContent([transition])
        ));
        return this;
    }

    _applyTransition(transition: ITransition) {
        this._actions.push(new SceneAction(
            this,
            "scene:applyTransition",
            new ContentNode(
                Game.getIdManager().getStringId(),
            ).setContent([transition])
        ));
        return this;
    }

    public applyTransition(transition: ITransition) {
        this._setTransition(transition)._applyTransition(transition);
        return this;
    }

    private init(): this {
        this._actions.push(new SceneAction(
            this,
            "scene:init",
            new ContentNode(
                Game.getIdManager().getStringId(),
            ).setContent([])
        ));
        return this;
    }

    public toActions(): SceneAction<any>[] {
        let actions = this._actions;
        this._actions = [];
        return actions;
    }

    toData() {
        return {
            id: this.id,
            name: this.name,
            config: this.config,
            actions: this.actions.map(action => action.toData())
        }
    }

    toTransform(): Transform<SceneBackgroundTransformProps> {
        return new Transform<SceneBackgroundTransformProps>({
            background: this.state.background,
            backgroundOpacity: 1
        }, {
            duration: 0,
        });
    }
}

