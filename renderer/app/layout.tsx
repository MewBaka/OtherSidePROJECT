import React from 'react';
import clsx from "clsx";
import { Inter } from "next/font/google";

import type { Metadata } from 'next/types';

import '@lib/styles/globals.css'
import Provider from '@lib/ui/provider';

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
    <html lang="en" className={clsx("w-full h-full bg-black")}>
      <body className={clsx("w-full h-full select-none", inter.className)}>
          <div className={clsx("w-full h-full")}>
            <Provider className={clsx("w-full h-full")}>
                {children}
            </Provider>
          </div>
      </body>
    </html>
  );
}

