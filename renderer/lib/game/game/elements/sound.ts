import {Actionable} from "@lib/game/game/actionable";
import {deepMerge, DeepPartial, safeClone} from "@lib/util/data";
import {SoundAction, SoundActionContentType} from "@lib/game/game/actions";
import {Game} from "@lib/game/game/game";
import {ContentNode} from "@lib/game/game/save/rollback";
import * as Howler from "howler";
import {HowlOptions} from "howler";
import _ from "lodash";

export enum SoundType {
    soundEffect = "soundEffect",
    music = "music",
    voice = "voice",
    backgroundMusic = "backgroundMusic",
}

export type SoundDataRaw = {
    config: SoundConfig;
};

export type SoundConfig = {
    // @todo: 速读模式
    // @todo: 速读模式中忽略voice和soundEffect
    /**
     * 声音类型
     * - **soundEffect**：音效
     * - **music**：音乐
     * - **voice**：语音
     * - **backgroundMusic**：背景音乐
     */
    type?: SoundType;
    src: string;
    /**
     * 如果为真，该操作会阻塞直到声音播放完毕
     */
    sync?: boolean;
    /**
     * 是否循环播放，如果sync和loop都为真，sync会当作**false**处理
     */
    loop?: boolean;
    volume?: number;
    streaming?: boolean;
};

export class Sound extends Actionable {
    static defaultConfig: SoundConfig = {
        src: "",
        sync: false,
        loop: false,
        volume: 1,
    };
    config: SoundConfig;
    state: {
        playing: null | Howler.Howl;
        token: any;
    } = {
        playing: null,
        token: null,
    };
    readonly id: string;

    constructor(config: DeepPartial<SoundConfig> = {}) {
        super();
        this.config = deepMerge<SoundConfig>(Sound.defaultConfig, config);
        this.id = Game.getIdManager().getStringId();
    }

    public play(): this {
        if (this.config.type === SoundType.backgroundMusic) {
            throw new Error("Background music cannot be played directly");
        }
        return this.pushAction<SoundActionContentType["sound:play"]>(SoundAction.ActionTypes.play, [void 0]);
    }

    public stop(): this {
        if (this.config.type === SoundType.backgroundMusic) {
            throw new Error("Background music cannot be stopped directly");
        }
        return this.pushAction<SoundActionContentType["sound:stop"]>(SoundAction.ActionTypes.stop, [void 0]);
    }

    public fade(start: number, end: number, duration: number): this {
        if (this.config.type === SoundType.backgroundMusic) {
            throw new Error("Background music cannot be faded directly");
        }
        return this.pushAction<SoundActionContentType["sound:fade"]>(SoundAction.ActionTypes.fade, [{
            start, end, duration
        }]);
    }

    public setVolume(volume: number): this {
        return this.pushAction<SoundActionContentType["sound:setVolume"]>(SoundAction.ActionTypes.setVolume, [volume]);
    }

    public setRate(rate: number): this {
        return this.pushAction<SoundActionContentType["sound:setRate"]>(SoundAction.ActionTypes.setRate, [rate]);
    }

    private pushAction<T>(type: string, content: T): this {
        const action = new SoundAction(
            this,
            type,
            new ContentNode<T>(
                Game.getIdManager().getStringId()
            ).setContent(content)
        );
        this.actions.push(action);
        return this;
    }

    getHowlOptions(): HowlOptions {
        return {
            src: this.config.src,
            loop: this.config.loop,
            volume: this.config.volume,
            html5: this.config.streaming,
            autoplay: false,
        }
    }

    getSrc() {
        return this.config.src;
    }

    $setToken(token: any) {
        this.state.token = token;
    }

    $getToken() {
        return this.state.token;
    }

    $setHowl(howl: Howler.Howl) {
        this.state.playing = howl;
    }

    $getHowl() {
        return this.state.playing;
    }

    $stop() {
        this.$setToken(null);
        this.$setHowl(null);
    }

    public toData(): SoundDataRaw {
        if (_.isEqual(this.config, Sound.defaultConfig)) {
            return null;
        }
        return {
            config: safeClone(this.config)
        };
    }

    public fromData(data: SoundDataRaw): this {
        this.config = deepMerge<SoundConfig & SoundDataRaw>(this.config, data.config);
        return this;
    }
}
