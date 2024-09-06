import React, {useEffect, useMemo, useReducer, useState} from "react";
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
        console.time("Next"); // @debug

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
        //     JSON.parse('{"name":"NewGame-1725509357830","version":"0.1.2","meta":{"created":1725509357830,"updated":1725509516035},"game":{"store":{"game":{}},"elementState":[{"id":"$2-1","data":{"state":{"src":"/static/images/kotoba_tcr_bingfu_lh_pm_xz.png","display":true,"position":{"x":"70%","y":"50%","xoffset":0,"yoffset":-20},"scale":0.3,"rotation":0,"opacity":1,"cache":false}}},{"id":"$2-3","data":{"state":{"src":{"src":"/_next/static/media/test_speechless.8b6fe21e.png","height":3000,"width":3000,"blurDataURL":"/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Ftest_speechless.8b6fe21e.png&w=8&q=70","blurWidth":8,"blurHeight":8},"display":false,"position":{"x":"30%","y":"70%","xoffset":70,"yoffset":0},"scale":0.1,"rotation":0,"opacity":0,"cache":true}}},{"id":"$4-6","data":{"config":{"src":"/static/sounds/SE_Appear_01b.wav.mp3","sync":false,"loop":false,"volume":1,"streaming":true}}}],"stage":{"elements":[{"scene":"37","ele":{"images":["$2-1"]}}]},"nodeChildIdMap":{"node-186":"node-180","node-116":"node-62"},"currentScene":0,"currentAction":"action-47"}}'),
        //     {
        //         gameState: state
        //     }
        // );

        console.log("Loaded game", game.game.getLiveGame().currentSavedGame);
        console.log(state);

        const lastScene = state.getLastScene();
        const events = [];
        if (lastScene) {
            events.push({
                type: "event:scene.mount",
                listener: lastScene.events.once("event:scene.mount", () => {
                    state.stage.next();
                })
            });
        } else {
            state.stage.next();
        }

        state.stage.forceUpdate();

        return () => {
            if (lastScene) {
                events.forEach(event => {
                    lastScene.events.off(event.type, event.listener);
                });
            }
        };
    }, []);

    function handlePreloadLoaded() {
        state.stage.forceUpdate();
        next();
    }

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
