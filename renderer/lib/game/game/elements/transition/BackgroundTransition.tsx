"use client";

import React, {useEffect, useState} from 'react';
import {Scene as GameScene} from "../../elements/scene";
import {ElementProp, ITransition, TransitionEventTypes} from "./type";
import {deepMerge} from "@lib/util/data";
import Background from "@lib/ui/elements/Background";
import {Transform} from "@lib/game/game/elements/transform/transform";
import {TransformDefinitions} from "@lib/game/game/elements/transform/type";
import {useAnimate} from "framer-motion";
import {GameState} from "@lib/ui/components/player/gameState";
import {Utils} from "@lib/game/game/common/Utils";

export default function BackgroundTransition({scene, props, state}: { scene: GameScene, props: Record<string, any>, state: GameState }) {
    const [scope, animate] = useAnimate();
    const [transition, setTransition] =
        useState<null | ITransition>(null);
    const [transitionProps, setTransitionProps] =
        useState<Record<string, any>>({});
    const [transform, setTransform] =
        useState<null | Transform<TransformDefinitions.ImageTransformProps>>(null);
    const [transformProps, setTransformProps] =
        useState<Record<string, any>>({});

    useEffect(() => {
        const sceneEventTokens = scene.events.onEvents([
            {
                type: GameScene.EventTypes["event:scene.setTransition"],
                listener: scene.events.on(GameScene.EventTypes["event:scene.setTransition"], (transition) => {
                    setTransition(transition);
                })
            },
            {
                type: GameScene.EventTypes["event:scene.applyTransform"],
                listener: scene.events.on(GameScene.EventTypes["event:scene.applyTransform"], async (transform) => {
                    assignTo(transform.propToCSS(state, scene.backgroundImageState));

                    transform.assignState(scene.backgroundImageState);

                    setTransform(transform);
                    await transform.animate({scope, animate}, state);
                    scene.backgroundImageState = deepMerge(scene.backgroundImageState, transform.state);
                    setTransformProps({
                        style: transform.propToCSS(state, scene.backgroundImageState) as any,
                    });

                    setTransform(null);
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
            {
                type: TransitionEventTypes.end,
                listener: transition.events.on(TransitionEventTypes.end, () => {
                    setTransition(null);
                })
            }
        ]) : null;

        return () => {
            sceneEventTokens.cancel();
            transitionEventTokens?.cancel?.();
        };
    }, [transition, scene]);

    function handleImageOnload() {
        scene.events.emit(GameScene.EventTypes["event:scene.imageLoaded"]);
    }

    function assignTo(arg0: Transform<TransformDefinitions.ImageTransformProps> | Record<string, any>) {
        if (transform && transform.getControl()) {
            console.log("last transform", transform.state, transform.getControl().state);
            console.warn("processing transform not completed");
            transform.getControl().complete();
            transform.setControl(null);
        }
        if (!scope.current) {
            console.warn("scope not ready");
            return;
        }
        if (arg0 instanceof Transform) {
            arg0.assignState(scene.backgroundImageState);
            Object.assign(scope.current.style, arg0.propToCSS(state, scene.backgroundImageState));
        } else {
            Object.assign(scope.current.style, arg0);
        }
    }

    const defaultProps = {
        width: scene.backgroundImageState.width,
        height: scene.backgroundImageState.height,
    };

    return (
        <>
            {
                transition ? (() => {
                    return transition.toElementProps().map((p, index) => {
                        const mergedProps =
                            deepMerge<ElementProp<HTMLImageElement>>(defaultProps, props, p, transitionProps);
                        return (
                            <Background key={index}>
                                <img {...mergedProps} onLoad={handleImageOnload} ref={scope}/>
                            </Background>
                        );
                    });
                })() : (
                    <Background>
                        <img {...deepMerge(defaultProps, props)} onLoad={handleImageOnload} ref={scope}/>
                    </Background>
                )
            }
        </>
    );
}

