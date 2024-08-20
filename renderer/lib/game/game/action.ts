import {LogicAction} from "@lib/game/game/logicAction";
import {ContentNode} from "@lib/game/game/save/rollback";
import type {CalledActionResult} from "@lib/game/game/gameTypes";
import {Awaitable} from "@lib/util/data";
import {GameState} from "@lib/ui/components/player/gameState";

export class Action<ContentNodeType = any> {
    static ActionTypes = {
        action: "action",
    };
    callee: LogicAction.GameElement;
    type: ContentNodeType;
    contentNode: ContentNode<ContentNodeType>;

    constructor(callee: LogicAction.GameElement, type: ContentNodeType, contentNode: ContentNode<ContentNodeType>) {
        this.callee = callee;
        this.type = type;
        this.contentNode = contentNode;
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

    undo() {
        this.contentNode.callee.undo();
    }
}