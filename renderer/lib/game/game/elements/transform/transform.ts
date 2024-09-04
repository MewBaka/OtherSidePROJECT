import type {
    Background,
    color,
    CommonImage,
    CommonImagePosition,
} from "../../show";
import {
    ImagePosition,
} from "../../show";
import type {AnimationPlaybackControls, DOMKeyframesDefinition, DynamicAnimationOptions} from "framer-motion";
import {deepMerge, DeepPartial, sleep, toHex} from "@lib/util/data";
import {GameState} from "@lib/ui/components/player/gameState";
import {TransformDefinitions} from "@lib/game/game/elements/transform/type";
import Sequence = TransformDefinitions.Sequence;
import SequenceProps = TransformDefinitions.SequenceProps;
import {Align, CommonPosition, Coord2D, IPosition, PositionUtils} from "@lib/game/game/elements/transform/position";
import {CSSProps} from "@lib/game/game/elements/transition/type";
import {Utils} from "@lib/game/game/common/Utils";

export type Transformers =
    "position"
    | "opacity"
    | "scale"
    | "rotation"
    | "display"
    | "src"
    | "backgroundColor"
    | "backgroundOpacity";
export type TransformHandler<T> = (value: T) => DOMKeyframesDefinition;
export type TransformersMap = {
    "position": CommonImage["position"],
    "opacity": number,
    "scale": number,
    "rotation": number,
    "display": string,
    "src": string,
    "backgroundColor": Background["background"],
    "backgroundOpacity": number,
    "transform": TransformDefinitions.Types,
}

const CommonImagePositionMap = {
    [ImagePosition.left]: "25.33%",
    [ImagePosition.center]: "50%",
    [ImagePosition.right]: "75.66%"
} as const;

export class Transform<T extends TransformDefinitions.Types = TransformDefinitions.ImageTransformProps> {
    static defaultSequenceOptions: Partial<TransformDefinitions.CommonSequenceProps> = {
        sync: true,
        repeat: 1,
    };
    static defaultOptions: Partial<TransformDefinitions.CommonTransformProps> = {
        duration: 0,
        ease: "linear",
    }
    static CommonImagePositionMap = CommonImagePositionMap;

    private readonly sequenceOptions: Partial<TransformDefinitions.CommonSequenceProps>;
    private sequences: TransformDefinitions.Sequence<T>[] = [];
    private control: AnimationPlaybackControls | null = null;
    private transformers: { [K in Transformers]?: Function } = {};

    /**
     * @example
     * ```ts
     * const transform = new Transform<ImageTransformProps>({
     *   opacity: 1,
     *   position: "center"
     * }, {
     *   duration: 0,
     *   ease: "linear"
     * });
     * ```
     */
    constructor(sequences: Sequence<T>[], sequenceOptions?: Partial<TransformDefinitions.TransformConfig>);
    constructor(props: DeepPartial<T>, options?: Partial<TransformDefinitions.CommonTransformProps>);
    constructor(arg0: Sequence<T>[] | DeepPartial<T>, arg1?: Partial<TransformDefinitions.CommonTransformProps> | TransformDefinitions.SequenceOptions) {
        if (Array.isArray(arg0)) {
            this.sequences.push(...arg0);
            this.sequenceOptions = Object.assign({}, Transform.defaultSequenceOptions, arg1 || {});
        } else {
            const [props, options] =
                [arg0, arg1 || Transform.defaultOptions];
            this.sequences.push({props, options: options || {}});
            this.sequenceOptions = Object.assign({}, Transform.defaultSequenceOptions);
        }
    }

    public static isPosition(position: any): position is (CommonImagePosition | Coord2D | Align) {
        return CommonPosition.isCommonPositionType(position) || Coord2D.isCoord2DPosition(position) || Align.isAlignPosition(position);
    }

    public static positionToCSS(
        position: CommonImage["position"],
        invertY?: boolean | undefined,
        invertX?: boolean | undefined
    ): CSSProps {
        return PositionUtils.D2PositionToCSS(position.toCSS(), invertX, invertY);
    }

    public static backgroundToCSS(background: Background["background"]): {
        backgroundImage?: string,
        backgroundColor?: string
    } {
        if (background === null || background === undefined) return {};
        if (Utils.isStaticImageData(background)) {
            return {backgroundImage: `url(${background.src})`};
        }
        const backgroundImage = background?.["url"] ? (
            "url(" + background?.["url"] + ")"
        ) : undefined;

        const backgroundColor = (!backgroundImage) ?
            background ? toHex(background as color) : undefined :
            undefined;
        return {backgroundImage, backgroundColor};
    }

    static mergePosition<T>(a: IPosition | undefined, b: IPosition | undefined): Coord2D {
        if (!a && !b) {
            throw new Error("No position found.");
        }
        if (!a || !b) {
            return PositionUtils.toCoord2D(a || b);
        }
        return PositionUtils.mergePosition(a, b);
    }

    static mergeState<T>(state: DeepPartial<T>, props: DeepPartial<T>): DeepPartial<T> {
        const position = this.mergePosition(state["position"], props["position"]);
        return {
            ...deepMerge(state, props),
            position,
        };
    }

