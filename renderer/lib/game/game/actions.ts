import {ContentNode} from "@lib/game/game/save/rollback";
import {Awaitable} from "@lib/util/data";
import {Background, CommonImage} from "@lib/game/game/show";
import {Transform} from "@lib/game/game/elements/transform/transform";
import {Image as GameImage, Image} from "@lib/game/game/elements/image";
import {LogicAction} from "@lib/game/game/logicAction";
import {Action} from "@lib/game/game/action";
import type {Character, Sentence} from "@lib/game/game/elements/text";
import type {Scene} from "@lib/game/game/elements/scene";
import type {Story} from "@lib/game/game/elements/story";
import type {Script} from "@lib/game/game/elements/script";
import type {Menu, MenuData} from "@lib/game/game/elements/menu";
import type {Condition, ConditionData} from "@lib/game/game/elements/condition";
import type {CalledActionResult} from "@lib/game/game/gameTypes";
import {GameState} from "@lib/ui/components/player/gameState";
import type {Sound} from "@lib/game/game/elements/sound";
import {Control} from "@lib/game/game/elements/control";
import {TransformDefinitions} from "@lib/game/game/elements/transform/type";
import {ITransition} from "@lib/game/game/elements/transition/type";
import ImageTransformProps = TransformDefinitions.ImageTransformProps;
import Actions = LogicAction.Actions;

export class TypedAction<
    ContentType extends Record<string, any> = Record<string, any>,
    T extends keyof ContentType & string = keyof ContentType & string,
    Callee extends LogicAction.GameElement = LogicAction.GameElement
> extends Action<ContentType[T]> {
    declare callee: Callee;

    constructor(callee: Callee, type: any, contentNode: ContentNode<ContentType[T]>) {
        super(callee, type, contentNode);
        this.callee = callee;
        this.contentNode.action = this;
    }
}

/* Character */
export const CharacterActionTypes = {
    say: "character:say",
    action: "character:action",
} as const;
export type CharacterActionContentType = {
    [K in typeof CharacterActionTypes[keyof typeof CharacterActionTypes]]:
    K extends "character:say" ? Sentence :
        K extends "character:action" ? any :
            any;
}

export class CharacterAction<T extends typeof CharacterActionTypes[keyof typeof CharacterActionTypes] = typeof CharacterActionTypes[keyof typeof CharacterActionTypes]>
    extends TypedAction<CharacterActionContentType, T, Character> {
    static ActionTypes = CharacterActionTypes;

    public executeAction(state: GameState): CalledActionResult | Awaitable<CalledActionResult, any> {
        if (this.type === CharacterActionTypes.say) {
            const awaitable = new Awaitable<CalledActionResult, any>(v => v);
            const sentence = (this.contentNode as ContentNode<Sentence>).getContent();
            state.createText(this.contentNode.id, sentence, () => {
                awaitable.resolve({
                    type: this.type as any,
                    node: this.contentNode.child
                });
            }).then();
            return awaitable;
        }
        return super.executeAction(state);
    }
}

/* Scene */
export const SceneActionTypes = {
    action: "scene:action",
    setBackground: "scene:setBackground",
    sleep: "scene:sleep",
    setTransition: "scene:setTransition",
    applyTransition: "scene:applyTransition",
    init: "scene:init",
    exit: "scene:exit",
    jumpTo: "scene:jumpTo",
    setBackgroundMusic: "scene:setBackgroundMusic",
    preUnmount: "scene:preUnmount",
} as const;
export type SceneActionContentType = {
    [K in typeof SceneActionTypes[keyof typeof SceneActionTypes]]:
    K extends typeof SceneActionTypes["action"] ? Scene :
        K extends typeof SceneActionTypes["sleep"] ? number | Promise<any> | Awaitable<any, any> :
            K extends typeof SceneActionTypes["setBackground"] ? [Background["background"]] :
                K extends typeof SceneActionTypes["setTransition"] ? [ITransition] :
                    K extends typeof SceneActionTypes["applyTransition"] ? [ITransition] :
                        K extends typeof SceneActionTypes["init"] ? [] :
                            K extends typeof SceneActionTypes["exit"] ? [] :
                                K extends typeof SceneActionTypes["jumpTo"] ? [Actions[]] :
                                    K extends typeof SceneActionTypes["setBackgroundMusic"] ? [Sound, number?] :
                                        K extends typeof SceneActionTypes["preUnmount"] ? [] :
                                            any;
}

