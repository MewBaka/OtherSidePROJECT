import {Game} from "../game";
import {ContentNode} from "../save/rollback";
import {HistoryData} from "../save/transaction";
import {LogicAction} from "@lib/game/game/logicAction";
import {ScriptAction} from "@lib/game/game/actions";
import {Actionable} from "@lib/game/game/actionable";
import {GameState} from "@lib/ui/components/player/gameState";
import Actions = LogicAction.Actions;

export interface ScriptCtx {
    script: Script;
    gameState: GameState;
}

type ScriptRun = (ctx: ScriptCtx) => ScriptCleaner | void;
export type ScriptCleaner = () => void;

const ScriptTransactionTypes = {
    Run: 'run'
} as const;

export class Script extends Actionable<typeof ScriptTransactionTypes> {
    handler: ScriptRun;
    cleaner: ScriptCleaner | null = null;

    constructor(handler: ScriptRun) {
        super();
        this.handler = handler;
    }

    execute({gameState}: { gameState: GameState }): void {
        this.cleaner = this.handler(this.getCtx({
            gameState
        })) || null;
    }

    getCtx({gameState}: { gameState: GameState }): ScriptCtx {
        return {
            script: this,
            gameState
        };
    }

    undo(history: HistoryData<typeof ScriptTransactionTypes>): void {
        if (history.type === ScriptTransactionTypes.Run) {
            this.cleaner?.();
        }
    }

    toActions(): Actions[] {
        return [
            new ScriptAction(
                this,
                ScriptAction.ActionTypes.action,
                new ContentNode<Script>(
                    Game.getIdManager().getStringId()
                ).setContent(this)
            )
        ];
    }
}

