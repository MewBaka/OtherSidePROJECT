import {Image as GameImage} from "@/lib/game/game/elements/image";
import {useAspectRatio} from "@/lib/ui/providers/ratio";
import clsx from "clsx";
import React, {DetailedHTMLProps, ImgHTMLAttributes, useEffect, useMemo, useState} from "react";
import {useAnimate} from "framer-motion";
import {GameState} from "@lib/ui/components/player/gameState";
import {deepMerge, sleep} from "@lib/util/data";
import {usePreloaded} from "@lib/ui/providers/preloaded";
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
    const {preloaded} = usePreloaded();
    const [backgroundLoaded, setBackgroundLoaded] = useState(false);
    const [processingTransform, setProcessingTransform] =
        useState<Transform<any> | null>(null);

    const preloadedImage = preloaded.get<"image">(GameImage.staticImageDataToSrc(image.state.src));

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
        image.setScope(scope);

        image.events.emit(GameImage.EventTypes["event:image.mount"]);

        const fc = [...[
            GameImage.EventTypes["event:image.show"],
            GameImage.EventTypes["event:image.hide"],
            GameImage.EventTypes["event:image.applyTransform"]
        ].map((type) => {
            return {
                fc: image.events.on(type, async (transform) => {
                    console.debug("assigning transform", transform, "to image", image.name, "with state", image.state); // @debug
                    if (processingTransform && processingTransform.getControl()) {
                        console.warn("processing transform not completed");
                        console.log("last transform", processingTransform.state, processingTransform.getControl().state);
                        processingTransform.getControl().complete();
                        processingTransform.setControl(null);
                    }

                    transform.assignState(image.state);

                    setProcessingTransform(transform);
                    await transform.animate({scope, animate}, state);
                    image.state = deepMerge({}, transform.state);

                    if (onAnimationEnd) {
                        onAnimationEnd();
                    }

                    console.debug("done assigning")

                    setProcessingTransform(null);
                    return true;
                }),
                type,
            };
        }), {
            type: GameImage.EventTypes["event:image.init"],
            fc: image.events.on(GameImage.EventTypes["event:image.init"], async () => {
                console.log("init", image.state, image.toTransform().propToCSS(state, image.state)) // @debug
                assignTo(image.toTransform().propToCSS(state, image.state));
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
                {(cloned || (
                    <img className={"relative"} alt={"image"} src={GameImage.staticImageDataToSrc(image.state.src)} width={image.state.width}
                         height={image.state.height} style={{position: 'absolute'}} ref={scope} onLoad={() => setBackgroundLoaded(true)}/>
                ))}
            </div>
        </div>
    );
};