export class SceneAction<T extends typeof SceneActionTypes[keyof typeof SceneActionTypes] = typeof SceneActionTypes[keyof typeof SceneActionTypes]>
    extends TypedAction<SceneActionContentType, T, Scene> {
    static ActionTypes = SceneActionTypes;

    public executeAction(state: GameState): CalledActionResult | Awaitable<CalledActionResult, any> {
        if (this.type === SceneActionTypes.action) {
            return super.executeAction(state);
        } else if (this.type === SceneActionTypes.setBackground) {
            this.callee.state.background = (this.contentNode as ContentNode<SceneActionContentType["scene:setBackground"]>).getContent()[0];
            return super.executeAction(state);
        } else if (this.type === SceneActionTypes.sleep) {
            const awaitable = new Awaitable<CalledActionResult, any>(v => v);
            const content = (this.contentNode as ContentNode<number | Promise<any> | Awaitable<any, any>>).getContent();
            const wait = new Promise<void>(resolve => {
                if (typeof content === "number") {
                    setTimeout(() => {
                        resolve();
                    }, content);
                } else if (Awaitable.isAwaitable(content)) {
                    content.then(resolve);
                } else {
                    content.then(resolve);
                }
            });
            wait.then(() => {
                awaitable.resolve({
                    type: this.type,
                    node: this.contentNode.child
                });
                state.stage.next();
            });
            return awaitable;
        } else if (this.type === SceneActionTypes.setTransition) {
            this.callee.events.emit(
                "event:scene.setTransition",
                (this.contentNode as ContentNode<SceneActionContentType["scene:setTransition"]>).getContent()[0]
            );
            return super.executeAction(state);
        } else if (this.type === SceneActionTypes.applyTransition) {
            const awaitable = new Awaitable<CalledActionResult, any>(v => v);
            const transition = (this.contentNode as ContentNode<SceneActionContentType["scene:applyTransition"]>).getContent()[0];
            transition.start(() => {
                awaitable.resolve({
                    type: this.type,
                    node: this.contentNode.child
                });
                state.stage.next();
            });
            return awaitable;
        } else if (this.type === SceneActionTypes.init) {
            const awaitable = new Awaitable<CalledActionResult, any>(v => v);
            state
                .registerSrcManager(this.callee.srcManager)
                .addScene(this.callee);

            this.callee.events.once("event:scene.unmount", () => {
                state.offSrcManager(this.callee.srcManager);
            });

            this.callee.events.once("event:scene.mount", () => {
                if (this.callee.state.backgroundMusic) {
                    SoundAction.initSound(state, this.callee.state.backgroundMusic);
                    this.callee.events.emit("event:scene.setBackgroundMusic",
                        this.callee.state.backgroundMusic,
                        this.callee.config.backgroundMusicFade
                    );
                }
            });

            this.callee.events.once("event:scene.imageLoaded", () => {
                awaitable.resolve({
                    type: this.type,
                    node: this.contentNode.child
                });
                state.stage.next();
            });
            return awaitable;
        } else if (this.type === SceneActionTypes.exit) {
            state
                .offSrcManager(this.callee.srcManager)
                .removeScene(this.callee);

            const awaitable = new Awaitable<CalledActionResult, any>(v => v);
            this.callee.events.once("event:scene.unmount", () => {
                awaitable.resolve({
                    type: this.type,
                    node: this.contentNode.child
                });
                state.stage.next();
            });
            return awaitable;
        } else if (this.type === SceneActionTypes.jumpTo) {
            const actions = (this.contentNode as ContentNode<SceneActionContentType["scene:jumpTo"]>).getContent()[0];
            const current = this.contentNode;

            const future = actions[0]?.contentNode;
            current.addChild(future);

            return super.executeAction(state);
        } else if (this.type === SceneActionTypes.setBackgroundMusic) { // @todo: test this
            const [sound, fade] = (this.contentNode as ContentNode<SceneActionContentType["scene:setBackgroundMusic"]>).getContent();

            this.callee.events.emit("event:scene.setBackgroundMusic", sound, fade);

            return super.executeAction(state);
        } else if (this.type === SceneActionTypes.preUnmount) {
            this.callee.events.emit("event:scene.preUnmount");
            return super.executeAction(state);
        }

        throw new Error("Unknown scene action type: " + this.type);
    }

    getFutureActions(): LogicAction.Actions[] {
        if (this.type === SceneActionTypes.jumpTo) {
            // We don't care about the actions after jumpTo
            // because they won't be executed
            return (this.contentNode as ContentNode<SceneActionContentType["scene:jumpTo"]>).getContent()[0];
        }
        const action = this.contentNode.child?.action;
        return action ? [action] : [];
    }
}

