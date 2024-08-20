import {
    Character,
    Condition,
    Control, Image,
    Lambda,
    Menu,
    Script,
    Sentence,
    Story,
    Transform,
    Utils,
    Word
} from "@lib/game/game/common/core";
import {GameState, LiveGame} from "@lib/game/game/common/game";
import type {TransformDefinitions} from "@lib/game/game/common/types";

import {
    character1,
    character2,
    image1,
    image2,
    mainMenuBackground,
    mainMenuBackground2,
    scene1,
    sound1
} from "@lib/game/story/definitions";
import {Fade} from "@lib/game/game/elements/transition/fade";
import {Dissolve} from "@lib/game/game/elements/transition/dissolve";

const story = new Story("test");

const YouAreCorrect = character2.say("恭喜你！")
    .say("你猜对了！")
    .toActions();

const checkNumber = (n: number) => new Condition()
    .If(new Lambda(({gameState, resolve}) => {
            resolve(isNumberCorrect(gameState, n));
        }),
        YouAreCorrect
    ).Else(character2.say("很遗憾，你猜错了").toActions())
    .toActions();

const fadeOutTransition = new Fade(2000, "out");
const fadeInTransition = new Fade(2000, "in");

// @todo: 包装一下转场

const scene1Actions = scene1.action([
    scene1.activate().toActions(),

    image1.init().toActions(),
    image2.init().toActions(),

    image1.show({
        ease: "circOut",
        duration: 0.5,
        sync: true
    }).toActions(),
    new Character(null)
        .say("简体中文，繁體中文, 日本語, 한국어, ไทย, Tiếng Việt, हिन्दी, বাংলা, తెలుగు, मराठी, 1234567890!@#$%^&*()QWERTYUIOPASDFGHJKLZCVN{}|:\"<>?~`, A quick brown fox jumps over the lazy dog.")
        .toActions(),
    Control.allAsync([
        image1.applyTransform(new Transform<TransformDefinitions.ImageTransformProps>([
            {
                props: {
                    position: {
                        xoffset: 5,
                    }
                },
                options: {
                    duration: 0.1,
                    ease: "easeOut",
                }
            },
            {
                props: {
                    position: {
                        xoffset: -5,
                    }
                },
                options: {
                    duration: 0.1,
                    ease: "easeOut",
                }
            },
        ], {
            sync: true
        }).repeat(2)).toActions(),
        Control.do([
            image2.show(new Transform<TransformDefinitions.ImageTransformProps>([{
                props: {
                    display: true,
                    opacity: 1,
                    position: {
                        yoffset: -10
                    }
                },
                options: {
                    duration: 0.5,
                    ease: "easeOut",
                }
            }], {
                sync: false
            })).toActions(),
            scene1.sleep(3000).toActions(),
            image2.hide().toActions(),
        ]).toActions(),
    ]).toActions(),

    sound1.play().toActions(),

    character1
        .say("你好！").toActions(),

    // scene1.applyTransition(fadeOutTransition)
    //     .setSceneBackground(mainMenuBackground2)
    //     .applyTransition(fadeInTransition).toActions(),
    scene1.applyTransition(new Dissolve(Image.staticImageDataToSrc(mainMenuBackground2), 2000))
        .setSceneBackground(mainMenuBackground2).toActions(),

    character1.say("你最近过的怎么样？")
        .toActions(),


    new Menu("我最近过的怎么样？")
        .choose({
            action:
                character2.say("是吗？")
                    .say("那真的是太棒了")
                    .toActions()
            ,
            prompt: "我过的很好"
        })
        .choose({
            action:
                character2.say("我也一样")
                    .say("过的还不错")
                    .toActions()
            ,
            prompt: "还不错吧"
        })
        .toActions(),
    character2
        .say("那你愿不愿意陪我玩一个游戏？")
        .say("听好游戏规则")
        .say([new Word("我会思考一个介于 "), new Word("1 和 10", {color: "#f00"}), "之间的数字"])
        .say("你要猜这个数字是多少")
        .toActions(),
    new Script((ctx) => {
        // 由于游戏脚本创建必须没有副作用，所以这里不能直接修改游戏状态
        // 使用Script来更新状态，使用Storable来管理状态
        const namespace =
            ctx.gameState.clientGame.game
                .getLiveGame()
                .storable
                .getNamespace(LiveGame.GameSpacesKey.game)
        let availableNumbers = [3, 6, 8];
        const number = availableNumbers[Math.floor(Math.random() * availableNumbers.length)];
        namespace.set("number", number);
        return () => namespace.set("number", void 0);
    }).toActions(),

    new Menu(new Sentence(character2, "那么，你猜这个数字是多少？"))
        .choose({
            action: checkNumber(3),
            prompt: "3"
        })
        .choose({
            action: checkNumber(6),
            prompt: "6"
        })
        .choose({
            action: checkNumber(8),
            prompt: "8"
        })
        .toActions(),
    character2.say("游戏结束！")
        .toActions(),
    scene1.deactivate().toActions()
]);

scene1.srcManager.register(sound1)
    .register(new Image("_", {
        src: mainMenuBackground
    }))
    .register(new Image("_", {
        src: mainMenuBackground2
    }))
    .register(image1)
    .register(image2)

function isNumberCorrect(gameState: GameState, number: number) {
    const namespace =
        gameState.clientGame.game
            .getLiveGame()
            .storable
            .getNamespace(LiveGame.GameSpacesKey.game)
    return namespace.get("number") === number;
}


story.action([
    scene1Actions
]);

export {
    story
}


