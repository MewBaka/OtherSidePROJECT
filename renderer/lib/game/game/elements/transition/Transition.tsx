"use client";

import {useEffect, useState} from 'react';
import {Scene as GameScene, SceneEventTypes} from "../../elements/scene";
import {ITransition, TransitionEventTypes} from "./type";
import {EventListener} from "@lib/util/data";
import Background from "@lib/ui/elements/Background";
import {GameState} from "@lib/ui/components/player/gameState";

export default function Transition({scene, props, state}: { scene: GameScene, props: Record<string, any>, state: GameState }) {
    const [transition, setTransition] =
        useState<null | ITransition>(null);
    const [transitionProps, setTransitionProps] =
        useState<Record<string, any>>({});

    useEffect(() => {
        const sceneEvents: {
            type: keyof SceneEventTypes;
            handler: EventListener<any>;
        }[] = [
            {
                type: GameScene.EventTypes["event:scene.setTransition"],
                handler: scene.events.on(GameScene.EventTypes["event:scene.setTransition"], (transition) => {
                    setTransition(transition);
                })
            }
        ];

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
                    setTransitionProps(transition?.toElementProps() || {});
                })
            },
            {
                type: TransitionEventTypes.end,
                handler: transition?.events.on(TransitionEventTypes.end, () => {
                })
            },
            {
                type: TransitionEventTypes.ready,
                handler: transition?.events.on(TransitionEventTypes.ready, () => {
                    scene.events.emit(GameScene.EventTypes["event:scene.imageLoaded"]);
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
                transition ? transition.toElements(scene, props, {state}) : (
                    <Background>
                        <img {...props} onLoad={handleImageOnload}/>
                    </Background>
                )
            }
        </>
    );
}

