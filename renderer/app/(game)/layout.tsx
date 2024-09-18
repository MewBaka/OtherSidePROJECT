"use client";

import PageTransition from "@lib/ui/components/PageTransition";
import clsx from "clsx";
import { AnimatePresence } from "framer-motion";
import React from "react";
import Main from "@lib/ui/elements/main";
import { AspectRatioProvider } from "@/lib/ui/providers/ratio";

export default function Layout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            {/* <AspectRatioProvider> */}
                {children}
            {/* </AspectRatioProvider> */}
        </>
    )
};