    /**
     * @example
     * ```ts
     * const [scope, animate] = useAnimation();
     * transform.animate(scope, animate);
     * return <div ref={scope} />
     * ```
     */
    public async animate<U extends Element = any>(
        {scope, animate}:
            { scope: TransformDefinitions.FramerAnimationScope<U>, animate: TransformDefinitions.FramerAnimate },
        gameState: GameState,
        state: SequenceProps<T>,
        after?: (state: DeepPartial<T>) => void
    ) {
        console.debug("Animating", this); // @debug

        // unsafe
        state = deepMerge<DeepPartial<T>>(state, {});

        return new Promise<void>(async (resolve) => {
            if (!this.sequenceOptions.sync) {
                resolve();
                if (after) {
                    after(state);
                }
            }
            for (let i = 0; i < this.sequenceOptions.repeat; i++) {
                for (const {props, options} of this.sequences) {
                    const initState = deepMerge({}, this.propToCSS(gameState, state));

                    if (!scope.current) {
                        throw new Error("No scope found when animating.");
                    }
                    const current = scope.current as Element;
                    Object.assign(current["style"], initState);

                    state = Transform.mergeState(state, props);
                    const animation = animate(
                        current,
                        this.propToCSS(gameState, state),
                        this.optionsToFramerMotionOptions(options)
                    );
                    this.setControl(animation);

                    console.log("animation start", this.propToCSS(gameState, state), state); // @debug
                    console.debug("animate from", initState, "to", this.propToCSS(gameState, state)); // @debug

                    if (options?.sync !== false) {
                        await new Promise<void>(r => animation.then(() => r()));
                        Object.assign(current["style"], this.propToCSS(gameState, state));
                        this.setControl(null);
                    } else {
                        animation.then(() => {
                            Object.assign(current["style"], this.propToCSS(gameState, state));
                            this.setControl(null);
                        });
                    }
                }
            }

            // I don't understand
            // but if we don't wait for a while, something will go wrong
            await sleep(2);
            this.setControl(null);
            console.log("animation done")

            if (this.sequenceOptions.sync) {
                resolve();
                if (after) {
                    after(state);
                }
            }
        });
    }

    /**
     * 将动画的重复次数乘以n
     * 会受到传入Config的影响
     * @example
     * ```ts
     * transform
     *   .repeat(2)
     *   .repeat(3)
     * // 重复6次
     * ```
     */
    public repeat(n: number) {
        this.sequenceOptions.repeat *= n;
        return this;
    }

    /**
     * overwrite a transformer
     * @example
     * ```ts
     * transform.overwrite("position", (value) => {
     *   return {left: value.x, top: value.y};
     * });
     * ```
     */
    public overwrite<T extends keyof TransformersMap = any>(key: T, transformer: TransformHandler<TransformersMap[T]>) {
        this.transformers[key as any] = transformer;
        return this;
    }

    propToCSS(state: GameState, prop: DeepPartial<T>): DOMKeyframesDefinition {
        const {invertY, invertX} = state.getLastScene()?.config || {}
        const FieldHandlers: Record<string, (v: any) => any> = {
            "position": (value: CommonImage["position"]) => Transform.positionToCSS(value, invertY, invertX),
            "backgroundColor": (value: Background["background"]) => Transform.backgroundToCSS(value),
            "backgroundOpacity": (value: number) => ({opacity: value}),
            "opacity": (value: number) => ({opacity: value}),
            "scale": () => ({}),
            "rotation": () => ({}),
            "display": () => ({}),
            "src": () => ({}),
        };

        const props = {} as DOMKeyframesDefinition;
        props.transform = this.propToCSSTransform(state, prop);
        if (this.transformers["transform"]) {
            Object.assign(props, this.transformers["transform"](prop));
        }

        for (const key in prop) {
            if (!prop.hasOwnProperty(key)) continue;
            if (this.transformers[key as any]) {
                Object.assign(props, this.transformers[key as any](prop[key]));
            } else if (FieldHandlers[key]) {
                Object.assign(props, FieldHandlers[key](prop[key]));
            }
        }
        return props;
    }

    optionsToFramerMotionOptions(options?: Partial<TransformDefinitions.CommonTransformProps>): DynamicAnimationOptions {
        if (!options) {
            return options;
        }
        const {duration, ease} = options;
        return {
            duration: duration / 1000,
            ease,
        };
    }

    propToCSSTransform(state: GameState, prop: DeepPartial<T>): string {
        if (!state.getLastScene()) {
            throw new Error("No scene found in state, make sure you called \"scene.activate()\" before this method.");
        }
        const {invertY, invertX} = state.getLastScene().config || {};
        const Transforms = [
            `translate(${invertX ? "" : "-"}50%, ${invertY ? "" : "-"}50%)`,
            (prop["scale"] !== undefined) && `scale(${prop["scale"]})`,
            (prop["rotation"] !== undefined) && `rotate(${prop["rotation"]}deg)`,
        ];
        return Transforms.filter(Boolean).join(" ");
    }

    setControl(control: AnimationPlaybackControls) {
        this.control = control;
        return this;
    }

    getControl() {
        return this.control;
    }

    public copy(): Transform<T> {
        return new Transform<T>(this.sequences, this.sequenceOptions);
    }
}




