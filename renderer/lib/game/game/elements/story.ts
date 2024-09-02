import {Constructable} from "../constructable";
import {Game, LogicAction} from "../game";
import {deepMerge} from "@lib/util/data";
import {SceneAction, StoryAction} from "@lib/game/game/actions";
import {ContentNode, RawData, RenderableNode} from "@lib/game/game/save/actionTree";
import {SceneActionTypes} from "@lib/game/game/actionTypes";

export type StoryConfig = {};
export type ElementStateRaw = Record<string, any>;
export type NodeChildIdMap = Map<string, string>;

export class Story extends Constructable<
    any,
    SceneAction<"scene:action">,
    StoryAction<"story:action">
> {
    static defaultConfig: StoryConfig = {};
    static targetAction = StoryAction;
    readonly id: string;
    readonly name: string;
    readonly config: StoryConfig;

    constructor(name: string, config: StoryConfig = {}) {
        super();
        this.id = Game.getIdManager().getStringId();
        this.name = name;
        this.config = deepMerge<StoryConfig>(Story.defaultConfig, config);
    }

    /**@internal */
    getAllActions(): LogicAction.Actions[] {
        const set = new Set<LogicAction.Actions>();
        this.forEachAction(action => set.add(action));

        return Array.from(set);
    }

    /**@internal */
    forEachAction(callback: (action: LogicAction.Actions) => void) {
        const seen: string[] = [];
        this.getActions().forEach(sceneAction => {
            const queue: LogicAction.Actions[] = [];
            queue.push(sceneAction);

            while (queue.length > 0) {
                const action = queue.shift();
                if (action.type === SceneActionTypes.jumpTo) {
                    if (seen.includes(action.getId())) {
                        continue;
                    }
                    seen.push(action.getId());
                }

                callback(action);
                const actions = action.getFutureActions();
                queue.push(...actions);
            }
        });
    }

    /**@internal */
    findActionById(id: string, actions?: LogicAction.Actions[]): LogicAction.Actions | null {
        if (actions) {
            const action = actions.find(action => action.getId() === id);
            return action || null;
        }

        const futureActions = this.getActions();
        const queue: LogicAction.Actions[] = [];
        const seen: string[] = [];
        queue.push(...futureActions);

        while (queue.length > 0) {
            const action = queue.shift();
            if (action.getId() === id) {
                return action;
            }

            if (action.type === SceneActionTypes.jumpTo) {
                if (seen.includes(action.getId())) {
                    continue;
                }
                seen.push(action.getId());
            }

            queue.push(...action.getFutureActions());
        }

        return null;
    }

    /**@internal */
    getAllElements(actions?: LogicAction.Actions[]): LogicAction.GameElement[] {
        const action = actions || this.getAllActions();
        const set = new Set<LogicAction.GameElement>(
            action.map(action => action.callee)
        );
        return Array.from(set);
    }

    /**@internal */
    getActionsByType(type: LogicAction.ActionTypes, actions?: LogicAction.Actions[]): LogicAction.Actions[] {
        const action = actions || this.getAllActions();
        return action.filter(action => action.type === type);
    }

    /**@internal */
    getAllNodes(actions?: LogicAction.Actions[]): ContentNode[] {
        const action = actions || this.getAllActions();
        const set = new Set<ContentNode>(
            action.map(action => action.contentNode)
        );
        return Array.from(set);
    }

    /**@internal */
    findNodeById(id: string, actions?: LogicAction.Actions[]): ContentNode | null {
        const action = actions || this.getAllActions();
        return action.find(action => action.contentNode.id === id)?.contentNode || null;
    }

    /**@internal */
    setAllElementState(data: RawData<ElementStateRaw>[], actions?: LogicAction.Actions[]): void {
        const action = actions || this.getAllActions();
        const map = new Map<string, any>();

        data.forEach(data => map.set(data.id, data.data));

        const allCallee = this.getAllElements(action);
        allCallee.forEach(callee => {
            const state = map.get(callee.id);
            if (state) {
                callee.fromData(state);
            }
        });
    }

    /**@internal */
    getAllElementState(actions?: LogicAction.Actions[]): RawData<ElementStateRaw>[] {
        const action = actions || this.getAllActions();
        const allCallee = this.getAllElements(action);
        return allCallee.map(callee => ({
            id: callee.id,
            data: callee.toData()
        })).filter(data => data.data !== null);
    }

    /**@internal */
    findElementById(id: string, elements: LogicAction.GameElement[]): LogicAction.GameElement | null {
        return elements.find(element => element.id === id) || null;
    }

    /**
     * @internal
     * 通过多个ID查找多个元素
     */
    findElementsByIds(ids: string[], elements: LogicAction.GameElement[]): LogicAction.GameElement[] {
        const map = new Map<string, LogicAction.GameElement>();
        elements.forEach(element => map.set(element.id, element));
        return ids.map(id => map.get(id)).filter(Boolean);
    }

    /**
     * @internal
     * 生成节点子辈ID映射
     * 键是节点ID，值是子节点ID
     */
    getNodeChildIdMap(actions?: LogicAction.Actions[]): NodeChildIdMap {
        const action = actions || this.getAllActions();
        const map: NodeChildIdMap = new Map<string, string>();
        action.forEach(action => {
            const node = action.contentNode;
            if (node.child?.id
                && node.initChild !== node.child) {
                // 只添加被追踪的更改的子节点，未更改子节点的节点不会被添加
                // 用于缩小映射体积
                map.set(node.id, node.child.id);
            }
        });
        return map;
    }

    /**
     * @internal
     * 使用指定的映射表还原节点子辈
     */
    setNodeChildByMap(map: NodeChildIdMap | Record<string, string>, actions?: LogicAction.Actions[]): void {
        if (!map) {
            return;
        }
        const childMap = map instanceof Map ? map : new Map(Object.entries(map));

        const action = actions || this.getAllActions();
        const mappedNodes = this.getMappedNodes(this.getAllNodes(action));
        action.forEach(action => {
            const node = action.contentNode;
            const childId = childMap.get(node.id);
            const child = childId && mappedNodes.get(childId);
            if (child) {
                node.setChild(child);
            }
        });
    }

    /**
     * @internal
     * 生成节点ID映射
     */
    getMappedNodes(nodes: RenderableNode[]): Map<string, RenderableNode> {
        const map = new Map<string, RenderableNode>();
        nodes.forEach(node => map.set(node.id, node));
        return map;
    }

    toData() {
        return null;
    }

    fromData(_: any) {
        return this;
    }
}

