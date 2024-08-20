import { Handlers, Listeners } from "../mainHandler";
import { handlers as GameHandlers, listeners as GameListeners } from "./game";
import { handlers as WindowHandlers, listeners as WindowListeners } from "./window";

export const handlers: Handlers = {
    hello: (...args) => void 0,
    ...GameHandlers,
    ...WindowHandlers,
};

export const listeners: Listeners = {
    ...GameListeners,
    ...WindowListeners,
};
