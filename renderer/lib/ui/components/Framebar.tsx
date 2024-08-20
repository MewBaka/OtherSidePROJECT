"use client";

import {ClientAPI} from '@/lib/api/ipc';
import {Button} from '@nextui-org/react';
import {Maximize2, Minus, X} from 'react-feather'; // 将Minimize2更改为Minus

const Framebar = () => {
    const handleMinimize = () => {
        ClientAPI.getInstance(window).winFrame.minimize();
    };
    const handleMaximize = () => {
        ClientAPI.getInstance(window).winFrame.maximize();
    };
    const handleClose = () => {
        ClientAPI.getInstance(window).winFrame.close();
    };

    return (
        <div className="flex items-center justify-between px-6 py-2 text-white w-full top-0 z-50"
             style={{"-webkit-app-region": "drag"} as any}>
            <span className="font-light text-2xl">OtherSideProject</span>
            <div className="flex items-center gap-4" style={{"-webkit-app-region": "no-drag"} as any}>
                <Button
                    className="focus:outline-none focus:border-none hover:brightness-75 transition-colors duration-200"
                    color="primary" onClick={handleMinimize}>
                    <Minus size={28}/>
                </Button>
                <Button
                    className="focus:outline-none focus:border-none hover:brightness-75 transition-colors duration-200"
                    color="primary" onClick={handleMaximize}>
                    <Maximize2 size={28}/>
                </Button>
                <Button
                    className="focus:outline-none focus:border-none hover:brightness-75 transition-colors duration-200"
                    color="primary" onClick={handleClose}>
                    <X size={28}/>
                </Button>
            </div>
        </div>
    );
};

export default Framebar;