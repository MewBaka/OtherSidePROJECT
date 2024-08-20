import type {CalledActionResult, GameConfig, GameSettings, SavedGame} from "./gameTypes";

import {RenderableNode, RootNode} from "./save/rollback";
import {Awaitable, deepMerge, safeClone} from "@lib/util/data";
import {Namespace, Storable, StorableData} from "./save/store";
import {Singleton} from "@lib/util/singleton";
import {Constants} from "@/lib/api/config";
import type {Story} from "./elements/story";
import {LogicAction} from "@lib/game/game/logicAction";
import {GameState} from "@lib/ui/components/player/gameState";
import { cloneDeep } from "lodash";

class IdManager extends Singleton<IdManager>() {
    private id = 0;

    public getId() {
        return this.id++;
    }

    public getStringId() {
        return (this.id++).toString();
    }

    prefix(prefix: string, value: string, separator = ":") {
        return prefix + separator + value;
    }
}

class GameIdManager {
    private id = 0;

    public getId() {
        return this.id++;
    }

    public getStringId() {
        return (this.id++).toString();
    }

    prefix(prefix: string, value: string, separator = ":") {
        return prefix + separator + value;
    }
}

export class Game {
    static defaultSettings: GameSettings = {
        volume: 1,
    };
    config: GameConfig;
    root: RootNode;
    liveGame: LiveGame | null = null;
    /**
     * Game settings
     */
    settings: GameSettings;

    constructor(config: GameConfig) {
        this.config = config;
        this.root = new RootNode();
        this.settings = deepMerge({}, Game.defaultSettings);
    }

    static getIdManager() {
        return IdManager.getInstance();
    };

    public init() {
    }

    public registerStory(story: Story) {
        story.setRoot(this.getRootNode());
        return this;
    }

    /* Tree */
    public getRootNode() {
        return this.root;
    }

    /* Live Game */
    public getLiveGame() {
        if (!this.liveGame) {
            this.createLiveGame();
        }
        return this.liveGame;
    }

    public createLiveGame() {
        this.liveGame = new LiveGame(this);
        return this.liveGame;
    }

    /* Settings */
    getSettingName() {
        return this.config.remoteStore.getName("settings", Constants.app.store.settingFileSuffix);
    }

    public async readSettings() {
        if (!await this.config.remoteStore.isFileExists(this.getSettingName())) {
            return await this.saveSettings();
        }
        return await this.config.remoteStore.load<GameSettings>(this.getSettingName());
    }

    public async saveSettings() {
        const settings = safeClone(this.settings);
        await this.config.remoteStore.save(this.getSettingName(), settings);
        return settings;
    }

    /* Save */
}

export class LiveGame {
    static DefaultNamespaces = {
        game: {},
    };
    static GameSpacesKey = {
        game: "game",
    } as const;

    game: Game;
    storable: Storable;

    currentSceneNumber: number | null = null;
    currentNode: RenderableNode | null = null;
    currentAction: LogicAction.Actions | null = null;
    currentSavedGame: SavedGame | null = null;
    story: Story | null = null;
    lockedAwaiting: Awaitable<CalledActionResult, any> | null = null;
    idManager: GameIdManager;

    /**
     * Possible future nodes
     */
    future: RenderableNode[] = [];

    constructor(game: Game) {
        this.game = game;
        this.storable = new Storable();

        this.initNamespaces();
        this.idManager = new GameIdManager();
    }

    getDefaultSavedGame(): SavedGame {
        return {
            name: "_",
            version: Constants.info.app.version,
            meta: {
                created: Date.now(),
                updated: Date.now(),
            },
            game: {
                store: {},
            }
        };
    }

    /* Store */
    initNamespaces() {
        this.storable.addNamespace(new Namespace<StorableData>(LiveGame.GameSpacesKey.game, LiveGame.DefaultNamespaces.game));
        return this;
    }

    /* Game */
    loadStory(story: Story) {
        this.story = story;
        return this;
    }

    newGame() {
        this.initNamespaces();

        this.currentSceneNumber = 0;
        this.currentAction = this.story?.actions[this.currentSceneNumber];

        const newGame = this.getDefaultSavedGame();
        newGame.name = "NewGame-" + Date.now();
        this.currentSavedGame = newGame;

        return this;
    }

    setCurrentNode(node: RenderableNode) {
        this.currentNode = node;
        return this;
    }

    next(state: GameState): CalledActionResult | Awaitable<CalledActionResult, CalledActionResult> | null {
        if (this.lockedAwaiting) {
            if (!this.lockedAwaiting.solved) {
                console.log("Locked awaiting");
                return this.lockedAwaiting;
            }
            const next = this.lockedAwaiting.result;
            this.currentAction = next.node?.callee || null;
            this.lockedAwaiting = null;
            return next;
        }

        this.currentAction = this.currentAction || this.story.actions[++this.currentSceneNumber];
        if (!this.currentAction) {
            console.log("No current action"); // Congrats, you've reached the end of the story
            return null;
        }

        const nextAction = this.currentAction.executeAction(state);
        if (Awaitable.isAwaitable(nextAction)) {
            this.lockedAwaiting = nextAction;
            return nextAction;
        }

        this.currentAction = nextAction.node.child?.callee;
        return nextAction;
    }

    executeAction(state: GameState, action: LogicAction.Actions): LogicAction.Actions | Awaitable<CalledActionResult, CalledActionResult> | null {
        const nextAction = action.executeAction(state);
        if (Awaitable.isAwaitable(nextAction)) {
            return nextAction;
        }
        return nextAction.node.child?.callee;
    }
}

export default {
    Game,
    LiveGame,
}

export type {
    LogicAction
}