/* Story */
export const StoryActionTypes = {
    action: "story:action",
} as const;
export type StoryActionContentType = {
    [K in typeof StoryActionTypes[keyof typeof StoryActionTypes]]:
    K extends "story:action" ? Story :
        any;
}

export class StoryAction<T extends typeof StoryActionTypes[keyof typeof StoryActionTypes] = typeof StoryActionTypes[keyof typeof StoryActionTypes]>
    extends TypedAction<StoryActionContentType, T, Story> {
    static ActionTypes = StoryActionTypes;
}

/* Image */
export const ImageActionTypes = {
    action: "image:action",
    setSrc: "image:setSrc",
    setPosition: "image:setPosition",
    show: "image:show",
    hide: "image:hide",
    applyTransform: "image:applyTransform",
    init: "image:init",
    dispose: "image:dispose",
} as const;
export type ImageActionContentType = {
    [K in typeof ImageActionTypes[keyof typeof ImageActionTypes]]:
    K extends "image:setSrc" ? [string] :
        K extends "image:setPosition" ? [CommonImage["position"], Transform<TransformDefinitions.ImageTransformProps>] :
            K extends "image:show" ? [void, Transform<TransformDefinitions.ImageTransformProps>] :
                K extends "image:hide" ? [void, Transform<TransformDefinitions.ImageTransformProps>] :
                    K extends "image:applyTransform" ? [void, Transform<TransformDefinitions.ImageTransformProps>, string] :
                        K extends "image:init" ? [Scene?] :
                            K extends "image:dispose" ? [] :
                                any;
}

