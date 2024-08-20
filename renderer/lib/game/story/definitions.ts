import {Scene} from "@lib/game/game/elements/scene";
import mainMenuBackground from "@/public/static/images/main-menu-background.webp";
import mainMenuBackground2 from "@/public/static/images/main-menu-background2.jpg";
import {Character} from "@lib/game/game/elements/text";
import {Sound} from "@lib/game/game/elements/sound";
import {Image} from "@lib/game/game/elements/image";
import ImageSpeechless from "@/public/static/images/test_speechless.png";
import {Utils} from "@lib/game/game/common/Utils";
import {SrcManager} from "@lib/game/game/elements/srcManager";

export const scene1 = new Scene("scene1", {
    background: mainMenuBackground,
    invertY: true,
    invertX: false
});

export const image1 = new Image("i1", {
    src: "/static/images/test_sensei.png",
    position: {
        xalign: 0.3,
        yalign: 0.5
    },
    scale: 0.7,
});
export const image2 = new Image("i2", {
    src: ImageSpeechless,
    position: {
        xalign: 0.3,
        yalign: 0.7,
        xoffset: 70
    },
    scale: 0.1,
    cache: true
});
export const character1 = new Character("还没有名字");
export const character2 = new Character("我");
export const sound1 = new Sound({
    src: "/static/sounds/SE_Write_01.wav",
    sync: false
});

export {
    mainMenuBackground,
    mainMenuBackground2
};