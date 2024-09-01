"use client";

import clsx from "clsx";

import {Scene as GameScene, SceneEventTypes} from "@lib/game/game/elements/scene";
import {useAspectRatio} from "@/lib/ui/providers/ratio";
import React, {useEffect, useState} from "react";
import BackgroundTransition from "@lib/game/game/elements/transition/BackgroundTransition";
import {SrcManager} from "@lib/game/game/elements/srcManager";
import {GameState} from "@lib/ui/components/player/gameState";
import {Sound} from "@lib/game/game/elements/sound";

export default function Scene({
                                  scene,
                                  state,
                                  children,
                                  className
                              }: Readonly<{
    scene: GameScene;
    state: GameState;
    children?: React.ReactNode;
    className?: string;
}>) {
    const {ratio} = useAspectRatio();
    const baseUrl = window.location.origin;
    const [backgroundMusic, setBackgroundMusic] =
        useState<Sound>(() => scene.$getBackgroundMusic());
    const [settingProgress, setSettingProgress] =
        useState<NodeJS.Timeout | null>(null);
    const [resolve, setResolve] = useState<(() => void) | null>(null);

    async function stopWithFade(music: Sound, fade: number) {
        if (!music.$getHowl() || !music.$getHowl().playing(music.$getToken())) {
            return Promise.resolve();
        }
        const originalVolume = music.$getHowl().volume(music.$getToken()) as number;
        return await new Promise<void>((resolve) => {
            music.$getHowl().fade(
                originalVolume,
                0,
                fade,
                music.$getToken()
            );
            setResolve(() => resolve);
            setSettingProgress(setTimeout(() => {
                music.$getHowl().stop();
                music.$getHowl().volume(originalVolume);
                music.$setToken(null);
                resolve();
                setResolve(null);
            }, fade));
        });
    }

    async function fadeTo(music: Sound | null, fade?: number) {
        if (settingProgress) {
            clearTimeout(settingProgress);
            setSettingProgress(null);
            if (resolve) {
                resolve();
                setResolve(null);
            }
        }

        const lastMusic = backgroundMusic;
        const nextMusic = music;

        if (lastMusic) {
            if (fade) {
                await stopWithFade(lastMusic, fade);
            } else {
                lastMusic.$getHowl()?.stop();
                lastMusic.$getHowl()?.volume(0);
                lastMusic.$setToken(null);
            }
        }

        if (!nextMusic) {
            return;
        }

        nextMusic.$getHowl()?.volume(0);
        nextMusic.$setToken(nextMusic.$getHowl()?.play(nextMusic.$getToken() || undefined));
        console.log("[fadeTo]", nextMusic.$getToken(), nextMusic.config.src, nextMusic.$getHowl());
        if (fade) {
            nextMusic.$getHowl()?.fade(0, nextMusic.config.volume, fade, nextMusic.$getToken());
        } else {
            nextMusic.$getHowl()?.volume(nextMusic.config.volume, nextMusic.$getToken());
        }
        setBackgroundMusic(nextMusic);
    }

    useEffect(() => {
        const listeners: {
            type: keyof SceneEventTypes;
            listener: (...args: any[]) => void;
        }[] = [
            {
                type: "event:scene.setBackgroundMusic",
                listener: scene.events.on(GameScene.EventTypes["event:scene.setBackgroundMusic"], (music, fade) => {
                    fadeTo(music, fade).then();
                })
            },
            {
                type: "event:scene.preUnmount",
                listener: scene.events.on(GameScene.EventTypes["event:scene.preUnmount"], () => {
                    if (settingProgress) {
                        clearTimeout(settingProgress);
                        if (resolve) {
                            resolve();
                        }
                    }
                    if (backgroundMusic) {
                        stopWithFade(backgroundMusic, scene.state.backgroundMusicFade).then();
                    }
                })
            }
        ];

        return () => {
            listeners.forEach(({type, listener}) => {
                scene.events.off(type, listener);
            });
        }
    }, []);

    useEffect(() => {
        scene.events.emit(GameScene.EventTypes["event:scene.mount"]);

        return () => {
            scene.events.emit(GameScene.EventTypes["event:scene.unmount"]);
        }
    }, []);

    return (
        <div className={className}>
            <div
                className={clsx("absolute inset-0 flex items-center justify-center bg-cover bg-center")}
                style={{
                    width: `${ratio.w}px`,
                    height: `${ratio.h}px`,
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                }}
            >
                <BackgroundTransition scene={scene} props={{
                    width: ratio.w,
                    height: ratio.h,
                    src: SrcManager.cacheablize(GameScene.backgroundToSrc(scene.state.background), baseUrl),
                }}/>
            </div>
            {children}
        </div>
    )
};