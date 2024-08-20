import type {CommonImage, CommonImagePosition, StaticImageData} from "../show";
import {deepMerge, DeepPartial, EventDispatcher, getCallStack} from "@lib/util/data";
import {ContentNode} from "../save/rollback";
import {HistoryData} from "../save/transaction";
import {Game} from "@lib/game/game/game";
import {Transform} from "./transform/transform";
import {ImageAction} from "@lib/game/game/actions";
import {Actionable} from "@lib/game/game/actionable";
import {TransformDefinitions} from "@lib/game/game/elements/transform/type";
import ImageTransformProps = TransformDefinitions.ImageTransformProps;
import {Utils} from "@lib/game/game/common/Utils";
import React from "react";

export type ImageConfig = {
    src: string | StaticImageData;
    display: boolean;
    cache: boolean;
} & CommonImage;

export const ImagePosition: {
    [K in CommonImagePosition]: K;
} = {
    center: "center",
    left: "left",
    right: "right"
} as const;

const ImageTransactionTypes = {
    set: "set",
    show: "show",
    hide: "hide",
} as const;

export type ImageEventTypes = {
    "event:image.show": [Transform<TransformDefinitions.ImageTransformProps>];
    "event:image.hide": [Transform<TransformDefinitions.ImageTransformProps>];
    "event:image.applyTransform": [Transform<TransformDefinitions.ImageTransformProps>];
};

export class Image extends Actionable<typeof ImageTransactionTypes> {
    static EventTypes: { [K in keyof ImageEventTypes]: K } = {
        "event:image.show": "event:image.show",
        "event:image.hide": "event:image.hide",
        "event:image.applyTransform": "event:image.applyTransform",
    }
    static defaultConfig: ImageConfig = {
        src: "",
        display: false,
        position: ImagePosition.center,
        scale: 1,
        rotation: 0,
        opacity: 0,
        cache: false,
    };
    name: string;
    config: ImageConfig;
    state: ImageConfig;
    declare actions: ImageAction<any>[];
    id: null | number | string;
    events: EventDispatcher<ImageEventTypes> = new EventDispatcher();
    initiated: boolean = false;
    ref: React.RefObject<HTMLImageElement> | undefined = undefined;

    constructor(name: string, config: DeepPartial<ImageConfig> = {}) {
        super();
        this.name = name;
        this.config = deepMerge<ImageConfig>(Image.defaultConfig, config);
        this.state = deepMerge<ImageConfig>({}, this.config);
        this.actions = [];
        this.id = null;

        this.checkConfig();
    }

    public static staticImageDataToSrc(image: StaticImageData | string): string {
        return typeof image === "string" ? image : image.src;
    }

    public init() {
        return this._init();
    }

    private _init() {
        this.actions.push(new ImageAction<typeof ImageAction.ActionTypes.init>(
            this,
            ImageAction.ActionTypes.init,
            new ContentNode(
                Game.getIdManager().getStringId()
            )
        ));
        return this;
    }

    checkConfig() {
        if (!this.config.src) {
            throw new Error("Image src is required");
        }
        if (!Transform.isPosition(this.config.position)) {
            throw new Error("Invalid position\nPosition must be one of CommonImagePosition, Align, Coord2D");
        }
        return this;
    }

    /**@internal */
    setId(id: number | string): this {
        this.id = id;
        return this;
    }

    /**
     * 设置图片源
     * @param src 可以是public目录下的文件
     * 例如 **%root%/public/static/image.png** 在这里应该填入 **"/static/image.png"**
     */
    public setSrc(src: string): this {
        const setActions = this.actions.filter(action => action.type === ImageTransactionTypes.set);
        this.transaction
            .startTransaction()
            .push({
                type: ImageTransactionTypes.set,
                data: [
                    setActions[setActions.length - 1]?.contentNode.getContent() || this.config.src,
                    src
                ]
            }).commit();
        const action = new ImageAction<typeof ImageAction.ActionTypes.setSrc>(
            this,
            ImageAction.ActionTypes.setSrc,
            new ContentNode<[string]>(
                Game.getIdManager().getStringId()
            ).setContent([src])
        );
        this.actions.push(action);
        return this;
    }

