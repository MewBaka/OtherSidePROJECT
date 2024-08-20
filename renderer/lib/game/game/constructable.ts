import {Game} from "./game";
import {ContentNode, RenderableNode, RootNode} from "./save/rollback";
import {LogicAction} from "@lib/game/game/logicAction";

import {Action} from "@lib/game/game/action";

export class Constructable<
    T extends typeof Constructable = any,
    TAction extends LogicAction.Actions = LogicAction.Actions,
    CAction extends LogicAction.Actions = LogicAction.Actions
> {
    static targetAction: any = Action;
    actions: TAction[];

    constructor() {
        this.actions = [];
    }

    /**
     * Wrap the actions in a new action
     */
    action(actions: (callee: this) => (TAction | TAction[])[]): CAction;

    action(actions: (TAction | TAction[])[]): CAction;

    action(actions: (TAction | TAction[])[] | ((callee: this) => (TAction | TAction[])[])): CAction {
        if (typeof actions === "function") {
            actions = actions(this);
        }
        const content = actions.flat(2) as TAction[];
        this.actions.push(...content);
        const constructed = this.construct();
        const sceneRoot = new ContentNode<this>(
            Game.getIdManager().getStringId(),
            constructed || void 0
        ).setContent(this);
        constructed?.setParent(sceneRoot);

        const thisConstructor = this.constructor as T;
        return Reflect.construct(thisConstructor.targetAction, [
            this,
            thisConstructor.targetAction.ActionTypes.action,
            sceneRoot
        ])
    }

    setRoot(root: RootNode): LogicAction.Actions | undefined {
        this.actions[0]?.contentNode.setParent(root);
        root.setChild(this.actions[0]?.contentNode);
        return this.actions[0];
    }

    /**
     * Construct the actions into a tree
     */
    protected construct(parent?: RenderableNode): RenderableNode | null {
        for (let i = 0; i < this.actions.length; i++) {
            const action = this.actions[i];
            if (i === 0 && parent) {
                parent.addChild(action.contentNode);
            } else if (i > 0) {
                (this.actions[i - 1].contentNode)?.addChild(action.contentNode);
            }
        }
        return (!!this.actions.length) ? this.actions[0].contentNode : null;
    }
}