export class ImageAction<T extends typeof ImageActionTypes[keyof typeof ImageActionTypes] = typeof ImageActionTypes[keyof typeof ImageActionTypes]>
    extends TypedAction<ImageActionContentType, T, Image> {
    static ActionTypes = ImageActionTypes;

    public executeAction(state: GameState): CalledActionResult | Awaitable<CalledActionResult, any> {
        if (this.type === ImageActionTypes.init) {
            const lastScene = state.findElementByImage(this.callee);
            if (lastScene) {
                state.disposeImage(this.callee, lastScene.scene);
            }

            const scene = (this.contentNode as ContentNode<ImageActionContentType["image:init"]>).getContent()[0];
            state.createImage(this.callee, scene);

            const awaitable = new Awaitable<CalledActionResult, any>(v => v);
            const transform = new Transform<ImageTransformProps>([{
                props: {
                    ...this.callee.state,
                },
                options: {
                    duration: 0,
                }
            }], {
                sync: true
            });

            this.callee.events.once("event:image.mount", async () => {
                if (!this.callee.getScope().current) {
                    await this.callee.events.any(GameImage.EventTypes["event:image.elementLoaded"]);
                }
                state.animateImage(Image.EventTypes["event:image.applyTransform"], this.callee, [
                    transform
                ], () => {
                    awaitable.resolve({
                        type: this.type,
                        node: this.contentNode?.child || null,
                    });
                    state.stage.next();
                });
            });
            return awaitable;
        }

        if (this.type === ImageActionTypes.setSrc) {
            this.callee.state.src = (this.contentNode as ContentNode<ImageActionContentType["image:setSrc"]>).getContent()[0];
            return super.executeAction(state);
        } else if ([
            ImageActionTypes.show,
            ImageActionTypes.hide,
            ImageActionTypes.applyTransform
        ].includes(this.type)) {
            const awaitable = new Awaitable<CalledActionResult, any>(v => v);
            const transform = (this.contentNode as ContentNode<ImageActionContentType["image:show"]>).getContent()[1];

            if (this.type === ImageActionTypes.show) {
                this.callee.state.display = true;
                state.stage.forceUpdate();
            }

            state.animateImage(Image.EventTypes["event:image.applyTransform"], this.callee, [
                transform
            ], () => {
                if (this.type === ImageActionTypes.hide) {
                    this.callee.state.display = false;
                }
                awaitable.resolve({
                    type: this.type,
                    node: this.contentNode?.child || null,
                });
            })
            return awaitable;
        } else if (this.type === ImageActionTypes.dispose) {
            state.disposeImage(this.callee);
            return super.executeAction(state);
        }
    }
}

/* Condition */
export const ConditionActionTypes = {
    action: "condition:action",
} as const;
export type ConditionActionContentType = {
    [K in typeof ConditionActionTypes[keyof typeof ConditionActionTypes]]:
    K extends "condition:action" ? ConditionData :
        any;
}

export class ConditionAction<T extends typeof ConditionActionTypes[keyof typeof ConditionActionTypes] = typeof ConditionActionTypes[keyof typeof ConditionActionTypes]>
    extends TypedAction<ConditionActionContentType, T, Condition> {
    static ActionTypes = ConditionActionTypes;

    executeAction(gameState: GameState) {
        const nodes = this.callee.evaluate(this.contentNode.getContent(), {
            gameState
        });
        nodes?.[nodes.length - 1]?.contentNode.addChild(this.contentNode.child);
        this.contentNode.addChild(nodes[0]?.contentNode || null);
        return {
            type: this.type as any,
            node: this.contentNode,
        };
    }

    getFutureActions() {
        return [...this.callee._getFutureActions(), ...super.getFutureActions()];
    }
}

/* Script */
export const ScriptActionTypes = {
    action: "script:action",
} as const;
export type ScriptActionContentType = {
    [K in typeof ScriptActionTypes[keyof typeof ScriptActionTypes]]:
    K extends "script:action" ? Script :
        any;
}

export class ScriptAction<T extends typeof ScriptActionTypes[keyof typeof ScriptActionTypes] = typeof ScriptActionTypes[keyof typeof ScriptActionTypes]>
    extends TypedAction<ScriptActionContentType, T, Script> {
    static ActionTypes = ScriptActionTypes;

    public executeAction(gameState: GameState) {
        this.contentNode.getContent().execute({
            gameState,
        });
        return {
            type: this.type as any,
            node: this.contentNode,
        };
    }
}

/* Menu */
export const MenuActionTypes = {
    action: "menu:action",
} as const;
export type MenuActionContentType = {
    [K in typeof MenuActionTypes[keyof typeof MenuActionTypes]]:
    K extends "menu:action" ? MenuData :
        any;
}

