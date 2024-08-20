import type { Window as IpcWindow } from "@/preload";

type WindowWithAPI = Window & IpcWindow;
export class ClientAPI {
    private static instance: ClientAPI;
    static getInstance(window: any): ClientAPI {
        if (this.instance) return this.instance;
        this.instance = new ClientAPI(window);
        return this.instance;
    }

    window: WindowWithAPI;
    winFrame: WinFrame;
    gameAPI: GameAPI;
    private constructor(window: WindowWithAPI) {
        this.window = window;
        this.winFrame = new WinFrame(this);
        this.gameAPI = new GameAPI(this);
    }
}

export class GameAPI {
    clientAPI: ClientAPI;
    constructor(clientAPI: ClientAPI) {
        this.clientAPI = clientAPI;
    }
    requestGame() {
        return this.clientAPI.window.api.game.requestGame();
    }
}

export class WinFrame {
    clientAPI: ClientAPI;
    constructor(clientAPI: ClientAPI) {
        this.clientAPI = clientAPI;
    }
    minimize() {
        this.clientAPI.window.api.winFrame.minimize();
    }
    maximize() {
        this.clientAPI.window.api.winFrame.maximize();
    }
    close() {
        this.clientAPI.window.api.winFrame.close();
    }
}
