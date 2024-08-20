"use client";

import React, {useEffect, useRef, useState} from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import QuickButton from '../../elements/player/quick-button';
import {Clock, MoreHorizontal, MoreVertical, Save, Settings, SkipBack} from 'react-feather';
import clsx from 'clsx';
import {useGame} from '../../providers/game-state';
import {useRouter} from 'next/navigation';
import {Constants} from '@/lib/api/config';
import Related from '../../elements/related';

export default function QuickMenu() {
    const [isExpanded, setIsExpanded] = useState(false);
    const [rotate, setRotate] = useState(0);
    const {game} = useGame();
    const IconSize = 20;
    const menuRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    const [afmEnabled, setAfmEnabled] = useState<boolean>(game.preference.getPreference("afm"));

    const toggleMenu = () => {
        setIsExpanded(!isExpanded);
        setRotate(rotate + (
            isExpanded ? -720 : 720
        ));
    };

    const toggleAfm = () => {
        game.preference.setPreference("afm", !game.preference.getPreference("afm"));
        setAfmEnabled(game.preference.getPreference("afm"));
    };

    const handleClickOutside = (event: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
            setIsExpanded(false);
            setRotate(0);
        }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            setIsExpanded(false);
            setRotate(0);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    return (
        <Related>
            <div ref={menuRef} className="absolute top-4 left-4 flex flex-col space-y-3" style={{
                zIndex: Constants.style.zIndex.QUICK_MENU
            }}>
                <button
                    className={clsx("w-12 h-12 bg-white hover:bg-gray-100 active:bg-gray-300 transition-colors rounded-full shadow-lg flex items-center justify-center origin-center transform")}
                    onClick={toggleMenu}
                >
                    <motion.div
                        animate={{rotate: rotate}}
                        transition={{duration: 0.5, ease: "easeOut"}}
                        className="origin-center transform"
                    >
                        {isExpanded ?
                            <MoreVertical size={IconSize} className="origin-center transform"/>
                            : <MoreHorizontal size={IconSize} className="origin-center transform"/>
                        }
                    </motion.div>
                </button>
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{opacity: 0, y: -20}}
                            animate={{opacity: 1, y: 0}}
                            exit={{opacity: 0, y: -20, transition: {duration: 0.1}}}
                            transition={{duration: 0.3, delay: 0.1}}
                            className="flex flex-col space-y-3"
                        >
                            <QuickButton onClick={toggleAfm} className={clsx("w-24", {
                                "bg-primary-400 hover:bg-primary-500 active:bg-primary-600 text-white": afmEnabled,
                                "bg-white": !afmEnabled,
                            })}>
                                <span className="text-black font-medium">Auto</span>
                            </QuickButton>
                            <QuickButton className="bg-white">
                                <Save size={IconSize}/>
                            </QuickButton>
                            <QuickButton className="bg-white">
                                <Clock size={IconSize}/>
                            </QuickButton>
                            <QuickButton className="bg-white">
                                <Settings size={IconSize}/>
                            </QuickButton>
                            <QuickButton className="bg-white" onClick={() => router.push("/main-menu")}>
                                <SkipBack size={IconSize}/>
                            </QuickButton>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </Related>
    );
}