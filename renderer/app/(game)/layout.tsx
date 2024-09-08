"use client";

import PageTransition from "@lib/ui/components/PageTransition";
import {GameProvider} from "@/lib/ui/providers/game-state";
import clsx from "clsx";
import {AnimatePresence} from "framer-motion";
import React from "react";
import Main from "@lib/ui/elements/main";

export default function Layout({
                                   children,
                               }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <GameProvider>
                <AnimatePresence>
                    <PageTransition className={clsx("h-full")}>
                        {/*<span>awa</span>*/}
                        <Main className={clsx("flex-grow overflow-auto")}>{children}</Main>
                    </PageTransition>
                </AnimatePresence>
            </GameProvider>
        </>
    )
};
