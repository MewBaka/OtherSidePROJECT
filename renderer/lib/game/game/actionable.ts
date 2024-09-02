import {HistoryData, TransactionType} from "@lib/game/game/save/transaction";
import {LogicAction} from "@lib/game/game/logicAction";
import {Game} from "@lib/game/game/game";

export class Actionable<
    TransactionEnum extends Record<string, string> = Record<string, string>,
    Types extends TransactionType<TransactionEnum> = TransactionType<TransactionEnum>,
    StateData extends Record<string, any> = Record<string, any>
> {
    static IdPrefixes = {
        Actionable: "actionable",
        Condition: "$0",
        Control: "$1",
        Image: "$2",
        Script: "$3",
        Sound: "$4",
        Text: "$5",
        Menu: "$6",
    } as const;
    readonly id: string;
    protected actions: LogicAction.Actions[] = [];

    constructor(idPrefix: string = Actionable.IdPrefixes.Actionable) {
        this.id = Game.getIdManager().prefix(idPrefix, Game.getIdManager().getStringId(), "-");
    }

    toActions() {
        let actions = this.actions;
        this.actions = [];
        return actions;
    }

    undo(history: HistoryData<TransactionEnum, Types>) {
    }

    public toData(): StateData | null {
        return null;
    }

    public fromData(_: StateData): this {
        return this;
    }
}