import React from 'react';
import clsx from "clsx";
import { Inter } from "next/font/google";

import type { Metadata } from 'next/types';

import '@lib/styles/globals.css'
import Provider from '@lib/ui/provider';
import Main from '@lib/ui/elements/main';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OtherSideProject",
  description: "OtherSideProject",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={clsx("h-full bg-black")}>
      <body className={clsx("h-full select-none", inter.className)}>
          <div className={clsx("")}>
            <Provider className={clsx("flex flex-col min-h- screen h-full max-h-screen min-h-screen")}>
              <Main className={clsx("flex-grow overflow-auto")}>{children}</Main>
            </Provider>
          </div>
      </body>
    </html>
  );
}

