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

    return (
        <>
            <div
                className={clsx("absolute inset-0 flex items-center justify-center bg-cover bg-center overflow-hidden")}
                style={{
                    width: `${ratio.w}px`,
                    height: `${ratio.h}px`,
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                }}
            >
                {children}
            </div>
        </>
    )
};