    public applyTransform(transform: Transform<ImageTransformProps>): this {
        const action = new ImageAction<typeof ImageAction.ActionTypes.applyTransform>(
            this,
            ImageAction.ActionTypes.applyTransform,
            new ContentNode(
                Game.getIdManager().getStringId()
            ).setContent([
                void 0,
                transform,
                getCallStack()
            ])
        );
        this.actions.push(action);
        return this
    }

    /**
     * 让图片显示，如果图片已显示，则不会有任何效果
     */
    public show(): this;
    public show(options: Transform<TransformDefinitions.ImageTransformProps>): this;
    public show(options: Partial<TransformDefinitions.CommonTransformProps>): this;
    public show(options?: Transform<TransformDefinitions.ImageTransformProps> | Partial<TransformDefinitions.CommonTransformProps>): this {
        this.transaction
            .startTransaction()
            .push({
                type: ImageTransactionTypes.show,
                data: this.config.display
            }).commit();
        const trans =
            (options instanceof Transform) ? options : new Transform([
                {
                    props: {
                        display: true,
                        opacity: 1
                    },
                    options: options
                }
            ]);
        const action = new ImageAction<typeof ImageAction.ActionTypes.show>(
            this,
            ImageAction.ActionTypes.show,
            new ContentNode(
                Game.getIdManager().getStringId()
            ).setContent([
                void 0,
                trans
            ])
        );
        this.actions.push(action);
        return this;
    }

    /**
     * 让图片隐藏，如果图片已隐藏，则不会有任何效果
     */
    public hide(): this;
    public hide(transform: Transform<TransformDefinitions.ImageTransformProps>): this;
    public hide(transform: Partial<TransformDefinitions.CommonTransformProps>): this;
    public hide(transform?: Transform<TransformDefinitions.ImageTransformProps> | Partial<TransformDefinitions.CommonTransformProps>): this {
        this.transaction
            .startTransaction()
            .push({
                type: ImageTransactionTypes.hide,
                data: this.config.display
            }).commit();
        const action = new ImageAction<typeof ImageAction.ActionTypes.hide>(
            this,
            ImageAction.ActionTypes.hide,
            new ContentNode(
                Game.getIdManager().getStringId()
            ).setContent([
                void 0,
                (transform instanceof Transform) ? transform : new Transform([
                    {
                        props: {
                            display: false,
                            opacity: 0,
                        },
                        options: transform
                    }
                ])
            ])
        );
        this.actions.push(action);
        return this;
    }

    undo(history: HistoryData<typeof ImageTransactionTypes>): ImageAction<any> | void {
        const hideAction = new ImageAction(
            this,
            ImageAction.ActionTypes.hide,
            new ContentNode(
                Game.getIdManager().getStringId()
            )
        );
        const showAction = new ImageAction(
            this,
            ImageAction.ActionTypes.show,
            new ContentNode(
                Game.getIdManager().getStringId()
            )
        );
        switch (history.type) {
            case ImageTransactionTypes.set:
                this.setSrc(history.data[0]);
                return void 0;
            case ImageTransactionTypes.show:
                if (!history.data) {
                    return hideAction;
                }
                return showAction;
            case ImageTransactionTypes.hide:
                if (history.data) {
                    return showAction;
                }
                return hideAction;
        }
    }

    toTransform(): Transform<ImageTransformProps> {
        return new Transform<ImageTransformProps>(this.state, {
            duration: 0,
        });
    }

    toHTMLElementProps(): React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement> {
        return {
            src: Utils.srcToString(this.config.src),
            width: this.state.width,
            height: this.state.height,
            style: {
                position: 'absolute',
            }
        };
    }

    setScope(scope: React.RefObject<HTMLImageElement>): this {
        this.ref = scope;
        return this;
    }

    getScope(): React.RefObject<HTMLImageElement> {
        return this.ref;
    }
}