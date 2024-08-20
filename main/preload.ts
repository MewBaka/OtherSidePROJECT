import {contextBridge, ipcRenderer} from 'electron';
import {Status} from './util/status';
import {ServerConstants} from './config';

const api = {
    hello(...args: any[]) {
        return ipcRenderer.invoke("hello", ...args);
    },
    winFrame: {
        minimize() {
            ipcRenderer.send("window:minimize");
        },
        maximize() {
            ipcRenderer.send("window:maximize");
        },
        close() {
            ipcRenderer.send("window:close");
        },
    },
    game: {
        async requestGame() {
            return await ipcRenderer.invoke("game:requestGame");
        },
        store: {
            async write(name: string, data: Record<string, any>) {
                return await ipcRenderer.invoke("game:store.write", name, data);
            },
            async read(name: string) {
                return await ipcRenderer.invoke("game:store.read", name);
            },
            async list() {
                return await ipcRenderer.invoke("game:store.list");
            },
            async isExists(name: string) {
                return await ipcRenderer.invoke("game:store.isExists", name);
            }
        }
    },
}

const app = {
    info: {
        version: ServerConstants.info.version,
        isProd: process.env.NODE_ENV === "production",
    }
}

/**
 * This is the object that will be exposed to the renderer process.
 */
const WindowWrapper: Window = {
    api: api,
    app: app,
}

!function () {
    Object.keys(WindowWrapper).forEach(key => {
        contextBridge.exposeInMainWorld(key, WindowWrapper[key as keyof Window]);
    });
    return void 0;
}();

/**
 * This is the object that will be exposed to the renderer process.
 */
export interface Window {
    api: {
        /**
         * @deprecated
         */
        hello: () => Promise<ExpectedHandler["hello"]>;
        winFrame: {
            minimize: () => void;
            maximize: () => void;
            close: () => void;
        };
        game: {
            /**@deprecated */
            requestGame: () => Promise<ExpectedHandler["game:requestGame"]>;
            store: {
                write: (name: string, data: Record<string, any>) => Promise<ExpectedHandler["game:store.write"]>;
                read: (name: string) => Promise<ExpectedHandler["game:store.read"]>;
                list: () => Promise<ExpectedHandler["game:store.list"]>;
                isExists: (name: string) => Promise<ExpectedHandler["game:store.isExists"]>;
            }
        };
    };
    app: {
        info: {
            version: string;
            isProd: boolean;
        }
    }
}

/**
 * after invoking, the return value will be returned to the renderer process.
 */
export interface ExpectedHandler {
    "hello": void;
    "game:requestGame": Status<any>;
    "game:settings.set": Status<void, Error>;
    "game:settings.get": Status<any, Error>;
    "game:settings.all": Status<any, Error>;
    "game:store.write": Status<void, Error>;
    "game:store.read": Status<Record<string, any>, Error>;
    "game:store.list": Status<string[], Error>;
    "game:store.isExists": Status<boolean, Error>;
}

export interface ExpectedListener {
    "window:minimize": void;
    "window:maximize": void;
    "window:close": void;
}
