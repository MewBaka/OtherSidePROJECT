import {ClientGame} from "../game";
import {ContentNode, RawData} from "./save/rollback";
import {StorableData} from "./save/store";
import {RemoteFileStoreClient} from "./save/storeProvider";
import {LogicAction} from "@lib/game/game/logicAction";
import {StoryDataRaw} from "@lib/game/game/elements/story";


export interface SavedGame {
    name: string;
    version: string;
    meta: {
        created: number;
        updated: number;
    };
    game: {
        store: { [key: string]: StorableData; };
        story: RawData<StoryDataRaw>[];
    };
}

export type GameConfig = {
    clientGame: ClientGame;
    remoteStore: RemoteFileStoreClient;
};
export type GameSettings = {
    volume: number;
};
export type CalledActionResult<T extends keyof LogicAction.ActionContents = undefined> = {
    [K in keyof LogicAction.ActionContents]: {
        type: T extends undefined ? K : T;
        node: ContentNode<LogicAction.ActionContents[T extends undefined ? K : T]>;
    }
}[keyof LogicAction.ActionContents];



