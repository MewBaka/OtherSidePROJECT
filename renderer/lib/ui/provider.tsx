import clsx from "clsx"
import { NextUIProviders } from "./providers/nextui"
import { StrictProvider } from "./providers/strict-mode"
import { ThemeProvider } from "./providers/theme-mode"
import { AspectRatioProvider } from "./providers/ratio";

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


