import {contextBridge, ipcRenderer} from 'electron';
import {Status} from './util/status';
import {ServerConstants} from './config';

const api: IpcWindowAPI["api"] = {
    game: {
        store: {},
        localFs: {
            saved: {
                async write(id: string, data: Record<string, any>) {
                    return await ipcRenderer.invoke("game:saved.write", id, data);
                },
                async read(id: string) {
                    return await ipcRenderer.invoke("game:saved.read", id);
                },
                async list() {
                    return await ipcRenderer.invoke("game:saved.list");
                }
            },
            settings: {
                async set(namespace: string, value: any) {
                    return await ipcRenderer.invoke("game:settings.set", namespace, value);
                },
                async get(namespace: string) {
                    return await ipcRenderer.invoke("game:settings.get", namespace);
                }
            },
        }
    },
}

const app: IpcWindowAPI["app"] = {
    info: {
        version: ServerConstants.info.version,
        isProd: process.env.NODE_ENV === "production",
    }
}

/**
 * This is the object that will be exposed to the renderer process.
 */
const WindowWrapper: IpcWindowAPI = {
    api: api,
    app: app,
}

!function () {
    Object.keys(WindowWrapper).forEach(key => {
        contextBridge.exposeInMainWorld(key, WindowWrapper[key as keyof IpcWindowAPI]);
    });
    return void 0;
}();

/**
 * This is the object that will be exposed to the renderer process.
 */
export interface IpcWindowAPI {
    api: {
        game: {
            // for safe access, we cannot let the renderer process to directly access the file system.
            // do not use api.game.store
            // use api.game.localFs.saved instead for saving/loading game data.
            /**@deprecated */
            store: {},
            localFs: {
                saved: {
                    write: (id: string, data: Record<string, any>) => Promise<ExpectedHandler["game:saved.write"]>;
                    read: (id: string) => Promise<ExpectedHandler["game:saved.read"]>;
                    list: () => Promise<ExpectedHandler["game:saved.list"]>;
                },
                settings: {
                    set: (namespace: string, value: any) => Promise<ExpectedHandler["game:settings.set"]>;
                    get: (namespace: string) => Promise<ExpectedHandler["game:settings.get"]>;
                }
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
    "game:settings.set": Status;
    "game:settings.get": Status<any>;
    "game:store.write": Status;
    "game:store.read": Status<Record<string, any>>;
    "game:store.list": Status<string[]>;
    "game:store.isExists": Status<boolean>;
    "game:saved.write": Status;
    "game:saved.read": Status<Record<string, any>>;
    "game:saved.list": Status<string[]>;

}

export interface ExpectedListener {
    "window:minimize": void;
    "window:maximize": void;
    "window:close": void;
}
