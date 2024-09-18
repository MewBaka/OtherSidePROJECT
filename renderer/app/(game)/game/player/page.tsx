"use client";

import { story } from "@/lib/game/story/scene1";
import { GameProviders, Player } from "narraleaf-react";

export default function Page() {
    return (
        <Player story={story} />
    );
};