import React, {useEffect} from "react";
import {GameState} from "@lib/ui/components/player/gameState";
import {Scene as GameScene} from "@lib/game/game/elements/scene";
import {Sound} from "@lib/game/game/elements/sound";
import {SrcManager} from "@lib/game/game/elements/srcManager";
import {usePreloaded} from "@lib/ui/providers/preloaded";
import {PreloadedSrc} from "@lib/ui/elements/player/Preloaded";
import {Image} from "@lib/game/game/elements/image";
import {Utils} from "@lib/game/game/common/core";
import {Img} from "@lib/ui/elements/player/Img";

export function Preload({
                            state,
                            scene
                        }: Readonly<{
    state: GameState;
    scene: GameScene;
}>) {
    const {preloaded} = usePreloaded();

    useEffect(() => {
        if (typeof window === 'undefined') {
            console.warn("Window is not supported in this environment");
            return;
        }

        const src = {
            image: new Set([scene?.srcManager.src, ...state.state.srcManagers.map(srcManager => srcManager.src)].flat().filter(
                src => src.type === SrcManager.SrcTypes.image
            ).map(src => src.src)),
            audio: new Set([scene?.srcManager.src, ...state.state.srcManagers.map(srcManager => srcManager.src)].flat().filter(
                src => src.type === SrcManager.SrcTypes.audio
            ).map(src => src.src)),
            video: new Set([scene?.srcManager.src, ...state.state.srcManagers.map(srcManager => srcManager.src)].flat().filter(
                src => src.type === SrcManager.SrcTypes.video
            ).map(src => src.src)),
        } as const;

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

        console.log("[Preload] Preloading", src); // @debug

        // @todo: 让屏幕等待required的图片加载完成
        // 通过事件分发，在每次加载完成后触发事件
        // srcManager通过检查所有需要的资源都has之后解锁

        // @todo: 更智能的资源分析，尝试找出最有可能需要加载的资源
        const newImages = [];
        src.image.forEach((src: Image) => {
            const cached = SrcManager.cacheablize(Utils.srcToString(src.state.src), window.location.origin);
            const img = (<Img image={src} state={state}/>);
            preloaded.add({type: "image", src, preloaded: img});
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

        // @todo: better src manager, smart preload
        // maybe video preload here

        return () => {
            newImages.forEach(img => {
                img.onload = null;
            });
        };
    }, [state, scene]);

    return null;
}
