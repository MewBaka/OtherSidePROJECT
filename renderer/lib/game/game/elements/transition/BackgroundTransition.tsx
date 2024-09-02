"use client";

import React, {useEffect, useState} from 'react';
import {Scene as GameScene} from "../../elements/scene";
import {ElementProp, ITransition, TransitionEventTypes} from "./type";
import {deepMerge} from "@lib/util/data";
import Background from "@lib/ui/elements/Background";

export default function BackgroundTransition({scene, props}: { scene: GameScene, props: Record<string, any> }) {
    const [transition, setTransition] =
        useState<null | ITransition>(null);
    const [transitionProps, setTransitionProps] =
        useState<Record<string, any>>({});

    useEffect(() => {
        const sceneEventTokens = scene.events.onEvents([
            {
                type: GameScene.EventTypes["event:scene.setTransition"],
                listener: scene.events.on(GameScene.EventTypes["event:scene.setTransition"], (transition) => {
                    setTransition(transition);
                })
            }
        ]);

        const transitionEventTokens = transition ? transition.events.onEvents([
            {
                type: TransitionEventTypes.update,
                listener: transition.events.on(TransitionEventTypes.update, (progress) => {
                    setTransitionProps(progress);
                })
            },
        ]) : null;

        return () => {
            sceneEventTokens.cancel();
            transitionEventTokens?.cancel?.();
        };
    }, [transition, scene]);

    function handleImageOnload() {
        scene.events.emit(GameScene.EventTypes["event:scene.imageLoaded"]);
    }

    return (
        <>
            {
                transition ? (() => {
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

