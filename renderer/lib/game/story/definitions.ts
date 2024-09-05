import {Scene} from "@lib/game/game/elements/scene";
import mainMenuBackground from "@/public/static/images/main-menu-background.png";
import mainMenuBackground2 from "@/public/static/images/main-menu-background2.jpg";
import {Character} from "@lib/game/game/elements/text";
import {Sound, SoundType} from "@lib/game/game/elements/sound";
import {Image} from "@lib/game/game/elements/image";
import ImageSpeechless from "@/public/static/images/test_speechless.png";
import {Transform} from "@lib/game/game/elements/transform/transform";
import type {TransformDefinitions} from "@lib/game/game/elements/transform/type";
import {Fade} from "@lib/game/game/elements/transition/fade";
import {Align, Coord2D} from "@lib/game/game/elements/transform/position";

export const scene1 = new Scene("scene1", {
    background: mainMenuBackground,
    invertY: true,
    invertX: false
});
export const transition1 = new Fade("/static/images/kotoba_tcr_bingfu_lh_pm_xz.png", 300);

export const image1 = new Image("test_sensei", {
    src: "/static/images/kotoba_tcr_bingfu_lh_pm_wx_xy.png",
    position: new Align({xalign: 0.3, yalign: 0.5, yoffset: -20}),
    scale: 0.3,
});
export const image1_2 = image1.copy();
export const image2 = new Image("image_speechless", {
    src: ImageSpeechless,
    position: new Align({xalign: 0.3, yalign: 0.7, xoffset: 70}),
    scale: 0.1,
    cache: true
});
export const character1 = new Character("还没有名字");
export const character2 = new Character("我");
export const sound1 = new Sound({
    src: "/static/sounds/SE_Appear_01b.wav.mp3",
    sync: false,
    streaming: true,
});
export const transformShake = new Transform<TransformDefinitions.ImageTransformProps>([
    {
        props: {
            position: new Coord2D({xoffset: 5})
        },
        options: {
            duration: 100,
            ease: "easeOut",
        }
    },
    {
        props: {
            position: new Coord2D({xoffset: -5})
        },
        options: {
            duration: 100,
            ease: "easeOut",
        }
    },
], {
    sync: true
}).repeat(2);
export const scene2Bgm = new Sound({
    src: "/static/sounds/Matisse & Sadko _ Hanne Mjøen - Into You.ogg",
    type: SoundType.backgroundMusic,
    loop: true,
    streaming: true,
});

export {
    mainMenuBackground,
    mainMenuBackground2
};