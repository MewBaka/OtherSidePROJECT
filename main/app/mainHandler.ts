import type { ExpectedHandler, ExpectedListener } from "../preload";
import { Singleton } from "../util/singleton";
import * as AppHandlers from "./handlers/index";

export type Handlers<T = ExpectedHandler> = {
    [K in keyof T]: (ctx: {
        event: Electron.IpcMainInvokeEvent;
        mainWindow: Electron.BrowserWindow;
    }, ...args: unknown[]) => Promise<T[K]> | T[K];
};
export type Listeners<T = ExpectedListener> = {
    [K in keyof T]: (ctx: {
        event: Electron.IpcMainInvokeEvent;
        mainWindow: Electron.BrowserWindow;
    }, ...args: unknown[]) => Promise<T[K]> | T[K];
};

const handlers: Handlers = AppHandlers.handlers as Handlers;
const listeners: Listeners = AppHandlers.listeners as Listeners;


export class RemoteHandler extends Singleton<RemoteHandler>() {
    register(ipcMain: Electron.IpcMain, mainWindow: Electron.BrowserWindow) {
        for (const [key, handler] of Object.entries(handlers)) {
            ipcMain.handle(key, async (event, ...args: unknown[]) =>
                (handler as (...args: unknown[]) => unknown)({
                    event,
                    mainWindow: mainWindow
                }, ...args)
            );
        }
        for (const [key, listener] of Object.entries(listeners)) {
            ipcMain.on(key, async (event, ...args: unknown[]) =>
                (listener as (...args: unknown[]) => unknown)({
                    event,
                    mainWindow: mainWindow
                }, ...args)
            );
        }
    }
    off(ipcMain: Electron.IpcMain, key: keyof ExpectedHandler) {
        ipcMain.removeHandler(key);
    }
    on(ipcMain: Electron.IpcMain, key: string, listener: (events: Electron.IpcMainInvokeEvent, ...args: unknown[]) => void) {
        return ipcMain.on(key, listener);
    }
}
