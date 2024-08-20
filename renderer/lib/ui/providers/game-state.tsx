"use client";

import {ClientAPI} from "@/lib/api/ipc";
import {ClientGame} from "@/lib/game/game";
import {createContext, ReactNode, useContext, useState} from "react";

type GameContextType = {
    game: ClientGame;
    setGame: (update: (prevGame: ClientGame) => ClientGame) => void;
};

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({children}: { children: ReactNode }) {
    "use client";
    const clientAPI = typeof window !== "undefined" ? ClientAPI.getInstance(window) : null;
    const DefaultValue = new ClientGame({}, {clientAPI: clientAPI}).init(clientAPI?.window);
    const [game, setGame] = useState<ClientGame>(DefaultValue);

    const updateGame = (update: (prevGame: ClientGame) => ClientGame) => {
        setGame(prevGame => {
            const newGame = update(prevGame);
            return new ClientGame(newGame, {clientAPI: ClientAPI.getInstance(window)});
        });
    };

    return (
        <GameContext.Provider value={{game, setGame: updateGame}}>
            {children}
        </GameContext.Provider>
    );
}

export function useGame(): GameContextType {
    const context = useContext(GameContext);
    if (!context) throw new Error("useGame must be used within a GameProvider");
    return context;
}