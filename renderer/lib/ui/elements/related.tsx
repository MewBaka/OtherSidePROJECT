import clsx from "clsx";
import {useAspectRatio} from "../providers/ratio";


export default function Related({
                                    children,
                                    className,
                                }: Readonly<{
    children: React.ReactNode,
    className?: string
}>) {
    const {ratio} = useAspectRatio();
    return (
        <>
            <div style={{
                width: `${ratio.w}px`,
                height: `${ratio.h}px`,
                position: 'relative'
            }} className={clsx(className)}>
                {children}
            </div>
        </>
    )
};


