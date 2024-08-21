import { ClientAPI } from "../api/ipc";
import { deepMerge } from "../util/data";
import { Game } from "./game/game";
import { FileStore, RemoteFileStoreClient } from "./game/save/storeProvider";
import { Window as IpcWindow } from "../../../main/preload";
import {Constants} from "@lib/api/config";

export type ClientGameConfig = {};
export type ClientRequirement = {
    clientAPI: ClientAPI;
};
export type ClientGamePreference = {
    afm: boolean;
};
type ClientGamePreferenceHelper = {
    setPreference: <K extends keyof ClientGamePreference>(key: keyof ClientGamePreference, value: ClientGamePreference[K]) => void;
    getPreference: <K extends keyof ClientGamePreference>(key: keyof ClientGamePreference) => ClientGamePreference[K];
}

class BaseGame {}
export class ClientGame extends BaseGame {
    static defaultConfig: ClientGameConfig = {};
    static defaultPreference: ClientGamePreference = {
        afm: false,
    };
    config: ClientGameConfig;
    clientAPI: ClientAPI;
    preference: ClientGamePreference & ClientGamePreferenceHelper;
    game: Game;
    
    constructor(config: ClientGameConfig = {}, requirement: ClientRequirement) {
        super();
        this.config = deepMerge<ClientGameConfig>(ClientGame.defaultConfig, config);
        this.clientAPI = requirement.clientAPI;
        this.preference = {
            ...deepMerge<ClientGamePreference>(ClientGame.defaultPreference, {}),
            setPreference: (key, value) => {
                this.preference[key] = value;
            },
            getPreference: (key) => {
                return this.preference[key];
            },
        };
    }
    init(window: IpcWindow) {
        this.game = new Game({
            clientGame: this,
            remoteStore: new RemoteFileStoreClient(window)
        });
        this.game.init();
        this.game.createLiveGame();
        return this;
    }
}

