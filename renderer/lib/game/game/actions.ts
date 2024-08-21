import {ContentNode} from "@lib/game/game/save/rollback";
import {Awaitable} from "@lib/util/data";
import {Background, CommonImage} from "@lib/game/game/show";
import {Transform} from "@lib/game/game/elements/transform/transform";
import {Image} from "@lib/game/game/elements/image";
import {LogicAction} from "@lib/game/game/logicAction";
import {Action} from "@lib/game/game/action";
import type {Character, Sentence} from "@lib/game/game/elements/text";
import type {Scene} from "@lib/game/game/elements/scene";
import type {Story} from "@lib/game/game/elements/story";
import type {Script} from "@lib/game/game/elements/script";
import {Menu, MenuData} from "@lib/game/game/elements/menu";
import type {Condition, ConditionData} from "@lib/game/game/elements/condition";
import type {CalledActionResult} from "@lib/game/game/gameTypes";
import {GameState} from "@lib/ui/components/player/gameState";
import {Sound} from "@lib/game/game/elements/sound";
import {Control} from "@lib/game/game/elements/control";
import {TransformDefinitions} from "@lib/game/game/elements/transform/type";
import {ITransition} from "@lib/game/game/elements/transition/type";
import ImageTransformProps = TransformDefinitions.ImageTransformProps;
import Actions = LogicAction.Actions;

export class TypedAction<
    ContentType extends Record<string, any>,
    T extends keyof ContentType & string,
    Callee extends LogicAction.GameElement
> extends Action<ContentType[T]> {
    declare callee: Callee;

    constructor(callee: Callee, type: any, contentNode: ContentNode<ContentType[T]>) {
        super(callee, type, contentNode);
        this.callee = callee;
        this.contentNode.callee = this;
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

export class CharacterAction<T extends typeof CharacterActionTypes[keyof typeof CharacterActionTypes]>
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
                        any;
}

export class SceneAction<T extends typeof SceneActionTypes[keyof typeof SceneActionTypes]>
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
        }

        throw new Error("Unknown scene action type: " + this.type);
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

export class StoryAction<T extends typeof StoryActionTypes[keyof typeof StoryActionTypes]>
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

export class ImageAction<T extends typeof ImageActionTypes[keyof typeof ImageActionTypes]>
    extends TypedAction<ImageActionContentType, T, Image> {
    static ActionTypes = ImageActionTypes;

    public executeAction(state: GameState): CalledActionResult | Awaitable<CalledActionResult, any> {
        if (this.type === ImageActionTypes.init) {
            const scene = (this.contentNode as ContentNode<ImageActionContentType["image:init"]>).getContent()[0];
            if (this.callee.id === null) {
                this.callee.setId(state.clientGame.game.getLiveGame().idManager.getStringId());
                state.createImage(this.callee, scene);
                state.stage.forceUpdate();
            }
            // else {
            //     const lastScene = state.findImage(this.callee);
            //     if (lastScene) {
            //         state.disposeImage(this.callee, lastScene);
            //     }
            //     state.createImage(this.callee, scene);
            //     state.stage.forceUpdate();
            // }
            if (this.callee.initiated) {
                return super.executeAction(state);
            }
            this.callee.initiated = true;
            const awaitable = new Awaitable<CalledActionResult, any>(v => v);
            const transform = new Transform<ImageTransformProps>([{
                props: this.callee.state,
                options: {
                    duration: 0,
                }
            }], {
                sync: true
            });

            this.callee.events.once("event:image.mount", () => {
                state.animateImage(Image.EventTypes["event:image.applyTransform"], this.callee, [
                    transform
                ], () => {
                    awaitable.resolve({
                        type: this.type,
                        node: this.contentNode?.child || null,
                    });
                });
            });
            return awaitable;
        }

        if (!this.callee.id) {
            throw new Error("Image is not initiated, please call \"image.init()\" first.");
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
            state.animateImage(Image.EventTypes["event:image.applyTransform"], this.callee, [
                transform
            ], () => {
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

export class ConditionAction<T extends typeof ConditionActionTypes[keyof typeof ConditionActionTypes]>
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

export class ScriptAction<T extends typeof ScriptActionTypes[keyof typeof ScriptActionTypes]>
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

export class MenuAction<T extends typeof MenuActionTypes[keyof typeof MenuActionTypes]>
    extends TypedAction<MenuActionContentType, T, Menu> {
    static ActionTypes = MenuActionTypes;

    public executeAction(state: GameState): Awaitable<CalledActionResult, any> {
        const awaitable = new Awaitable<CalledActionResult, CalledActionResult>(v => v);
        const menu = this.contentNode.getContent() as MenuData;

        state.createMenu(menu, v => {
            let lastChild = state.clientGame.game.getLiveGame().currentAction.contentNode.child;
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
}

export const SoundActionTypes = {
    action: "sound:action",
    play: "sound:play",
    stop: "sound:stop", // @todo: add pause and resume
} as const;
export type SoundActionContentType = {
    [K in typeof SoundActionTypes[keyof typeof SoundActionTypes]]:
    K extends "sound:play" ? [void] :
        K extends "sound:stop" ? [void] :
            any;
}

export class SoundAction<T extends typeof SoundActionTypes[keyof typeof SoundActionTypes]>
    extends TypedAction<SoundActionContentType, T, Sound> {
    static ActionTypes = SoundActionTypes;

    public executeAction(state: GameState): CalledActionResult | Awaitable<CalledActionResult, any> {
        if (this.type === SoundActionTypes.play) {
            if (!this.callee.$getHowl()) {
                this.callee.$setHowl(
                    new (state.getHowl())({
                        src: this.callee.config.src,
                        loop: this.callee.config.loop,
                        volume: this.callee.config.volume,
                        autoplay: false,
                    })
                )
            }
            if (this.callee.config.sync && !this.callee.config.loop) {
                const awaitable = new Awaitable<CalledActionResult, any>(v => v);
                state.playSound(this.callee.$getHowl(), () => {
                    this.callee.$setHowl(null);
                    console.log("sound end, ", this.contentNode);
                    awaitable.resolve({
                        type: this.type as any,
                        node: this.contentNode?.child || null
                    });
                })
                return awaitable;
            } else {
                state.playSound(this.callee.$getHowl(), () => {
                    this.callee.$setHowl(null);
                });
                return super.executeAction(state);
            }
        } else if (this.type === SoundActionTypes.stop) {
            if (this.callee.$getHowl()) {
                this.callee.$getHowl().stop();
                this.callee.$setHowl(null);
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
} as const;
export type ControlActionContentType = {
    [K in typeof ControlActionTypes[keyof typeof ControlActionTypes]]:
    K extends "control:do" ? [LogicAction.Actions[]] :
        K extends "control:doAsync" ? [LogicAction.Actions[]] :
            K extends "control:any" ? [LogicAction.Actions[]] :
                K extends "control:all" ? [LogicAction.Actions[]] :
                    K extends "control:parallel" ? [LogicAction.Actions[]] :
                        any;
}

export class ControlAction<T extends typeof ControlActionTypes[keyof typeof ControlActionTypes]>
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
                    current = node.callee;
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
        }

        throw new Error("Unknown control action type: " + this.type);
    }
}
