"use client";

import { story } from "@/lib/game/story/scene1";
import { Player } from "narraleaf-react";

export default function Page() {
    return (
        <Player story={story} onReady={({game}) => {
            console.log("给木 is ready", game);
            game.getLiveGame().loadStory(story);
            game.getLiveGame().newGame();
        }} width={"100%"} height={"100%"} />
    );
};