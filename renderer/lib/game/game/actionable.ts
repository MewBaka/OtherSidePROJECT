import {HistoryData, Transaction, TransactionType} from "@lib/game/game/save/transaction";
import {LogicAction} from "@lib/game/game/logicAction";

export class Actionable<
    TransactionEnum extends Record<string, string> = Record<string, string>,
    Types extends TransactionType<TransactionEnum> = TransactionType<TransactionEnum>,
    StateData extends Record<string, any> = Record<string, any>
> {
    protected actions: LogicAction.Actions[] = [];

    constructor() {}

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