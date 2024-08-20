import clsx from "clsx";

export default function QuickButton({
                                        className,
                                        children,
                                        onClick,
                                    }: Readonly<{
    className?: string;
    children: React.ReactNode;
    onClick?: () => void;
}>) {
    return (
        <button
            className={clsx("w-12 h-12 hover:bg-gray-100 active:bg-gray-300 transition-colors rounded-full shadow-lg flex items-center justify-center", className)}
            onClick={onClick}
        >
            {children}
        </button>
    );
}
