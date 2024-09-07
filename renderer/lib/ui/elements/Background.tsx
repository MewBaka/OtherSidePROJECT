"use client";

import clsx from "clsx";
import {useAspectRatio} from "@/lib/ui/providers/ratio";
import {ReactNode} from "react";
import {Constants} from "@lib/api/config";

export default function Background({
                                       children
                                   }: Readonly<{
    children: ReactNode;
}>) {
    const aspectRatio = useAspectRatio();
    const ratio = aspectRatio.ratio;

    const {clientWidth, clientHeight} = document.querySelector("#" + Constants.app.game.contentContainerId);

    return (
        <>
            <div
                className={clsx("absolute inset-0 flex items-center justify-center bg-cover bg-center overflow-hidden")}
                style={{
                    width: `${ratio.w}px`,
                    height: `${ratio.h}px`,
                    ...(clientWidth > ratio.min.w ? {
                        left: "50%",
                    }: {}),
                    ...(clientHeight > ratio.min.h ? {
                        top: "50%",
                    }: {}),
                    transform: `translate(${clientWidth > ratio.min.w ? "-50%" : "0"}, ${clientHeight > ratio.min.h ? "-50%" : "0"})`,
                }}
            >
                {children}
            </div>
        </>
    )
};