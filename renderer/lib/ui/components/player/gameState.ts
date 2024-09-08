import {CalledActionResult} from "@lib/game/game/gameTypes";
import {ClientGame} from "@lib/game/game";
import {EventDispatcher} from "@lib/util/data";
import {Character, Sentence} from "@lib/game/game/elements/text";
import {Choice, MenuData} from "@lib/game/game/elements/menu";
import {Image, ImageEventTypes} from "@lib/game/game/elements/image";
import {Scene} from "@lib/game/game/elements/scene";
import {Sound} from "@lib/game/game/elements/sound";
import * as Howler from "howler";
import {SrcManager} from "@lib/game/game/elements/srcManager";
import {LogicAction} from "@lib/game/game/logicAction";
import {Storable} from "@lib/game/game/save/storable";

type Clickable<T, U = undefined> = {
    action: T;
    onClick: U extends undefined ? () => void : (arg0: U) => void;
};

type TextElement = {
    character: Character;
    sentence: Sentence;
    id: string;
};

type MenuElement = {
    prompt: Sentence;
    choices: Choice[];
};

type PlayerStateElement = {
    texts: Clickable<TextElement>[];
    menus: Clickable<MenuElement, Choice>[];
    images: Image[];
};
export type PlayerState = {
    sounds: Sound[];
    srcManagers: SrcManager[];
    elements: { scene: Scene, ele: PlayerStateElement }[];
};
export type PlayerStateData = {
    elements: {
        scene: string;
        ele: {
            images: string[];
        };
    }[]
};
export type PlayerAction = CalledActionResult;

interface StageUtils {
    forceUpdate: () => void;
    next: () => void;
    dispatch: (action: PlayerAction) => void;
}


type GameStateEvents = {
    "event:state.imageLoaded": [];
};

export class GameState {
    static EventTypes: { [K in keyof GameStateEvents]: K } = {
        "event:state.imageLoaded": "event:state.imageLoaded",
    };
    state: PlayerState = {
        sounds: [],
        srcManagers: [],
        elements: [],
    };
    currentHandling: CalledActionResult | null = null;
    stage: StageUtils;
    clientGame: ClientGame;
    public readonly events: EventDispatcher<GameStateEvents>;

    constructor(clientGame: ClientGame, stage: StageUtils) {
        this.stage = stage;
        this.clientGame = clientGame;
        this.events = new EventDispatcher();
    }

    public findElementByScene(scene: Scene): { scene: Scene, ele: PlayerStateElement } | null {
        return this.state.elements.find(e => e.scene === scene) || null;
    }

    public findElementByImage(image: Image): { scene: Scene, ele: PlayerStateElement } | null {
        return this.state.elements.find(e => e.ele.images.includes(image)) || null;
    }

    public addScene(scene: Scene): this {
        if (this.sceneExists(scene)) return this;
        this.state.elements.push({
            scene,
            ele: this.getElementMap()
        });
        return this;
    }

    public popScene(): this {
        const scene = this.state.elements.pop();
        if (!scene) return this;
        this.removeElements(scene.scene);
        return this;
    }

    public removeScene(scene: Scene): this {
        this.removeElements(scene);
        return this;
    }

    public getSceneElements() {
        return this.state.elements;
    }

    public getLastScene(): Scene | null {
        return this.state.elements[this.state.elements.length - 1]?.scene || null;
    }

    public sceneExists(scene?: Scene): boolean {
        if (!scene) return !!this.getLastScene();
        return this.state.elements.some(s => s.scene === scene);
    }

    handle(action: PlayerAction): this {
        if (this.currentHandling === action) return this;
        this.currentHandling = action;

        switch (action.type) {
            case "condition:action":
                break;
        }
        console.log("[handle]", action); // @debug
        return this;
    }

    public createText(id: string, sentence: Sentence, afterClick?: () => void, scene?: Scene) {
        const texts = this.findElementByScene(this._getLastSceneIfNot(scene))?.ele.texts;
        const action = this.createWaitableAction({
            character: sentence.character,
            sentence,
            id
        }, () => {
            texts.splice(texts.indexOf(action as any), 1);
            if (afterClick) afterClick();
        });
        texts.push(action);
    }

