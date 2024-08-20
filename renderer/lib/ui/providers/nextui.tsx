"use client";

import React from "react";
import {NextUIProvider} from "@nextui-org/react";
import {ThemeProvider as NextThemesProvider} from "next-themes";
import {useTheme} from "./theme-mode";

export function NextUIProviders({
                                    children,
                                    className,
                                }: {
    children: React.ReactNode;
    className?: string;
}) {
    const {theme} = useTheme();

    return (
        <NextUIProvider className={className}>
            <NextThemesProvider attribute="class" defaultTheme={theme}>
                {children}
            </NextThemesProvider>
        </NextUIProvider>
    );
}
