import {Sentence} from "@/lib/game/game/elements/text";
import Isolated from "@/lib/ui/elements/isolated";
import TypingEffect from "@/lib/ui/elements/player/typeing-effect";
import {toHex} from "@/lib/util/data";
import clsx from "clsx";
import React, {useState} from "react";

export default function Say({
                                action,
                                onClick,
                                useTypeEffect = true,
                                className,
                            }: Readonly<{
    action: {
        sentence: Sentence;
    };
    onClick?: () => void;
    useTypeEffect?: boolean;
    className?: string;
}>) {
    const {sentence} = action;
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [isFinished, setIsFinished] = useState(false);

    const handleComplete = () => {
        setCurrentWordIndex((prevIndex) => prevIndex + 1);
        if (currentWordIndex === sentence.text.length - 1) {
            setIsFinished(true);
        }
    };

    function onElementClick() {
        if (isFinished) {
            if (onClick) onClick();
        } else {
            setIsFinished(true);
        }
    }

    return (
        <Isolated>
            {sentence.state.display &&
                <div className={
                    clsx("absolute bottom-0 w-[calc(100%-40px)] h-[calc(33%-40px)] bg-white m-4 box-border rounded-md shadow-md flex items-center justify-center", className)
                } onClick={onElementClick}>
                    <div className="absolute top-0 left-0 p-1.25 rounded-br-md m-4">
                        {sentence.character?.name || ""}
                    </div>
                    <div className="text-center max-w-[80%] mx-auto">
                        {
                            sentence.text.map((word, index) => {
                                if (isFinished) return (
                                    <span key={index} style={{
                                        color: typeof word.config.color === "string" ? word.config.color : toHex(word.config.color)
                                    }}>
                    {word.text}
                  </span>
                                );
                                if (index > currentWordIndex) return null;
                                return (
                                    <span key={index} style={{
                                        color: toHex(word.config.color)
                                    }}>
                    {
                        useTypeEffect ?
                            <TypingEffect text={word.text}
                                          onComplete={index === currentWordIndex ? handleComplete : undefined}
                                          speed={50}/> :
                            word.text
                    }
                  </span>
                                );
                            })
                        }
                    </div>
                </div>
            }
        </Isolated>
    );
};