"use client";

import clsx from "clsx";

export default function Layout({
                                   children,
                               }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <div
                className={clsx("bg-[url('/static/images/main-menu-background.png')] flex bg-cover bg-center h-full w-full")}>
                {children}
            </div>
        </>
    )
};
