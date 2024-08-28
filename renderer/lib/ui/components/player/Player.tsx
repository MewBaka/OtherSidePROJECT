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
import {PreloadedProvider, usePreloaded} from "@lib/ui/providers/preloaded";
import {Preload} from "@lib/ui/elements/player/Preload";
import {Scene} from "@lib/game/game/elements/scene";
import {Preloaded} from "@lib/ui/elements/player/Preloaded";

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
        forceUpdate: () => {
            forceUpdate();
        },
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

        // @debug
        // game.game.getLiveGame().loadSavedGame(
        //     JSON.parse('{"name":"NewGame-1724731442455","version":"0.1.2","meta":{"created":1724731442455,"updated":1724731543139},"game":{"store":{"game":{}},"elementState":[{"id":"$2-1","data":{"state":{"src":"/static/images/test_sensei.png","display":true,"position":"right","scale":0.7,"rotation":0,"opacity":1,"cache":false}}},{"id":"$2-3","data":{"state":{"src":{"src":"/_next/static/media/test_speechless.8b6fe21e.png","height":3000,"width":3000,"blurDataURL":"/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Ftest_speechless.8b6fe21e.png&w=8&q=70","blurWidth":8,"blurHeight":8},"display":false,"position":{"xalign":0.3,"yalign":0.7,"xoffset":70,"yoffset":-10},"scale":0.1,"rotation":0,"opacity":0,"cache":true}}},{"id":"$4-6","data":{"config":{"src":"/static/sounds/SE_Appear_01b.wav.mp3","sync":false,"loop":false,"volume":1,"streaming":true}}}],"stage":{"elements":[{"scene":"35","ele":{"images":["$2-1"]}}]},"nodeChildIdMap":{"node-189":"node-60","node-88":"node-83","node-80":"node-75","node-125":"node-58","node-58":"node-36","node-33":"node-16"},"currentScene":0,"currentAction":"action-43"}}'),
        //     {
        //         gameState: state
        //     }
        // );
        console.log("Loaded game", game.game.getLiveGame().currentSavedGame);
        console.log(state);

        state.stage.forceUpdate();
        state.stage.next();

        return () => {};
    }, []);

    function handlePreloadLoaded() {
        state.stage.forceUpdate();
        next();
    }

    console.log("stage rendered", state);

    // @todo: 改一下状态管理

    return (
        <>
            <PreloadedProvider>
                {
                    state.state.srcManagers.map((srcManager, i) => {
                        return (
                            <Preload key={i} state={state} srcManager={srcManager}/>
                        )
                    })
                }
                <OnlyPreloaded onLoaded={handlePreloadLoaded}>
                    {
                        state.getSceneElements().map(({scene, ele}) => {
                            return (
                                <StageScene key={"scene-" + scene.id} state={state} scene={scene}>
                                    {
                                        (ele.images.map((image) => {
                                            return (
                                                <StageImage key={"image-" + image.id} image={image} state={state}/>
                                            )
                                        }))
                                    }
                                    {
                                        ele.texts.map(({action, onClick}) => {
                                            return (
                                                <Say key={"say-" + action.id} action={action} onClick={() => {
                                                    onClick();
                                                    next();
                                                }}/>
                                            )
                                        })
                                    }
                                    {
                                        ele.menus.map((action, i) => {
                                            return (
                                                <div key={"menu-" + i}>
                                                    {
                                                        <Menu prompt={action.action.prompt}
                                                              choices={action.action.choices}
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
                </OnlyPreloaded>
            </PreloadedProvider>
        </>
    )
}

function OnlyPreloaded({children, onLoaded}: Readonly<{ children: React.ReactNode, onLoaded: () => void }>) {
    const {preloaded} = usePreloaded();
    const [preloadedReady, setPreloadedReady] = useState(false);
    useEffect(() => {
        const listener = preloaded.events.on(Preloaded.EventTypes["event:preloaded.ready"], () => {
            setPreloadedReady(true);
            onLoaded();
        });
        return () => {
            preloaded.events.off(Preloaded.EventTypes["event:preloaded.ready"], listener);
        }
    }, [preloadedReady]);
    return (
        <>
            {preloadedReady ? children : null}
        </>
    )
}
