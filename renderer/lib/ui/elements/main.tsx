"use client";

import clsx from "clsx";
import {useTheme} from "@lib/ui/providers/theme-mode";
import React, {useEffect, useState} from "react";
import {useAspectRatio} from "../providers/ratio";
import {Constants} from "@lib/api/config";

export default function Main({
                                 children,
                                 className
                             }: {
    children: React.ReactNode,
    className?: string;
}) {
    const {theme} = useTheme();
    const [style, setStyle] = useState({});
    const {setRatio} = useAspectRatio();

    const MIN_WIDTH = 1600 * 0.5;
    const MIN_HEIGHT = 900 * 0.5;

    useEffect(() => {
        let resizeTimeout: NodeJS.Timeout;

        const updateStyle = () => {
            const container = document.getElementById(Constants.app.game.contentContainerId);
            if (container) {
                const containerWidth = container.clientWidth;
                const containerHeight = container.clientHeight;
                const aspectRatio = 16 / 9;

                let width: number, height: number;
                if (containerWidth / containerHeight > aspectRatio) {
                    width = containerHeight * aspectRatio;
                    height = containerHeight;
                } else {
                    width = containerWidth;
                    height = containerWidth / aspectRatio;
                }

                // Apply minimum width and height
                if (width < MIN_WIDTH) width = MIN_WIDTH;
                if (height < MIN_HEIGHT) height = MIN_HEIGHT;

                setStyle({
                    width: `${width}px`,
                    height: `${height}px`,
                    margin: "auto",
                    position: "absolute",
                    top: "0",
                    bottom: "0",
                    left: "0",
                    right: "0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                });
                setRatio({
                    w: width,
                    h: height,
                    updateStyle,
                    style: {
                        width: `${width}px`,
                        height: `${height}px`,
                    },
                    s: {
                        style: {
                            width: `${width}px`,
                            height: `${height}px`,
                        }
                    },
                    min: {
                        w: MIN_WIDTH,
                        h: MIN_HEIGHT
                    }
                });
            }
        };

        const handleResize = () => {
            clearTimeout(resizeTimeout);
            // resizeTimeout = setTimeout(updateStyle, 50);
            updateStyle();
        };

        updateStyle();
        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
            clearTimeout(resizeTimeout);
        };
    }, [theme, setRatio]);

    return (
        <div id={Constants.app.game.contentContainerId} style={{position: "relative", width: "100%", height: "100%", overflow: "hidden"}}>
            <main className={clsx("text-foreground bg-background", theme, className)} style={style}>
                {children}
            </main>
        </div>
    );
};