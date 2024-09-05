import React, {useEffect} from "react";
import {GameState} from "@lib/ui/components/player/gameState";
import {Sound} from "@lib/game/game/elements/sound";
import {SrcManager} from "@lib/game/game/elements/srcManager";
import {usePreloaded} from "@lib/ui/providers/preloaded";
import {Preloaded, PreloadedSrc} from "@lib/ui/elements/player/Preloaded";
import {Image as GameImage} from "@lib/game/game/elements/image";
import {Utils} from "@lib/game/game/common/core";
import {Img} from "@lib/ui/elements/player/Img";

export function Preload({
                            state,
                            srcManager
                        }: Readonly<{
    state: GameState;
    srcManager: SrcManager;
}>) {
    const {preloaded} = usePreloaded();

    useEffect(() => {
        if (typeof window === 'undefined') {
            console.warn("Window is not supported in this environment");
            return;
        }

        const currentSceneSrc = state.getLastScene()?.srcManager;
        const futureSceneSrc = state.getLastScene()?.srcManager.future;
        const combinedSrc = [
            ...srcManager.src,
            ...(currentSceneSrc ? currentSceneSrc.src : []),
            ...(futureSceneSrc.map(v => v.src)).flat(2),
        ];

        const src = {
            image: new Set<GameImage>(),
            audio: new Set<Sound>(),
            video: new Set<string>()
        };

        combinedSrc.forEach(srcItem => {
            if (srcItem.type === SrcManager.SrcTypes.image) {
                src.image.add(srcItem.src);
            } else if (srcItem.type === SrcManager.SrcTypes.audio) {
                src.audio.add(srcItem.src);
            } else if (srcItem.type === SrcManager.SrcTypes.video) {
                src.video.add(srcItem.src);
            }
        });

        preloaded.preloaded = preloaded.preloaded.filter(p => {
            if (p.type === SrcManager.SrcTypes.audio) {
                let has = src[p.type].has((p as PreloadedSrc<"audio">).src);
                if (!has) {
                    // downgraded check
                    has = Array.from(src[p.type]).some(s => {
                        return preloaded.getSrc(p) === preloaded.getSrc(s.config.src);
                    });
                }
                return has;
            } else if (p.type === SrcManager.SrcTypes.image) {
                return src[p.type].has((p as PreloadedSrc<"image">).src);
            }
            const preloadedSrcP = preloaded.getSrc(p);
            return src[p.type].has(preloadedSrcP);
        });

        // @todo: 让屏幕等待required的图片加载完成
        // 通过事件分发，在每次加载完成后触发事件
        // srcManager通过检查所有需要的资源都has之后解锁

        // @todo: 更智能的资源分析，尝试找出最有可能需要加载的资源
        const newImages = [];
        const promises = [];
        src.image.forEach((src: GameImage) => {
            let resolve: () => void;
            const promise = new Promise<void>(r => resolve = r);

            const htmlImg = new Image();
            htmlImg.src = Utils.srcToString(src.state.src);
            newImages.push(htmlImg);

            const img = (<Img image={src} state={state} onLoad={() => {
                resolve();
                console.info("[Preload] Image loaded", src); // @debug
            }}/>);
            preloaded.add({type: "image", src, preloaded: img});
        });

        Promise.all(promises).then(() => {
            preloaded.events.emit(Preloaded.EventTypes["event:preloaded.ready"]);
        });

        src.audio.forEach((src: Sound) => {
            if (!src.$getHowl()) {
                src.$setHowl(new (state.getHowl())({
                    src: src.config.src,
                    loop: src.config.loop,
                    volume: src.config.volume,
                    autoplay: false,
                    preload: true,
                }));
            }
        });

        console.log("[Preload] Preloaded", preloaded.preloaded, src.image); // @debug
        preloaded.events.emit(Preloaded.EventTypes["event:preloaded.mount"]);

        // @todo: better src manager, smart preload
        // maybe video preload here

        return () => {
            newImages.forEach(img => {
                img.onload = null;
            });
        };
    }, [state]);

    return null;
}