    public createMenu(menu: MenuData, afterChoose?: (choice: Choice) => void, scene?: Scene) {
        if (!menu.choices.length) {
            throw new Error("Menu must have at least one choice");
        }
        const menus = this.findElementByScene(this._getLastSceneIfNot(scene))?.ele.menus;
        const action = this.createWaitableAction(menu, (choice: Choice) => {
            menus.splice(menus.indexOf(action as any), 1);
            if (afterChoose) afterChoose(choice);
        });
        menus.push(action);
    }

    public createImage(image: Image, scene?: Scene) {
        const targetScene = this._getLastSceneIfNot(scene);
        const targetElement = this.findElementByScene(targetScene);
        if (!targetElement) return this;
        targetElement.ele.images.push(image);
        return this;
    }

    public disposeImage(image: Image, scene?: Scene) {
        const targetScene = this._getLastSceneIfNot(scene);
        const images = this.findElementByScene(targetScene)?.ele.images;
        const index = images.indexOf(image);
        if (index === -1) {
            throw new Error("Image not found");
        }
        images.splice(index, 1);
        return this;
    }

    playSound(howl: Howler.Howl, onEnd?: () => void): any {
        const token = howl.play();
        const events = [
            howl.once("end", end.bind(this)),
            howl.once("stop", end.bind(this))
        ];

        function end(this: GameState) {
            if (onEnd) {
                onEnd();
            }
            events.forEach(e => e.off());
            this.stage.next();
        }

        return token;
    }

    getHowl(): typeof Howler.Howl {
        return Howler.Howl;
    }

    animateImage<T extends keyof ImageEventTypes>(type: T, target: Image, args: ImageEventTypes[T], onEnd: () => void) {
        return this.anyEvent(type, target, onEnd, ...args);
    }

    public registerSrcManager(srcManager: SrcManager) {
        this.state.srcManagers.push(srcManager);
        return this;
    }

    public offSrcManager(srcManager: SrcManager) {
        this.state.srcManagers = this.state.srcManagers.filter(s => s !== srcManager);
        return this
    }

    public getStorable(): Storable {
        return this.clientGame.game.getLiveGame().getStorable();
    }

    private getElementMap() {
        return {
            texts: [],
            menus: [],
            images: []
        };
    }

    private removeElements(scene: Scene): this {
        const index = this.state.elements.findIndex(s => s.scene === scene);
        if (index === -1) return this;
        this.state.elements.splice(index, 1);
        return this;
    }

    private _getLastSceneIfNot(scene: Scene | null | void) {
        const targetScene = scene || this.getLastScene();
        if (!targetScene || !this.sceneExists(targetScene)) {
            throw new Error("Scene not found, please call \"scene.activate()\" first.");
        }
        return targetScene;
    }

    private anyEvent(type: any, target: any, onEnd: () => void, ...args: any[]) {
        (target.events as EventDispatcher<any>).any(
            type,
            ...args
        ).then(onEnd).then(() => {
            this.stage.next();
        });
        return void 0;
    }

    private createWaitableAction(action: Record<string, any>, after?: (...args: unknown[]) => void) {
        const item: Clickable<any> = {
            action,
            onClick: (...args: unknown[]) => {
                if (after) after(...args);
            }
        };
        return item;
    }

    toData(): PlayerStateData {
        return {
            elements: this.state.elements.map(e => {
                return {
                    scene: e.scene.id,
                    ele: {
                        images: e.ele.images.map(i => i.id)
                    }
                }
            })
        };
    }

    loadData(data: PlayerStateData, actions: LogicAction.Actions[]) {
        this.state.elements = [];

        const story = this.clientGame.game.getLiveGame().story;
        const allElements = story.getAllElements(actions);
        const {elements} = data;
        elements.forEach(e => {
            const [
                scene,
                ...images
            ] = (story.findElementsByIds([e.scene, ...e.ele.images], allElements) as [Scene, ...Image[]]);
            const element: { scene: Scene, ele: PlayerStateElement } = {
                scene: scene,
                ele: {
                    images: images,
                    menus: [],
                    texts: []
                }
            };
            this.state.elements.push(element);
            this.state.srcManagers.push(element.scene.srcManager);
        });
    }
}