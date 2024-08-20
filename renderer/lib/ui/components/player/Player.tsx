"use client";

import {useEffect, useMemo, useReducer, useState} from "react";
import {useGame} from "../../providers/game-state";
import {Awaitable} from "@/lib/util/data";

import Say from "./elements/Say";
import Menu from "./elements/Menu";
import {default as StageScene} from "./elements/Scene";
import {default as StageImage} from "./elements/Image";
import {Story} from "@/lib/game/game/elements/story";
import {GameState, PlayerAction} from "@lib/ui/components/player/gameState";
import {cloneDeep} from "lodash";
import {PreloadedProvider} from "@lib/ui/providers/preloaded";
import {SrcManager} from "@lib/game/game/elements/srcManager";
import {Image} from "@lib/game/game/elements/image";
import clsx from "clsx";

function handleAction(state: GameState, action: PlayerAction) {
    return state.handle(action);
}

export default function Player({
                                   story
                               }: Readonly<{
    story: Story;
}>) {
    const [, forceUpdate] = useReducer((x) => x + 1, 0);
    const {game} = useGame();
    const [state, dispatch] = useReducer(handleAction, new GameState(game, {
        forceUpdate,
        next,
        dispatch: (action) => dispatch(action),
    }));
    const _story = useMemo(() => {
        return cloneDeep(story);
    }, [story]);

    function next() {
        console.time("Next");

        let exited = false;
        while (!exited) {
            const next = game.game.getLiveGame().next(state);
            if (!next) {
                break;
            }
            if (Awaitable.isAwaitable(next)) {
                exited = true;
                break;
            }
            dispatch(next);
        }
        state.stage.forceUpdate();

        console.timeEnd("Next");
    }

    useEffect(() => {
        game.game.getLiveGame().loadStory(_story);
        game.game.getLiveGame().newGame();
        next();
    }, [story]);

    return (
        <>
            <PreloadedProvider>
                {
                    state.state.scenes.map((scene) => {
                        return (
                            <StageScene key={scene.id} state={state} scene={scene}>
                                {
                                    (console.log("loaded images: ", state.state.images.get(scene).length), state.state.images.get(scene).map((image) => {
                                        return (
                                            <StageImage key={image.id} image={image} state={state}/>
                                        )
                                    }))
                                }
                                {
                                    state.state.texts.get(scene).map((action) => {
                                        return (
                                            <Say key={action.action.id} action={action.action} onClick={() => {
                                                action.onClick();
                                                next();
                                            }}/>
                                        )
                                    })
                                }
                                {
                                    state.state.menus.get(scene).map((action, i) => {
                                        return (
                                            <div key={i}>
                                                {
                                                    <Menu prompt={action.action.prompt} choices={action.action.choices}
                                                          afterChoose={(choice) => {
                                                              action.onClick(choice);
                                                              next();
                                                          }}/>
                                                }
                                            </div>
                                        )
                                    })
                                }
                            </StageScene>
                        )
                    })
                }
            </PreloadedProvider>
        </>
    )
}
