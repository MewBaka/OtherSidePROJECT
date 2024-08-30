import {Image as GameImage} from "@/lib/game/game/elements/image";
import {useAspectRatio} from "@/lib/ui/providers/ratio";
import clsx from "clsx";
import React, {useEffect, useState} from "react";
import {useAnimate} from "framer-motion";
import {GameState} from "@lib/ui/components/player/gameState";
import {deepMerge} from "@lib/util/data";
import {Transform} from "@lib/game/game/elements/transform/transform";
import {TransformDefinitions} from "@lib/game/game/common/types";

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

    useEffect(() => {
        image.setScope(scope);

        image.events.emit(GameImage.EventTypes["event:image.mount"]);

        const fc = [...[
            GameImage.EventTypes["event:image.show"],
            GameImage.EventTypes["event:image.hide"],
            GameImage.EventTypes["event:image.applyTransform"]
        ].map((type) => {
            return {
                fc: image.events.on(type, async (transform) => {
                    assignTo(transform.propToCSS(state, image.state));

                    transform.assignState(image.state);

                    setProcessingTransform(transform);
                    await transform.animate({scope, animate}, state);
                    image.state = deepMerge(image.state, transform.state);

                    if (onAnimationEnd) {
                        onAnimationEnd();
                    }

                    setProcessingTransform(null);
                    return true;
                }),
                type,
            };
        }), {
            type: GameImage.EventTypes["event:image.init"],
            fc: image.events.on(GameImage.EventTypes["event:image.init"], async () => {
                await image.toTransform().animate({scope, animate}, state);
                image.state = deepMerge(image.state, image.toTransform().state);
            })
        }];

        assignTo(image.toTransform().propToCSS(state, image.state));

        image.events.emit(GameImage.EventTypes["event:image.ready"], scope);

        return () => {
            fc.forEach((fc) => {
                image.events.off(fc.type, fc.fc);
            });
            image.events.emit(GameImage.EventTypes["event:image.unmount"]);
        };
    }, []);

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

    return (
        <div className={
            clsx("fixed inset-0 flex items-center justify-center z-0", {
                // "hidden": !image.state.display,
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
                {((
                    <img className={"absolute"} alt={"image"} src={GameImage.staticImageDataToSrc(image.state.src)}
                         width={image.state.width}
                         height={image.state.height} ref={scope}/>
                ))}
            </div>
        </div>
    );
};