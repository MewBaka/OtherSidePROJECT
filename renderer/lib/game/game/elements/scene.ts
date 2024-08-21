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

export type SceneConfig = {
    invertY?: boolean;
    invertX?: boolean;
} & Background;
export type SceneState = {};
export type JumpConfig = {
    transition: ITransition;
}

// @todo: scene生命周期管理

export type SceneEventTypes = {
    "event:scene.setTransition": [ITransition | null];
    "event:scene.remove": [];
    "event:scene.applyTransition": [ITransition];
    "event:scene.load": [],
    "event:scene.unload": [],
    "event:scene.mount": [],
    "event:scene.unmount": [],
    "event:scene.imageLoaded": [],
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
        "event:scene.imageLoaded": "event:scene.imageLoaded",
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
        return this._exit();
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

    /**
     * 跳转到指定的场景
     * 调用方法后，将无法回到当前调用该跳转的场景上下文，因此该场景会被卸载
     * 任何在跳转操作之后的操作都不会被执行
     */
    public jumpTo(actions: SceneAction<"scene:action">[] | SceneAction<"scene:action">, config?: JumpConfig): this;
    public jumpTo(scene: Scene, config?: JumpConfig): this;
    public jumpTo(arg0: SceneAction<"scene:action">[] | SceneAction<"scene:action"> | Scene, config?: JumpConfig): this {
        const jumpConfig: Partial<JumpConfig> = config || {};
        if (arg0 instanceof Scene) {
            const actions = arg0.getSceneActions();
            this._transitionToScene(arg0, jumpConfig.transition);
            return this._jumpTo(actions);
        }

        const actions = Array.isArray(arg0) ? arg0 : [arg0];
        const scene = actions[0]?.callee;
        if (scene) {
            this._transitionToScene(scene, jumpConfig.transition);
        }
        return this._jumpTo(actions);
    }

    public transitionSceneBackground(scene: Scene, transition: ITransition) {
        this._transitionToScene(scene, transition);
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

    public toActions(): SceneAction<any>[] {
        let actions = this._actions;
        this._actions = [];
        return actions;
    }

    protected getSceneActions() {
        return this.toActions();
    }

    private _jumpTo(actions: SceneAction<"scene:action">[] | SceneAction<"scene:action">) {
        this._actions.push(new SceneAction(
            this,
            "scene:jumpTo",
            new ContentNode<[Actions[]]>(
                Game.getIdManager().getStringId(),
            ).setContent([
                Array.isArray(actions) ? actions.flat(2) : [actions]
            ])
        ));
        return this;
    }

    private _exit(): this {
        this._actions.push(new SceneAction(
            this,
            "scene:exit",
            new ContentNode(
                Game.getIdManager().getStringId(),
            ).setContent([])
        ));
        return this;
    }

    private _transitionToScene(scene: Scene, transition?: ITransition): this {
        if (transition) {
            this._setTransition(transition)
                ._applyTransition(transition)
        }
        this._actions.push(
            ...scene.activate().toActions(),
        );
        this._exit()
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
}

