import {Sentence} from "@/lib/game/game/elements/text";
import {toHex} from "@/lib/util/data";

export default function ColoredSentence({
                                            sentence,
                                        }: Readonly<{
    sentence: Sentence;
}>) {
    return (
        <>
            {sentence.text.map((word, i) => (
                <span key={i} style={{color: toHex(word.config.color)}}>{word.text}</span>
            ))}
        </>
    );
}


