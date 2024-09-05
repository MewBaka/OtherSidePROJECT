import {LogicAction} from "@lib/game/game/logicAction";
import {ContentNode} from "@lib/game/game/save/actionTree";
import type {CalledActionResult} from "@lib/game/game/gameTypes";
import {Awaitable, getCallStack} from "@lib/util/data";
import {GameState} from "@lib/ui/components/player/gameState";
import {Game} from "@lib/game/game/game";

export class Action<ContentNodeType = any, Callee = LogicAction.GameElement> {
    static ActionTypes = {
        action: "action",
    };
    callee: Callee;
    type: ContentNodeType;
    contentNode: ContentNode<ContentNodeType>;
    _id: string;
    private readonly __stack: string;

    constructor(callee: Callee, type: ContentNodeType, contentNode: ContentNode<ContentNodeType>) {
        this.callee = callee;
        this.type = type;
        this.contentNode = contentNode;
        this.__stack = getCallStack();
        this._id = Game.getIdManager().prefix("action", Game.getIdManager().getStringId(), "-");
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

    getId() {
        return this._id;
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