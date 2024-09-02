import type { Window as IpcWindow } from "@/preload";

export type PreloadedWindow = Window & IpcWindow;
export class ClientAPI {
    private static instance: ClientAPI;
    static getInstance(window: any): ClientAPI {
        if (this.instance) return this.instance;
        this.instance = new ClientAPI(window);
        return this.instance;
    }

    window: PreloadedWindow;
    gameAPI: GameAPI;
    private constructor(window: PreloadedWindow) {
        this.window = window;
        this.gameAPI = new GameAPI(this);
    }
}

export class GameAPI {
    clientAPI: ClientAPI;
    constructor(clientAPI: ClientAPI) {
        this.clientAPI = clientAPI;
    }
}
