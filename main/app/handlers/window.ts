import { ExpectedHandler, ExpectedListener } from "../../preload";
import { Prefix } from "../../util/type";
import { Handlers, Listeners } from "../mainHandler";

type WINDOW_KEY = "window";

export const handlers: Handlers<Prefix<ExpectedHandler, WINDOW_KEY>> = {};
export const listeners: Listeners<Prefix<ExpectedListener, WINDOW_KEY>> = {
    "window:minimize": ({ mainWindow }) => {
        mainWindow.minimize();
    },
    "window:maximize": ({ mainWindow }) => {
        if (mainWindow.isMaximized()) {
            mainWindow.unmaximize();
        } else {
            mainWindow.maximize();
        }
    },
    "window:close": ({ mainWindow }) => {
        mainWindow.close();
    }
};

