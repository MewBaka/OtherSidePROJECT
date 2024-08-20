import clsx from "clsx";
import {ReactNode} from "react";
import {useAspectRatio} from "../providers/ratio";

export default function Isolated(
    {children, className}: Readonly<{ children: ReactNode, className?: string }>
) {
    const {ratio} = useAspectRatio();
    return (
        <div className={
            clsx("fixed inset-0 flex items-center justify-center", className)
        } style={{
            width: '100vw',
            height: '100vh',
            position: 'fixed'
        }}>
            <div style={{
                width: `${ratio.w}px`,
                height: `${ratio.h}px`,
                position: 'relative'
            }}>
                {children}
            </div>
        </div>
    )
}