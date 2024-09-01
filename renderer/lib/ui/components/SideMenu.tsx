"use client";

import {motion, useAnimation} from "framer-motion";
import {PrefetchKind} from "next/dist/client/components/router-reducer/router-reducer-types";
import Link from "next/link";
import {usePathname, useRouter} from "next/navigation";
import {useEffect} from "react";
import MenuItem from "@/app/(main)/main-menu/MenuItem";
import {Constants} from "@lib/api/config";
import Image from "next/image";

export type MenuItem = ({
    href: string;
} | {
    action: () => void;
}) & {
    title: string;
    prefetch?: boolean;
};

export default function SideMenu({
                                     menu
                                 }: Readonly<{
    menu: MenuItem[];
}>) {
    const controls = useAnimation();
    const router = useRouter();
    const path = usePathname();

    const requiredPrefetch = menu.filter(item => item.prefetch && item["href"]).map(item => item["href"]);

    const isCurrentPage = (href: string) => {
        return (href.endsWith("/") ? href : href + "/") === path;
    };

    const handleClick = (href?: string, action?: Function) => {
        if (action) {
            action();
        }

        router.push(href);
    };
    const prefetchAll = (requiredPrefetch: string[]) => {
        for (const href of requiredPrefetch) {
            router.prefetch(href, {
                kind: PrefetchKind.AUTO
            });
        }
    };

    useEffect(() => {
        prefetchAll(requiredPrefetch);
    }, [requiredPrefetch]);

    return (
        <>
            <motion.div
                className="relative w-1/2 overflow-hidden"
            >
                <div className="absolute inset-0 ">
                    <div className="h-full w-full bg-cover bg-center"></div>
                </div>
                <div className="relative z-10"></div>
                <div className="flex flex-col h-full items-end w-full">
                    <div className="p-4">
                        <Image src={Constants.src.images.LOGO} className="h-16 w-auto" alt="Logo" />
                    </div>
                    <div
                        className="flex-1 overflow-y-auto text-black z-10 items-end flex flex-col w-full overflow-x-hidden">
                        <MenuItem text={"开始游戏      START NEW GAME"} active={true} onClick={() => {
                            router.push(Constants.routes.PLAYER);
                        }}/>
                        <ul>
                            {menu.map((item, index) => (
                                <MenuItem text={item.title} key={index} onClick={() => {
                                    handleClick(item["href"], item["action"]);
                                }}/>
                            ))}
                        </ul>
                        <div className={"mr-8 items-end flex flex-col font-light text-xs text-right mt-8"}>
                            <span>{"V1.0.0 Early Beta"}</span>
                            <span>{"Copyright © 2024~2025 MewBaka&OtherSideProject, All Rights Reserved"}</span>
                        </div>
                    </div>
                </div>
            </motion.div>
        </>
    )
};


