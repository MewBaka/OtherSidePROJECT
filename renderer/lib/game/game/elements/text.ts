import {Game} from "../game";
import {ContentNode} from "../save/rollback";
import {Color} from "../show";
import {deepMerge, safeClone} from "@lib/util/data";
import {HistoryData} from "../save/transaction";
import {CharacterAction} from "@lib/game/game/actions";
import {Actionable} from "@lib/game/game/actionable";

export type SentenceConfig = {
    pause?: boolean | number;
} & Color;
export type WordConfig = {} & Color;

export type SentenceDataRaw = {
    state: SentenceState;
    character: CharacterStateData;
};
export type SentenceState = {
    display: boolean;
};

type UnSentencePrompt = (string | Word)[] | (string | Word);

export class Sentence {
    static defaultConfig: SentenceConfig = {
        color: "#fff",
        pause: true,
    };
    character: Character | null;
    text: Word[];
    config: SentenceConfig;
    state: SentenceState = {
        display: true
    };

    constructor(character: Character | null, text: (string | Word)[] | (string | Word), config: Partial<SentenceConfig> = {}) {
        this.character = character;
        this.text = this.format(text);
        this.config = deepMerge<SentenceConfig>(Sentence.defaultConfig, config);
    }

    static isSentence(obj: any): obj is Sentence {
        return obj instanceof Sentence;
    }

    static toSentence(prompt: UnSentencePrompt | Sentence): Sentence {
        return Sentence.isSentence(prompt) ? prompt : new Sentence(null, prompt);
    }

    format(text: (string | Word)[] | (string | Word)): Word[] {
        const result: Word[] = [];
        if (Array.isArray(text)) {
            for (let i = 0; i < text.length; i++) {
                if (Word.isWord(text[i])) {
                    result.push(text[i] as Word);
                } else {
                    result.push(new Word(text[i] as string));
                }
            }
        } else {
            result.push(Word.isWord(text) ? text : new Word(text));
        }
        return result;
    }

    toData(): SentenceDataRaw {
        return {
            state: safeClone(this.state),
            character: safeClone(this.character.toData())
        };
    }

    fromData(data: SentenceDataRaw) {
        this.state = deepMerge<SentenceState>(this.state, data);
        this.character.fromData(data.character);
        return this;
    }

    toString() {
        return this.text.map(word => word.text).join("");
    }
}

export class Word {
    static defaultConfig: WordConfig = {
        color: "#000"
    };
    text: string;
    config: WordConfig;

    constructor(text: string, config: Partial<WordConfig> = {}) {
        this.text = text;
        this.config = deepMerge<WordConfig>(Word.defaultConfig, config);
    }

    static isWord(obj: any): obj is Word {
        return obj instanceof Word;
    }

    toData() {
        return {
            text: this.text,
            config: this.config
        }
    }
}

export type CharacterConfig = {}
const CharacterActionTransaction = {
    say: "transaction:character.say",
    hide: "transaction:character.hide",
} as const;
type CharacterTransactionDataTypes = {
    [K in typeof CharacterActionTransaction[keyof typeof CharacterActionTransaction]]:
    K extends typeof CharacterActionTransaction.say ? Sentence :
        K extends typeof CharacterActionTransaction.hide ? Sentence :
            any;
};
export type CharacterStateData = {};

export class Character extends Actionable<
    typeof CharacterActionTransaction,
    CharacterTransactionDataTypes,
    CharacterStateData
> {
    name: string;
    config: CharacterConfig;

    constructor(name: string, config: CharacterConfig = {}) {
        super();
        this.name = name;
        this.config = config;
    }

    public say(content: string): Character;
    public say(content: Sentence): Character;
    public say(content: (string | Word)[]): Character;
    public say(content: string | Sentence | (string | Word)[]): Character {
        const sentence: Sentence =
            Array.isArray(content) ?
                new Sentence(this, content, {}) :
                (Sentence.isSentence(content) ? content : new Sentence(this, content, {}));
        const action = new CharacterAction<typeof CharacterAction.ActionTypes.say>(
            this,
            CharacterAction.ActionTypes.say,
            new ContentNode<Sentence>(
                Game.getIdManager().getStringId(),
            ).setContent(sentence)
        );
        this.transaction.commitWith<typeof CharacterActionTransaction.say>({
            type: CharacterActionTransaction.say,
            data: sentence
        });
        this.actions.push(action);
        return this;
    }

    /**
     * @internal
     * DO NOT USE IN USER SCRIPTS
     */
    $hideSay(sentence: Sentence): Character {
        sentence.state.display = false;
        this.transaction.commitWith<typeof CharacterActionTransaction.hide>({
            type: CharacterActionTransaction.hide,
            data: sentence
        });
        return this;
    }

    undo(history: HistoryData<typeof CharacterActionTransaction, CharacterTransactionDataTypes>): void {
        if (history.type === CharacterActionTransaction.say) {
            history.data.state.display = false;
        } else if (history.type === CharacterActionTransaction.hide) {
            history.data.state.display = true;
        }
    }

    public toData(): CharacterStateData {
        return {};
    }

    public fromData(_: CharacterStateData): this {
        return this;
    }
}
