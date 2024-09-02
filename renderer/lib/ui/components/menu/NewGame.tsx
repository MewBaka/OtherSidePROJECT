import React from 'react';

export default function NewGame({
                                    text
                                }: Readonly<{
    text: string;
}>) {
    return (
        <div className="relative w-full h-12 flex items-center justify-center">
            <div
                className="bg-[#1B1BB4] rounded-tl-[50px] rounded-bl-[50px] shadow-[_0px_4px_10px_0px_rgba(0,0,0,0.3)] absolute"
                style={{
                    top: '0',
                    bottom: '0',
                    height: 'calc(100% - 0 - 0)',
                    left: '0',
                    right: '0',
                    width: 'calc(100% - 0 - 0)'
                }}></div>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                version="1.1"
                width="22"
                height="22"
                viewBox="0 0 22 22">
                <g>
                    <ellipse
                        cx="11"
                        cy="11"
                        rx="10"
                        ry="10"
                        fillOpacity="0"
                        strokeOpacity="1"
                        stroke="#F8F8F8"
                        fill="none"
                        strokeWidth="2"
                    />
                </g>
            </svg>
            <span
                className="text-[#F8F8F8] text-2xl font-['Alibaba_PuHuiTi_3.0'] text-right font-bold absolute m-2 flex items-center justify-center w-full h-full"
                style={{
                }}>
        开始游戏&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;START NEW GAME
      </span>
        </div>
    );
}