export class MenuAction<T extends typeof MenuActionTypes[keyof typeof MenuActionTypes] = typeof MenuActionTypes[keyof typeof MenuActionTypes]>
    extends TypedAction<MenuActionContentType, T, Menu> {
    static ActionTypes = MenuActionTypes;

    public executeAction(state: GameState) {
        const awaitable = new Awaitable<CalledActionResult, CalledActionResult>(v => v);
        const menu = this.contentNode.getContent() as MenuData;

        state.createMenu(menu, v => {
            let lastChild = state.clientGame.game.getLiveGame().getCurrentAction().contentNode.child;
            if (lastChild) {
                v.action[v.action.length - 1]?.contentNode.addChild(lastChild);
            }
            awaitable.resolve({
                type: this.type as any,
                node: v.action[0].contentNode
            });
        }).then(r => r)
        return awaitable;
    }

    getFutureActions() {
        return [...this.callee._getFutureActions(), ...super.getFutureActions()];
    }
}

export const SoundActionTypes = {
    action: "sound:action",
    play: "sound:play",
    stop: "sound:stop", // @todo: add pause and resume
    fade: "sound:fade",
    setVolume: "sound:setVolume",
    setRate: "sound:setRate",
} as const;
export type SoundActionContentType = {
    [K in typeof SoundActionTypes[keyof typeof SoundActionTypes]]:
    K extends "sound:play" ? [void] :
        K extends "sound:stop" ? [void] :
            K extends "sound:fade" ? [{
                    start: number;
                    end: number;
                    duration: number;
                }] :
                K extends "sound:setVolume" ? [number] :
                    K extends "sound:setRate" ? [number] :
                        any;
}

export class SoundAction<T extends typeof SoundActionTypes[keyof typeof SoundActionTypes] = typeof SoundActionTypes[keyof typeof SoundActionTypes]>
    extends TypedAction<SoundActionContentType, T, Sound> {
    static ActionTypes = SoundActionTypes;

    static initSound(state: GameState, sound: Sound) {
        if (!sound.$getHowl()) {
            sound.$setHowl(
                new (state.getHowl())(sound.getHowlOptions())
            )
        }
    }

    public executeAction(state: GameState): CalledActionResult | Awaitable<CalledActionResult, any> {
        if (this.type === SoundActionTypes.play) {
            SoundAction.initSound(state, this.callee);
            if (this.callee.config.sync && !this.callee.config.loop) {
                const awaitable = new Awaitable<CalledActionResult, any>(v => v);
                const token = state.playSound(this.callee.$getHowl(), () => {
                    this.callee.$stop();
                    awaitable.resolve({
                        type: this.type as any,
                        node: this.contentNode?.child || null
                    });
                });
                this.callee.$setToken(token);
                return awaitable;
            } else {
                const token = state.playSound(this.callee.$getHowl(), () => {
                    this.callee.$stop();
                });
                this.callee.$setToken(token);
                return super.executeAction(state);
            }
        } else if (this.type === SoundActionTypes.stop) {
            if (this.callee.$getHowl()) {
                this.callee.$getHowl().stop();
                this.callee.$stop();
            }
            return super.executeAction(state);
        } else if (this.type === SoundActionTypes.fade) {
            const [{
                start,
                end,
                duration
            }] = (this.contentNode as ContentNode<SoundActionContentType["sound:fade"]>).getContent();
            if (this.callee.$getHowl()) {
                this.callee.$getHowl().fade(start, end, duration, this.callee.$getToken());
            }
            return super.executeAction(state);
        } else if (this.type === SoundActionTypes.setVolume) {
            const [volume] = (this.contentNode as ContentNode<SoundActionContentType["sound:setVolume"]>).getContent();
            if (this.callee.$getHowl()) {
                this.callee.$getHowl().volume(volume, this.callee.$getToken());
            }
            return super.executeAction(state);
        } else if (this.type === SoundActionTypes.setRate) {
            const [rate] = (this.contentNode as ContentNode<SoundActionContentType["sound:setRate"]>).getContent();
            if (this.callee.$getHowl()) {
                this.callee.$getHowl().rate(rate, this.callee.$getToken());
            }
            return super.executeAction(state);
        }
    }
}

