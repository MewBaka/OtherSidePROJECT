"use client";

import QuickMenu from "@lib/ui/components/player/QuickMenu";
import Isolated from "@/lib/ui/elements/isolated";

export default function Layout({
                                   children,
                               }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <Isolated className="relative">
                <div
                    className="absolute inset-0 w-full h-full flex items-left justify-start bg-white">
                    <QuickMenu/>
                    {children}
                </div>
            </Isolated>
        </>
    )
};
