"use client";

import PageTransition from "@lib/ui/components/PageTransition";
import {GameProvider} from "@/lib/ui/providers/game-state";
import clsx from "clsx";
import {AnimatePresence} from "framer-motion";
import React from "react";

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
                        <div className={clsx("flex bg-cover bg-center h-full")}>
                            {children}
                        </div>
                    </PageTransition>
                </AnimatePresence>
            </GameProvider>
        </>
    )
};
