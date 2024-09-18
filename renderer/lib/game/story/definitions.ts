import {Scene} from "narraleaf-react";
import mainMenuBackground from "@/public/static/images/main-menu-background.png";
import mainMenuBackground2 from "@/public/static/images/main-menu-background2.jpg";
import {Character} from "narraleaf-react";
import {Sound, SoundType} from "narraleaf-react";
import {Image} from "narraleaf-react";
import ImageSpeechless from "@/public/static/images/test_speechless.png";
import {Transform} from "narraleaf-react";
import type {TransformDefinitions} from "narraleaf-react";
import {Fade} from "narraleaf-react";
import {Align, Coord2D} from "narraleaf-react";

export const scene1 = new Scene("scene1", {
    background: mainMenuBackground,
    invertY: true,
    invertX: false
});
export const transition1 = new Fade(300);

export const image1 = new Image("test_sensei", {
    src: "/static/images/kotoba_tcr_bingfu_lh_pm_wx_xy.png",
    position: new Align({xalign: 0.3, yalign: 0.5}),
    scale: 0.1,
});
export const image1_2 = image1.copy();
export const image2 = new Image("image_speechless", {
    src: ImageSpeechless,
    position: new Align({xalign: 0.3, yalign: 0.7, xoffset: 70}),
    scale: 0.1,
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