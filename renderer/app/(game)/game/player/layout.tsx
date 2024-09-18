"use client";

import QuickMenu from "@lib/ui/components/player/QuickMenu";
import { GameProviders, Isolated } from "narraleaf-react";
import React from "react";

export default function Layout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <GameProviders>
                {/* <Isolated className="relative"> */}
                    {/* <div */}
                        {/* className="absolute inset-0 w-full h-full flex items-left justify-start bg-white"> */}
                        <>
                        {/* <QuickMenu /> */}
                        {children}
                        </>
                    {/* </div> */}
                {/* </Isolated> */}
            </GameProviders>
        </>
    )
};
