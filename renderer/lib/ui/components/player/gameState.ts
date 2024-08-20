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

type Clickable<T, U = undefined> = {
    action: T;
    onClick: U extends undefined ? () => void : (arg0: U) => void;
};
export type PlayerState = {
    history: CalledActionResult[];
    sounds: Sound[];
    scenes: Scene[];
    texts: Map<Scene, Clickable<{
        character: Character;
        sentence: Sentence;
        id: string;
    }>[]>;
    menus: Map<Scene, Clickable<{
        prompt: Sentence;
        choices: Choice[];
    }, Choice>[]>;
    images: Map<Scene, Image[]>;
    srcManagers: SrcManager[];
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
        history: [],
        sounds: [],
        scenes: [],
        texts: new Map<Scene, Clickable<{
            character: Character;
            sentence: Sentence;
            id: string;
        }>[]>(),
        menus: new Map<Scene, Clickable<{
            prompt: Sentence;
            choices: Choice[];
        }, Choice>[]>(),
        images: new Map<Scene, Image[]>(),
        srcManagers: [],
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

    public addScene(scene: Scene): this {
        this.state.scenes.push(scene);
        this.setElements(scene);
        return this;
    }

    public popScene(): this {
        const scene = this.state.scenes.pop();
        if (!scene) return this;
        this.removeElements(scene);
        return this;
    }

    private getElementMap() {
        return {
            "texts": this.state.texts,
            "menus": this.state.menus,
            "images": this.state.images,
        };
    }

    private setElements(scene: Scene): this {
        const elements = this.getElementMap();
        for (const [key, value] of Object.entries(elements)) {
            if (!value.has(scene)) {
                value.set(scene, []);
            }
        }
        return this;
    }

    private removeElements(scene: Scene): this {
        const elements = this.getElementMap();
        for (const [key, value] of Object.entries(elements)) {
            if (value.has(scene)) {
                value.delete(scene);
            }
        }
        return this;
    }

    public getLastScene(): Scene | null {
        return this.state.scenes[this.state.scenes.length - 1] || null;
    }

    public sceneExists(scene?: Scene): boolean {
        if (!scene) return !!this.getLastScene();
        return this.state.scenes.includes(scene);
    }

    handle(action: PlayerAction): this {
        if (this.currentHandling === action) return this;
        this.currentHandling = action;
        this.state.history.push(action);

        switch (action.type) {
            case "condition:action":
                break;
        }
        console.log("[handle]", action); // @debug
        return this;
    }

    public createText(id: string, sentence: Sentence, afterClick?: () => void, scene?: Scene) {
        return this.createWaitableAction(this.state.texts.get(this._getLastSceneIfNot(scene)), {
            character: sentence.character,
            sentence,
            id
        }, afterClick);
    }

    public createMenu(menu: MenuData, afterChoose?: (choice: Choice) => void, scene?: Scene) {
        return this.createWaitableAction(this.state.menus.get(this._getLastSceneIfNot(scene)), menu, afterChoose);
    }

    public createImage(image: Image, scene?: Scene) {
        this.state.images.get(this._getLastSceneIfNot(scene)).push(image);
    }

    private _getLastSceneIfNot(scene: Scene) {
        const targetScene = scene || this.getLastScene();
        if (!targetScene) {
            throw new Error("Scene not found, please call \"scene.active()\" first.");
        }
        return targetScene;
    }

    playSound(howl: Howler.Howl, onEnd?: () => void) {
        howl.play();
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

    private anyEvent(type: any, target: any, onEnd: () => void, ...args: any[]) {
        target.events.any(
            type,
            ...args
        ).then(onEnd).then(() => {
            this.stage.next();
        });
        return void 0;
    }

    private createWaitableAction(target: any[], action: Record<string, any>, after?: (...args: unknown[]) => void) {
        let resolve: any = null;
        const item = {
            action,
            onClick: (...args: unknown[]) => {
                target.splice(target.indexOf(item), 1);
                if (after) after(...args);
                resolve();
            }
        };
        target.push(item);
        this.stage.forceUpdate();
        return new Promise<void>((r) => {
            resolve = r;
        });
    }
}