import {Image as GameImage} from "@/lib/game/game/elements/image";
import {useAspectRatio} from "@/lib/ui/providers/ratio";
import clsx from "clsx";
import React, {useEffect, useState} from "react";
import {DOMKeyframesDefinition, useAnimate} from "framer-motion";
import {GameState} from "@lib/ui/components/player/gameState";
import {deepMerge} from "@lib/util/data";
import {Transform} from "@lib/game/game/elements/transform/transform";
import {TransformDefinitions} from "@lib/game/game/common/types";
import {Utils} from "@lib/game/game/common/core";
import {CSSElementProp, ElementProp, ITransition, TransitionEventTypes} from "@lib/game/game/elements/transition/type";

// @todo: 增加无障碍支持

export default function Image({
                                  image,
                                  state,
                                  onAnimationEnd
                              }: Readonly<{
    image: GameImage;
    state: GameState;
    onAnimationEnd?: () => any;
}>) {
    const {ratio} = useAspectRatio();
    const [scope, animate] = useAnimate();
    const [processingTransform, setProcessingTransform] =
        useState<Transform<any> | null>(null);
    const [transformProps, setTransformProps] =
        useState<CSSElementProp<DOMKeyframesDefinition>>({style: {}});
    const [transition, setTransition] =
        useState<null | ITransition>(null);
    const [transitionProps, setTransitionProps] =
        useState<Record<string, any>>({});

    useEffect(() => {
        image.setScope(scope);

        image.events.emit(GameImage.EventTypes["event:image.mount"]);

        const imageEventToken = image.events.onEvents([...[
            GameImage.EventTypes["event:image.show"],
            GameImage.EventTypes["event:image.hide"],
            GameImage.EventTypes["event:image.applyTransform"]
        ].map((type) => {
            return {
                type,
                listener: image.events.on(type, async (transform) => {
                    assignTo(transform.propToCSS(state, image.state));

                    transform.assignState(image.state);

                    setProcessingTransform(transform);
                    await transform.animate({scope, animate}, state);
                    image.state = deepMerge(image.state, transform.state);
                    setTransformProps({
                        style: transform.propToCSS(state, image.state) as any,
                    });

                    if (onAnimationEnd) {
                        onAnimationEnd();
                    }

                    setProcessingTransform(null);
                    return true;
                }),
            };
        }), {
            type: GameImage.EventTypes["event:image.init"],
            listener: image.events.on(GameImage.EventTypes["event:image.init"], async () => {
                await image.toTransform().animate({scope, animate}, state);
                image.state = deepMerge(image.state, image.toTransform().state);
            })
        }]);

        assignTo(image.toTransform().propToCSS(state, image.state));

        image.events.emit(GameImage.EventTypes["event:image.ready"], scope);

        return () => {
            imageEventToken.cancel();
            image.events.emit(GameImage.EventTypes["event:image.unmount"]);
        };
    }, []);

    useEffect(() => {
        const imageEventToken = image.events.onEvents([
            {
                type: GameImage.EventTypes["event:image.setTransition"],
                listener: image.events.on(GameImage.EventTypes["event:image.setTransition"], (transition) => {
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
            imageEventToken.cancel();
            transitionEventTokens?.cancel?.();
        };
    }, [transition, image]);

    function assignTo(arg0: Transform<TransformDefinitions.ImageTransformProps> | Record<string, any>) {
        if (processingTransform && processingTransform.getControl()) {
            console.log("last transform", processingTransform.state, processingTransform.getControl().state);
            console.warn("processing transform not completed");
            processingTransform.getControl().complete();
            processingTransform.setControl(null);
        }
        if (!scope.current) {
            console.warn("scope not ready");
            return;
        }
        if (arg0 instanceof Transform) {
            arg0.assignState(image.state);
            Object.assign(scope.current.style, arg0.propToCSS(state, image.state));
        } else {
            Object.assign(scope.current.style, arg0);
        }
    }

    const defaultProps = {
        className: "absolute",
        src: Utils.staticImageDataToSrc(image.state.src),
        width: image.state.width,
        height: image.state.height,
    };

    return (
        <div className={
            clsx("fixed inset-0 flex items-center justify-center z-0", {
                "opacity-0": !image.state.display,
            })
        } style={{
            width: '100vw',
            height: '100vh',
            position: 'fixed'
        }}>
            <div style={{
                width: `${ratio.w}px`,
                height: `${ratio.h}px`,
                position: 'relative'
            }}>
                {transition ? transition.toElementProps().map((p, index) => {
                    const mergedProps =
                        deepMerge<ElementProp<HTMLImageElement>>(defaultProps, transformProps, p, transitionProps);
                    return (
                        <img key={index} ref={scope} {...mergedProps}/>
                    );
                }): (
                    <img ref={scope} {...deepMerge(defaultProps, transformProps)} />
                )}
            </div>
        </div>
    );
};