import {Game} from "../game";
import {deepMerge} from "@lib/util/data";
import {Sentence, Word} from "./text";
import {ContentNode, RenderableNode} from "../save/rollback";
import {LogicAction} from "@lib/game/game/logicAction";
import {MenuAction} from "@lib/game/game/actions";
import {Actionable} from "@lib/game/game/actionable";
import Actions = LogicAction.Actions;

export type MenuConfig = {};
export type MenuChoice = {
    action: Actions[];
    prompt: UnSentencePrompt | Sentence;
};

type UnSentencePrompt = (string | Word)[] | (string | Word);
export type Choice = {
    action: Actions[];
    prompt: Sentence;
};

export type MenuData = {
    prompt: Sentence;
    choices: Choice[];
}

export class Menu extends Actionable {
    static defaultConfig: MenuConfig = {};
    static targetAction = MenuAction;
    id: string;
    prompt: Sentence;
    config: MenuConfig;
    protected choices: Choice[] = [];

    constructor(prompt: UnSentencePrompt, config?: MenuConfig);
    constructor(prompt: Sentence, config?: MenuConfig);
    constructor(prompt: UnSentencePrompt | Sentence, config: MenuConfig = {}) {
        super();
        this.id = Game.getIdManager().getStringId();
        this.prompt = Sentence.isSentence(prompt) ? prompt : new Sentence(null, prompt);
        this.config = deepMerge<MenuConfig>(Menu.defaultConfig, config);
    }

    public choose(choice: MenuChoice): this;
    public choose(prompt: Sentence, action: (Actions | Actions[])[]): this;
    public choose(prompt: UnSentencePrompt, action: (Actions | Actions[])[]): this;
    public choose(choice: Sentence | MenuChoice | UnSentencePrompt, action?: (Actions | Actions[])[]): this {
        if (Sentence.isSentence(choice) && action) {
            this.choices.push({prompt: Sentence.toSentence(choice), action: action.flat(2)});
        } else if ((Word.isWord(choice) || Array.isArray(choice)) && action) {
            this.choices.push({prompt: Sentence.toSentence(choice), action: action.flat(2)});
        } else if (typeof choice === "object" && "prompt" in choice && "action" in choice) {
            this.choices.push({prompt: Sentence.toSentence(choice.prompt), action: choice.action.flat(2)});
        }
        return this;
    }

    construct(actions: Actions[], lastChild?: RenderableNode, parentChild?: RenderableNode): Actions[] {
        for (let i = 0; i < actions.length; i++) {
            let node = actions[i].contentNode;
            let child = actions[i + 1]?.contentNode;
            if (child) {
                node.addChild(child);
            }
            if (i === this.choices.length - 1 && lastChild) {
                node.addChild(lastChild);
            }
            if (i === 0 && parentChild) {
                parentChild.addChild(node);
            }
        }
        return actions;
    }

    toActions(): MenuAction<"menu:action">[] {
        const output = [
            new MenuAction(
                this,
                MenuAction.ActionTypes.action,
                new ContentNode<MenuData>(
                    Game.getIdManager().getStringId()
                ).setContent({
                    prompt: this.prompt,
                    choices: this.constructChoices()
                })
            )
        ];
        this.choices = [];
        return output;
    }

    private constructChoices(): Choice[] {
        return this.choices.map(choice => {
            return {
                action: this.construct(choice.action),
                prompt: choice.prompt
            };
        });
    }
}

