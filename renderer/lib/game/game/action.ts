import {LogicAction} from "@lib/game/game/logicAction";
import {ContentNode} from "@lib/game/game/save/rollback";
import type {CalledActionResult} from "@lib/game/game/gameTypes";
import {Awaitable, getCallStack} from "@lib/util/data";
import {GameState} from "@lib/ui/components/player/gameState";

export class Action<ContentNodeType = any> {
    static ActionTypes = {
        action: "action",
    };
    callee: LogicAction.GameElement;
    type: ContentNodeType;
    contentNode: ContentNode<ContentNodeType>;
    private readonly __stack: string;

    constructor(callee: LogicAction.GameElement, type: ContentNodeType, contentNode: ContentNode<ContentNodeType>) {
        this.callee = callee;
        this.type = type;
        this.contentNode = contentNode;
        this.__stack = getCallStack();
    }

    static isAction(action: any): action is Action {
        return action instanceof Action;
    }

    public executeAction(state: GameState): CalledActionResult | Awaitable<CalledActionResult, any> {
        return {
            type: this.type as any,
            node: this.contentNode,
        };
    }

    toData() {
        return {
            type: this.type,
            content: this.contentNode.toData(),
        }
    }

    getFutureActions(): LogicAction.Actions[] {
        const action = this.contentNode.child;
        return action ? [action.action] : [];
    }

    undo() {
        this.contentNode.action.undo();
    }
}