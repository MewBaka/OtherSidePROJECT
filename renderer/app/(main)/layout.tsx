"use client";

import { Constants } from "@/lib/api/config";
import PageTransition from "@lib/ui/components/PageTransition";
import SideMenu, { MenuItem } from "@lib/ui/components/SideMenu";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const sideMenuItems: MenuItem[] = [
    {
      title: "开始",
      href: Constants.routes.PLAYER,
    },
    {
      title: "存档",
      href: Constants.routes.SAVE,
      prefetch: true,
    },
    {
      title: "画廊",
      href: Constants.routes.GALLERY,
      prefetch: true,
    },
    {
      title: "设置",
      href: Constants.routes.SETTINGS,
      prefetch: true,
    },
    {
      title: "关于",
      href: Constants.routes.ABOUT,
      prefetch: true,
    }
  ];
  return (
    <>
      <AnimatePresence>
        <PageTransition className={clsx("h-full")}>
          <div className={clsx("flex bg-[url('/static/images/main-menu-background.webp')] bg-cover bg-center h-full")}>
            <SideMenu menu={sideMenuItems} />
            <motion.div
              className={clsx("w-3/4 m-6")}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: .5 }}
            >
              {children}
            </motion.div>
          </div>
        </PageTransition>
      </AnimatePresence>
    </>
  )
};
