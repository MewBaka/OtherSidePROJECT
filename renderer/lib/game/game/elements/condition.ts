import {deepMerge} from "@lib/util/data";
import {Game} from "../game";
import {ContentNode, RenderableNode} from "../save/rollback";
import {HistoryData} from "../save/transaction";
import {ScriptCleaner} from "./script";
import {LogicAction} from "@lib/game/game/logicAction";
import {ConditionAction} from "@lib/game/game/actions";
import {Actionable} from "@lib/game/game/actionable";
import {GameState} from "@lib/ui/components/player/gameState";

export type ConditionConfig = {};

interface LambdaCtx {
    gameState: GameState;
    resolve: (value?: any) => void;
}

type LambdaHandler = (ctx: LambdaCtx) => ScriptCleaner | void;

export class Lambda {
    handler: LambdaHandler;

    constructor(handler: LambdaHandler) {
        this.handler = handler;
    }

    evaluate({gameState}: { gameState: GameState }): {
        value: any;
        cleaner: ScriptCleaner | void;
    } {
        let value: any;
        let cleaner = this.handler(this.getCtx((v) => value = v, {gameState}));
        return {
            value,
            cleaner
        };
    }

    getCtx(resolve: (value: any) => void, {gameState}: { gameState: GameState }): LambdaCtx {
        return {
            resolve,
            gameState
        };
    }
}

export type ConditionData = {
    If: {
        condition: Lambda | null;
        action: LogicAction.Actions[] | null;
    };
    ElseIf: {
        condition: Lambda | null;
        action: (LogicAction.Actions[]) | null;
    }[];
    Else: {
        action: (LogicAction.Actions[]) | null;
    }
};

export class Condition extends Actionable {
    static defaultConfig: ConditionConfig = {};
    config: ConditionConfig;
    conditions: ConditionData = {
        If: {
            condition: null,
            action: null
        },
        ElseIf: [],
        Else: {
            action: null
        }
    };

    constructor(config: ConditionConfig = {}) {
        super();
        this.config = deepMerge<ConditionConfig>(Condition.defaultConfig, config);
    }

    static getInitialState(): ConditionData {
        return {
            If: {
                condition: null,
                action: null
            },
            ElseIf: [],
            Else: {
                action: null
            }
        }
    }

    If(condition: Lambda, action: LogicAction.Actions | LogicAction.Actions[]): this {
        this.conditions.If.condition = condition;
        this.conditions.If.action = this.construct(Array.isArray(action) ? action : [action]);
        return this;
    }

    ElseIf(condition: Lambda, action: (LogicAction.Actions | LogicAction.Actions[])): this {
        this.conditions.ElseIf.push({
            condition,
            action: this.construct(Array.isArray(action) ? action : [action])
        });
        return this;
    }

    Else(action: (LogicAction.Actions | LogicAction.Actions[])): this {
        this.conditions.Else.action = this.construct(Array.isArray(action) ? action : [action]);
        return this;
    }

    evaluate(conditions: ConditionData, {gameState}: { gameState: GameState }): LogicAction.Actions[] | null {
        const ctx = {gameState};

        const _if = conditions.If.condition?.evaluate(ctx);
        if (_if?.value) {
            return conditions.If.action || null;
        }

        for (const elseIf of conditions.ElseIf) {
            const _elseIf = elseIf.condition?.evaluate(ctx);
            if (_elseIf?.value) {
                return elseIf.action || null;
            }
        }

        return conditions.Else.action || null;
    }

    undo(history: HistoryData<Record<string, string>>): void {
        if (typeof history.data === "function") {
            history.data();
        }
    }

    toActions(): LogicAction.Actions[] {
        // 为了确保所有操作的行为一致，修改为一次性toActions，调用之后状态恢复到初始状态
        // 防止多次调用toActions导致状态混乱

        const output = [
            Reflect.construct(ConditionAction, [
                this,
                ConditionAction.ActionTypes.action,
                new ContentNode<ConditionData>(
                    Game.getIdManager().getStringId(),
                ).setContent(this.conditions)
            ]) as ConditionAction<typeof ConditionAction.ActionTypes.action>
        ];
        this.conditions = Condition.getInitialState();
        return output;
    }

    construct(actions: LogicAction.Actions[], lastChild?: RenderableNode, parentChild?: RenderableNode): LogicAction.Actions[] {
        for (let i = 0; i < actions.length; i++) {
            let node = actions[i].contentNode;
            let child = actions[i + 1]?.contentNode;
            if (child) {
                node.addChild(child);
            }
            if (i === actions.length - 1 && lastChild) {
                node.addChild(lastChild);
            }
            if (i === 0 && parentChild) {
                parentChild.addChild(node);
            }
        }
        return actions;
    }
}
