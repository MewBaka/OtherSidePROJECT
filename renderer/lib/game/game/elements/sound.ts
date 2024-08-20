import {Actionable} from "@lib/game/game/actionable";
import {deepMerge, DeepPartial} from "@lib/util/data";
import {SoundAction} from "@lib/game/game/actions";
import {Game} from "@lib/game/game/game";
import {ContentNode} from "@lib/game/game/save/rollback";
import * as Howler from "howler";

export enum SoundType {
    soundEffect = "soundEffect",
    music = "music",
    voice = "voice",
}

export type SoundConfig = {
    // @todo: 速读模式
    // @todo: 速读模式中忽略voice和soundEffect
    /**
     * 声音类型
     * - **soundEffect**：音效
     * - **music**：音乐
     * - **voice**：语音
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
    } = {
        playing: null,
    };

    constructor(config: DeepPartial<SoundConfig> = {}) {
        super();
        this.config = deepMerge<SoundConfig>(Sound.defaultConfig, config);
    }

    public play(): this {
        const action = new SoundAction(
            this,
            SoundAction.ActionTypes.play,
            new ContentNode<[void]>(
                Game.getIdManager().getStringId()
            ).setContent([void 0])
        );
        this.actions.push(action);
        return this;
    }

    public stop(): this {
        const action = new SoundAction(
            this,
            SoundAction.ActionTypes.stop,
            new ContentNode<[void]>(
                Game.getIdManager().getStringId()
            ).setContent([void 0])
        );
        this.actions.push(action);
        return this;
    }

    getSrc() {
        return this.config.src;
    }

    $setHowl(howl: Howler.Howl) {
        this.state.playing = howl;
    }

    $getHowl() {
        return this.state.playing;
    }
}
