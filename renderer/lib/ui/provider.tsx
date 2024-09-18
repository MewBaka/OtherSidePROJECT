import { NextUIProviders } from "./providers/nextui"
import { AspectRatioProvider } from "./providers/ratio";
import { StrictProvider } from "./providers/strict-mode"
import { ThemeProvider } from "./providers/theme-mode"
import React from "react";

export default function Provider({ children, className }: {
    children: React.ReactNode,
    className?: string;
}) {
    return (
        <>
            <StrictProvider>
                <ThemeProvider>
                    <NextUIProviders className={className}>
                        <AspectRatioProvider>
                            {children}
                        </AspectRatioProvider>
                    </NextUIProviders>
                </ThemeProvider>
            </StrictProvider>
        </>
    )
};


