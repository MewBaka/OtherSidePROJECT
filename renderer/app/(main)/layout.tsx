"use client";

import clsx from "clsx";
import React, {useState} from "react";
import {Full, Game, GameProviders, Player, Scene, Story} from "narraleaf-react";

export default function Layout({
                                   children,
                               }: Readonly<{
    children: React.ReactNode;
}>) {
    const [game] = useState(() => new Game({
        player: {
            ratioUpdateInterval: 0,
        }
    }));


    return (
        <>
            <GameProviders game={game}>
                <Player story={new Story("$root").entry(new Scene(""))} width={"100%"} height={"100%"}>
                    <Full className={"w-full h-full"}>
                        <div
                            className={clsx("bg-[url('/static/images/main-menu-background.png')] flex bg-cover bg-center h-full w-full absolute")}>
                            {children}
                        </div>
                    </Full>
                </Player>
            </GameProviders>
        </>
    )
};