export const ControlActionTypes = {
    action: "control:action",
    do: "control:do",
    doAsync: "control:doAsync",
    any: "control:any",
    all: "control:all",
    allAsync: "control:allAsync",
    repeat: "control:repeat",
} as const;
export type ControlActionContentType = {
    [K in typeof ControlActionTypes[keyof typeof ControlActionTypes]]:
    K extends "control:do" ? [LogicAction.Actions[]] :
        K extends "control:doAsync" ? [LogicAction.Actions[]] :
            K extends "control:any" ? [LogicAction.Actions[]] :
                K extends "control:all" ? [LogicAction.Actions[]] :
                    K extends "control:parallel" ? [LogicAction.Actions[]] :
                        K extends "control:allAsync" ? [LogicAction.Actions[]] :
                            K extends "control:repeat" ? [LogicAction.Actions[], number] :
                                any;
}

export class ControlAction<T extends typeof ControlActionTypes[keyof typeof ControlActionTypes] = typeof ControlActionTypes[keyof typeof ControlActionTypes]>
    extends TypedAction<ControlActionContentType, T, Control> {
    static ActionTypes = ControlActionTypes;

    public async executeAllActions(state: GameState, action: LogicAction.Actions) {
        let exited = false;
        let current = action;
        while (!exited) {
            const next = state.clientGame.game.getLiveGame().executeAction(state, current);
            if (!next) {
                break;
            }
            if (Awaitable.isAwaitable(next)) {
                const {node} = await new Promise<CalledActionResult>((r) => {
                    next.then((_) => r(next.result));
                });
                if (!node) {
                    break;
                } else {
                    current = node.action;
                }
            } else {
                current = next;
            }
        }
    }

    public executeAction(state: GameState): CalledActionResult | Awaitable<CalledActionResult, CalledActionResult> {
        const contentNode = this.contentNode as ContentNode<ControlActionContentType[T]>;
        const [content] = contentNode.getContent() as [LogicAction.Actions[]];
        if (this.type === ControlActionTypes.do) {
            const firstNode = content[0]?.contentNode;
            const lastNode = content[content.length - 1]?.contentNode;
            const thisChild = this.contentNode.child;

            lastNode?.addChild(thisChild);
            this.contentNode.addChild(firstNode || null);
            return super.executeAction(state);
        } else if (this.type === ControlActionTypes.doAsync) {
            (async () => {
                for (const action of content) {
                    await this.executeAllActions(state, action);
                }
            })();
            return super.executeAction(state);
        } else if (this.type === ControlActionTypes.any) {
            const awaitable = new Awaitable<CalledActionResult, CalledActionResult>(v => v);
            for (const action of content) {
                this.executeAllActions(state, action).then(() => {
                    awaitable.resolve({
                        type: this.type as any,
                        node: this.contentNode.child
                    });
                });
            }
            return awaitable;
        } else if (this.type === ControlActionTypes.all) {
            const awaitable = new Awaitable<CalledActionResult, CalledActionResult>(v => v);
            const promises = content.map(action => this.executeAllActions(state, action));
            Promise.all(promises).then(() => {
                awaitable.resolve({
                    type: this.type as any,
                    node: this.contentNode.child
                });
            });
            return awaitable;
        } else if (this.type === ControlActionTypes.allAsync) {
            (async () => {
                const promises = content.map(action => this.executeAllActions(state, action));
                await Promise.all(promises);
            })();
            return super.executeAction(state);
        } else if (this.type === ControlActionTypes.repeat) { // @todo: test this
            const [actions, times] =
                (this.contentNode as ContentNode<ControlActionContentType["control:repeat"]>).getContent();
            (async () => {
                for (let i = 0; i < times; i++) {
                    for (const action of actions) {
                        await this.executeAllActions(state, action);
                    }
                }
            })();
            return super.executeAction(state);
        }

        throw new Error("Unknown control action type: " + this.type);
    }

    getFutureActions() {
        const actions = this.contentNode.getContent()[0];
        const childActions = super.getFutureActions();
        return [...actions, ...childActions];
    }
}
