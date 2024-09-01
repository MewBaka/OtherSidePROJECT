"use client";

import {Constants} from "@/lib/api/config";
import SideMenu, {MenuItem} from "@lib/ui/components/SideMenu";
import clsx from "clsx";
import {motion} from "framer-motion";

export default function Layout({
                                   children,
                               }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <div className={clsx("bg-[url('/static/images/main-menu-background.png')] flex bg-cover bg-center h-full w-full")}>
                {/*<motion.div*/}
                {/*    className={clsx("m-6")}*/}
                {/*    initial={{opacity: 0}}*/}
                {/*    animate={{opacity: 1}}*/}
                {/*    transition={{duration: .5}}*/}
                {/*>*/}
                {/*    {children}*/}
                {/*</motion.div>*/}
                {children}
            </div>
        </>
    )
};
