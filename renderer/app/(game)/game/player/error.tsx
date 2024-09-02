'use client';

import React, {useEffect} from 'react'
import clsx from "clsx";
import {useAspectRatio} from "@lib/ui/providers/ratio";

export default function Error({
                                  error,
                                  reset,
                              }: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    const {ratio} = useAspectRatio();
    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <>
            <div>
                <div
                    className={clsx("absolute inset-0 flex items-center justify-center overflow-hidden")}
                    style={{
                        width: `${ratio.w}px`,
                        height: `${ratio.h}px`,
                        position: 'fixed',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                    }}
                >
                    <div
                        className="absolute inset-0 bg-cover bg-center bg-[url('/static/images/main-menu-background.png')]"
                        style={{
                            filter: 'blur(10px)',
                            zIndex: -1,
                        }}
                    ></div>
                    <div className="absolute inset-0 bg-black opacity-50"></div>
                    <div className="relative flex items-center justify-center h-full w-full">
                        <div className="flex flex-col items-center justify-center p-4">
                            <p className="text-white font-bold text-2xl">有些事情出错了</p>
                            <p className="text-white font-thin text-2xl">Error: {error.message}</p>
                            <p className="text-white font-thin text-2xl">Digest: {error.digest}</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}