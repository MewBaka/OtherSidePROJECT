"use client";

import {motion, useAnimation} from "framer-motion";
import {PrefetchKind} from "next/dist/client/components/router-reducer/router-reducer-types";
import Link from "next/link";
import {usePathname, useRouter} from "next/navigation";
import {useEffect} from "react";

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

    const handleClick = async (href, action) => {
        await controls.start({
            scale: [1, 1.5],
            opacity: [1, 0],
            transition: {duration: 0.5},
        });

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
                className="relative w-1/4"
                variants={{
                    hidden: {x: '-50vw'},
                    visible: {
                        x: 0,
                        transition: {
                            type: "tween",
                            ease: "easeInOut",
                            duration: 1
                        }
                    }
                }}
                initial="hidden"
                animate="visible"
            >
                <div className="absolute inset-0 bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg">
                    <div className="h-full w-full bg-cover bg-center"></div>
                </div>
                <div className="relative z-10"></div>
                <div className="flex flex-col h-max">
                    <div className="p-4">
                        <h1 className="text-xl text-white relative z-10">菜单</h1>
                    </div>
                    <div className="flex-1 overflow-y-auto text-white z-10">
                        <ul>
                            {menu.map((item, index) => (
                                <Link key={index} href={item["href"]}
                                      onClick={() => handleClick(item["href"], item["action"])} className="group">
                                    <li className={`p-4 cursor-pointer hover:bg-gray-100 hover:bg-opacity-10 active:bg-opacity-20 transition-all relative ${isCurrentPage(item["href"]) ? '' : ''}`}>
                                        {isCurrentPage(item["href"]) &&
                                            <motion.div
                                                className="absolute left-0 top-1/4 h-1/2 w-1 border-l-4 border-primary"
                                                initial={{scale: 0}}
                                                animate={{scale: 1}}
                                                transition={{duration: 0.2}}
                                            ></motion.div>
                                        }
                                        <p className="pl-4 transition-transform group-hover:translate-x-2 group-active:translate-x-1">{item.title}</p>
                                    </li>
                                </Link>
                            ))}
                        </ul>
                    </div>
                </div>
            </motion.div>
        </>
    )
};


