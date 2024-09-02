"use client";

import {Constants} from "@/lib/api/config";
import SideMenu, {MenuItem} from "@lib/ui/components/SideMenu";

export default function Page() {
    const sideMenuItems: MenuItem[] = [
        {
            title: "读取档案      READ ARCHIVE",
            href: Constants.routes.SAVE,
            prefetch: true,
        },
        {
            title: "游戏设置      SETTINGS",
            href: Constants.routes.SETTINGS,
            prefetch: true,
        },
        {
            title: "关于      ABOUT",
            href: Constants.routes.ABOUT,
            prefetch: true,
        },
        {
            title: "退出      EXIT",
            action: () => {
            },
        }
    ];
    return (
        <>

            <div className="flex items-center justify-center h-full w-1/2">
                <div className="flex flex-col items-center justify-center p-4">
                    {/* <p className="text-white font-thin text-2xl">{Constants.info.app.name}</p> */}
                </div>
            </div>
            <SideMenu menu={sideMenuItems}/></>
    );
};