import React from 'react';
import clsx from "clsx";

export default function MenuItem({
    text,
    active = false,
    onClick
                                }: Readonly<{
    text: string;
    active?: boolean;
    onClick?: () => void;
}>) {
    return (
        <div className="relative w-[320px] h-12 flex items-center justify-end my-4 translate-x-1 hover:translate-x-0 transition-all hover:opacity-90 active:opacity-80" onClick={onClick}>
            <div
                className={clsx(" rounded-tl-[50px] rounded-bl-[50px] absolute inset-0", {
                    "bg-[#1B1BB4] shadow-[_0px_4px_10px_0px_rgba(0,0,0,0.3)]": active,
                })}
            ></div>
            {(active && <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                version="1.1"
                width="22"
                height="22"
                viewBox="0 0 22 22"
                className="absolute left-4"
            >
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
            </svg>)}
            <span
                className={clsx("text-md font-['Alibaba_PuHuiTi_3.0'] font-bold absolute right-10", {
                    "text-[#3d3d3d]": !active,
                    "text-white": active
                })}
            >
                {text}
            </span>
        </div>
    );
}