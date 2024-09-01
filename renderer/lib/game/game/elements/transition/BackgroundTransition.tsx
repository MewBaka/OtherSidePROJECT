"use client";

import React, {useEffect, useState} from 'react';
import {Scene as GameScene, SceneEventTypes} from "../../elements/scene";
import {ElementProp, ITransition, TransitionEventTypes} from "./type";
import {deepMerge, EventListener} from "@lib/util/data";
import Background from "@lib/ui/elements/Background";
import {GameState} from "@lib/ui/components/player/gameState";
import {SrcManager} from "@lib/game/game/elements/srcManager";

export default function BackgroundTransition({scene, props}: { scene: GameScene, props: Record<string, any> }) {
    const [transition, setTransition] =
        useState<null | ITransition>(null);
    const [transitionProps, setTransitionProps] =
        useState<Record<string, any>>({});

    useEffect(() => {
        // const sceneEvents: {
        //     type: keyof SceneEventTypes;
        //     handler: EventListener<any>;
        // }[] = [
        //     {
        //         type: GameScene.EventTypes["event:scene.setTransition"],
        //         handler: scene.events.on(GameScene.EventTypes["event:scene.setTransition"], (transition) => {
        //             setTransition(transition);
        //         })
        //     }
        // ];
        const sceneEventTokens = scene.events.onEvents([
            {
                type: GameScene.EventTypes["event:scene.setTransition"],
                listener: (transition) => {
                    setTransition(transition);
                }
            }
        ]);

        const transitionEvents: {
            type: keyof typeof TransitionEventTypes;
            handler: EventListener<any>;
        }[] = [
            {
                type: TransitionEventTypes.start,
                handler: transition?.events.on(TransitionEventTypes.start, () => {
                })
            },
            {
                type: TransitionEventTypes.update,
                handler: transition?.events.on(TransitionEventTypes.update, (progress) => {
                    setTransitionProps(progress);
                })
            },
            {
                type: TransitionEventTypes.end,
                handler: transition?.events.on(TransitionEventTypes.end, () => {
                })
            }
        ];

        return () => {
            sceneEvents.forEach(({type, handler}) => {
                scene.events.off(type, handler);
            });
            transitionEvents.forEach(({type, handler}) => {
                transition?.events.off(type, handler);
            });
        };
    }, [transition, scene]);

    function handleImageOnload() {
        scene.events.emit(GameScene.EventTypes["event:scene.imageLoaded"]);
    }

    return (
        <>
            {
                transition ? (() =>{
                    return transition.toElementProps().map((p, index) => {
                        const mergedProps =
                            deepMerge<ElementProp<HTMLImageElement>>(props, p, transitionProps);
                        return (
                            <Background key={index}>
                                <img {...mergedProps} onLoad={handleImageOnload}/>
                            </Background>
                        );
                    });
                })() : (
                    <Background>
                        <img {...props} onLoad={handleImageOnload}/>
                    </Background>
                )
            }
        </>
    );
}

