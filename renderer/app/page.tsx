"use client";

import React, {useEffect, useState} from 'react';
import {AnimatePresence} from 'framer-motion';

import SplashScreen from '@/lib/ui/elements/splash-screen';
import {useRouter} from 'next/navigation';
import {Constants} from '@/lib/api/config';
import Isolated from '@/lib/ui/elements/isolated';

export default function HomePage() {
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        router.prefetch(Constants.routes.MAIN_MENU);

        const timer = setTimeout(() => {
            setIsLoading(false);
            const redirectTimer = setTimeout(() => {
                router.push(Constants.routes.MAIN_MENU);
            }, 2000);

            return () => clearTimeout(redirectTimer);
        }, 10000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <>
            <Isolated className="bg-white">
                <AnimatePresence>
                    {isLoading && <SplashScreen/>}
                </AnimatePresence>
            </Isolated>
        </>
    )
}
