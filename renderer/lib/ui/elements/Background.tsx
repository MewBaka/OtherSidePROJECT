"use client";

import clsx from "clsx";
import {useAspectRatio} from "@/lib/ui/providers/ratio";
import {ReactNode} from "react";

export default function Background({
                                       children
                                   }: Readonly<{
    children: ReactNode;
}>) {
    const aspectRatio = useAspectRatio();
    const ratio = aspectRatio.ratio;

    console.log(ratio)

    return (
        <>
            <div
                className={clsx("fixed inset-0 flex items-center justify-center bg-cover bg-center overflow-hidden")}
                style={{
                    width: `${ratio.w}px`,
                    height: `${ratio.h}px`,
                    ...(document.body.clientWidth > ratio.min.w ? {
                        left: "50%",
                    }: {}),
                    ...(document.body.clientHeight > ratio.min.h ? {
                        top: "50%",
                    }: {}),
                    transform: `translate(${document.body.clientWidth > ratio.min.w ? "-50%" : "0"}, ${document.body.clientHeight > ratio.min.h ? "-50%" : "0"})`,
                }}
            >
                {children}
            </div>
        </>
    )
};