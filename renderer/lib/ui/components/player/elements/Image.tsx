import {Image as GameImage} from "@/lib/game/game/elements/image";
import {useAspectRatio} from "@/lib/ui/providers/ratio";
import clsx from "clsx";
import React, {DetailedHTMLProps, ImgHTMLAttributes, useEffect, useMemo, useState} from "react";
import {useAnimate} from "framer-motion";
import {GameState} from "@lib/ui/components/player/gameState";
import {deepMerge} from "@lib/util/data";
import {usePreloaded} from "@lib/ui/providers/preloaded";

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
    const {preloaded} = usePreloaded();

    const preloadedImage = preloaded.get<"image">(GameImage.staticImageDataToSrc(image.state.src));
    image.setScope(scope);

    const cloned = useMemo(() => {
        const srcUrl = GameImage.staticImageDataToSrc(image.state.src);
        if (preloadedImage && preloadedImage?.preloaded) {
            console.log("[Preload] already preloaded", preloadedImage.src, preloadedImage.preloaded); // @debug
            preloadedImage.src.setScope(scope);
            return preloadedImage.preloaded;
        }
        console.warn("untracked image", srcUrl)
        const props:
            DetailedHTMLProps<ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement> = {
            src: srcUrl,
            width: image.state.width,
            height: image.state.height,
            style: {
                position: 'absolute'
            },
            ref: scope
        };
        return React.cloneElement(<img alt={"image"}/>, props);
    }, [scope, image.state.width, image.state.height, image.state.src, preloadedImage]);

    useEffect(() => {

        const initTransform = image.toTransform();
        Object.assign(scope.current, initTransform.propToCSS(state, initTransform.state));

        const listening = [
            GameImage.EventTypes["event:image.show"],
            GameImage.EventTypes["event:image.hide"],
            GameImage.EventTypes["event:image.applyTransform"]
        ];

        const fc = listening.map((type) => {
            return {
                fc: image.events.on(type, async (transform) => {
                    transform.assignState(image.state);

                    await transform.animate({scope, animate}, state);
                    image.state = deepMerge({}, transform.state);

                    if (onAnimationEnd) {
                        onAnimationEnd();
                    }
                    return true;
                }),
                type,
            };
        });
        return () => {
            fc.forEach((fc) => {
                image.events.off(fc.type, fc.fc);
            });
        };
    }, []);

    return (
        <div className={
            clsx("fixed inset-0 flex items-center justify-center z-0", {
                "hidden": !image.state.display,
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
                {cloned || (
                    <img alt={"image"} src={GameImage.staticImageDataToSrc(image.state.src)} width={image.state.width}
                         height={image.state.height} style={{position: 'absolute'}} ref={scope}/>
                )}
            </div>
        </div>
    );
};