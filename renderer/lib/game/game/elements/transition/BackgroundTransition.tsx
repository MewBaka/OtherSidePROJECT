import React, {useEffect, useState} from 'react';
import {Scene as GameScene} from "../../elements/scene";
import {ElementProp, ImgElementProp, ITransition, TransitionEventTypes} from "./type";
import {deepMerge} from "@lib/util/data";
import Background from "@lib/ui/elements/Background";
import {Transform} from "@lib/game/game/elements/transform/transform";
import {TransformDefinitions} from "@lib/game/game/elements/transform/type";
import {useAnimate} from "framer-motion";
import {GameState} from "@lib/ui/components/player/gameState";

export default function BackgroundTransition({scene, props, state}: {
    scene: GameScene,
    props: Record<string, any>,
    state: GameState
}) {
    const [scope, animate] = useAnimate();
    const [transition, setTransition] =
        useState<null | ITransition>(null);
    const [transitionProps, setTransitionProps] =
        useState<ElementProp[]>([]);
    const [transform, setTransform] =
        useState<null | Transform<TransformDefinitions.ImageTransformProps>>(null);
    const [transformProps, setTransformProps] =
        useState<ElementProp>({});

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

                    console.debug("[BackgroundTransition] applyTransform", transform.propToCSS(state, scene.backgroundImageState), transform); // @debug

                    setTransform(transform);
                    await transform.animate({scope, animate}, state, scene.backgroundImageState, (after) => {

                        scene.backgroundImageState = deepMerge(scene.backgroundImageState, after);

                        setTransformProps({
                            style: transform.propToCSS(state, scene.backgroundImageState) as any,
                        });

                        setTransform(null);
                    });
                })
            },
            {
                type: GameScene.EventTypes["event:scene.initTransform"],
                listener: scene.events.on(GameScene.EventTypes["event:scene.initTransform"], async (transform) => {
                    console.debug("[BackgroundTransition] initTransform", transform); // @debug
                    await transform.animate({scope, animate}, state, scene.backgroundImageState, (after) => {
                        scene.backgroundImageState = deepMerge(scene.backgroundImageState, after);
                    });
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

        assignTo(scene.backgroundImageState);

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
            console.warn("processing transform not completed");
            transform.getControl().complete();
            transform.setControl(null);
        }
        if (!scope.current) {
            console.warn("scope not ready");
            return;
        }
        if (arg0 instanceof Transform) {
            Object.assign(scope.current.style, arg0.propToCSS(state, scene.backgroundImageState));
        } else {
            Object.assign(scope.current.style, arg0);
        }
    }

    const defaultProps = {
        width: scene.backgroundImageState.width,
        height: scene.backgroundImageState.height,
        style: {
            border: "solid 5px yellow",
            position: "absolute",
        },
    };

    return (
        <>
            {
                transition ? (() => {
                    return transition.toElementProps().map((elementProps, index) => {
                        const mergedProps =
                            deepMerge<ImgElementProp>(defaultProps, props, elementProps, transformProps);
                        return (
                            <Background key={index}>
                                <img alt={mergedProps.alt} {...mergedProps} onLoad={handleImageOnload}/>
                            </Background>
                        );
                    });
                })() : (() => {
                    const mergedProps =
                        deepMerge<ImgElementProp>(defaultProps, props, transformProps);
                    return (
                        <Background>
                            <img alt={mergedProps.alt} {...mergedProps} onLoad={handleImageOnload} ref={scope}/>
                        </Background>
                    )
                })()
            }
        </>
    );
}

