"use client";

import {useEffect, useState} from 'react';
import {Scene as GameScene, SceneEventTypes} from "../../elements/scene";
import {ITransition, TransitionEventTypes} from "./type";
import {EventListener} from "@lib/util/data";
import Background from "@lib/ui/elements/Background";

export default function Transition({scene, props}: { scene: GameScene, props: Record<string, any> }) {
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

    return (
        <>
            {
                transition ? transition.toElements(scene, props) : (
                    <Background>
                        <img {...props}/>
                    </Background>
                )
            }
        </>
    );
}

