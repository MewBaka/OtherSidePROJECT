import type {TransformDefinitions} from "narraleaf-react";
import {
    Align,
    Character,
    CommonPosition,
    CommonPositionType,
    Condition,
    Control,
    Dissolve,
    FadeIn,
    GameState,
    LiveGame,
    Menu,
    Scene,
    Script,
    Sentence,
    Story,
    Transform,
    Word
} from "narraleaf-react";

import {
    scene1,
} from "@/lib/game/story/definitions/definitions";

type GameNameSpaceContext = {
    number: number;
};

const story = new Story("test");

scene1.action([
    
]);


story.entry(scene1);

export {
    story
}


