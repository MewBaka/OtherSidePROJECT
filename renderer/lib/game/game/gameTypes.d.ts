import {ClientGame} from "../game";
import {ContentNode} from "./save/rollback";
import {StorableData} from "./save/store";
import {FileStore, RemoteFileStoreClient} from "./save/storeProvider";
import {LogicAction} from "@lib/game/game/logicAction";


export interface SavedGame {
    name: string;
    version: string;
    meta: {
        created: number;
        updated: number;
    };
    game: {
        store: { [key: string]: StorableData; };
    };
}

export type GameConfig = {
    /**@deprecated */
    settingFileStore?: FileStore;
    /**@deprecated */
    saveFileStore?: FileStore;
    clientGame: ClientGame;
    remoteStore: RemoteFileStoreClient;
};
export type GameSettings = {
    volume: number;
};
/**@deprecated */
export type ClientActionProto<T> = {
    type: string;
    id: string;
    content: T;
};
/**@deprecated */
export type ClientResponseProto<T> = {
    content: T;
};
export type CalledActionResult<T extends keyof LogicAction.ActionContents = undefined> = {
    [K in keyof LogicAction.ActionContents]: {
        type: T extends undefined ? K : T;
        node: ContentNode<LogicAction.ActionContents[T extends undefined ? K : T]>;
    }
}[keyof LogicAction.ActionContents];



