import {
    Character,
    Condition,
    Control,
    Image,
    Lambda,
    Menu,
    Scene,
    Script,
    Sentence,
    Story,
    Transform,
    Word
} from "@lib/game/game/common/core";
import {GameState, LiveGame} from "@lib/game/game/common/game";
import type {TransformDefinitions} from "@lib/game/game/common/types";

import {
    character1,
    character2,
    image1,
    image1_2,
    image1_3,
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
// @fixme: 在其他场景中使用变换会导致图片行为不符合预期

const scene3 = new Scene("scene3", {
    background: mainMenuBackground,
    invertY: true,
});

const scene3actions = scene3.action([
    // scene3.activate().toActions(),
    image1_3.init().toActions(),
    // image1_3.show({
    //     ease: "circOut",
    //     duration: 0.5,
    //     sync: true
    // }).toActions(),

    image1_3.applyTransform(new Transform<TransformDefinitions.ImageTransformProps>([
        {
            props: {
                display: true
            },
            options: {
                duration: 0,
                ease: "easeOut",
            }
        },
    ], {
        sync: true,
    })).toActions(),
    image1_3.applyTransform(new Transform<TransformDefinitions.ImageTransformProps>([
        {
            props: {
                position: "right",
                opacity: 1,
                display: true
            },
            options: {
                duration: 2,
                ease: "easeOut",
            }
        },
    ], {
        sync: true,
        ease: "easeOut",
        duration: 2
    })).toActions(),
    new Character(null)
        .say("hello")
        .say("world")
        .toActions(),
    scene3.deactivate().toActions(),
]);

const scene2 = new Scene("scene2", {
    background: mainMenuBackground2,
    invertY: true,
});

const scene2actions = scene2.action([
    // scene2.activate().toActions(),
    image1_2.init().toActions(),
    image1_2.show({
        ease: "circOut",
        duration: 2,
        sync: true
    }).toActions(),
    new Character(null)
        .say("hello")
        .toActions(),
    image1_2.applyTransform(new Transform<TransformDefinitions.ImageTransformProps>([
        {
            props: {
                position: "right"
            },
            options: {
                duration: 2,
                ease: "easeOut",
            }
        },
    ], {
        sync: true,
        ease: "easeOut",
    })).toActions(),
    new Character(null)
        .say("world")
        .toActions(),
    image1_2.hide().toActions(),

    scene2.jumpTo(scene3actions, {
        transition: new Dissolve(Image.staticImageDataToSrc(mainMenuBackground), 2000)
    }).toActions(),
]);

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

    // 兼容性最高的旧版写法
    /*
    scene1.applyTransition(fadeOutTransition)
        .setSceneBackground(mainMenuBackground2)
        .applyTransition(fadeInTransition).toActions(),
    scene1.applyTransition(new Dissolve(Image.staticImageDataToSrc(mainMenuBackground2), 2000))
        .setSceneBackground(mainMenuBackground2).toActions(),
    */

    // 新版写法
    /*
    scene1.transitionSceneBackground(scene2, new Dissolve(Image.staticImageDataToSrc(mainMenuBackground2), 2000))
        .toActions(),
    */

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

    image1.hide().toActions(),

    scene1.jumpTo(
        scene2actions,
        {
            transition: new Dissolve(mainMenuBackground2, 2000)
        }
    ).toActions(),

    image1.applyTransform(new Transform<TransformDefinitions.ImageTransformProps>([
        {
            props: {
                position: "right"
            },
            options: {
                duration: 2,
                ease: "easeOut",
            }
        },
    ], {
        sync: true,
        ease: "easeOut",
    })).toActions(),

    character2
        .say("那你愿不愿意陪我玩一个游戏？")
        .say("听好游戏规则")
        .say([new Word("我会思考一个介于 "), new Word("1 和 10", {color: "#f00"}), "之间的数字"])
        .say("你要猜这个数字是多少")
        .toActions(),
    new Script((ctx) => {
        // 由于游戏脚本创建必须没有副作用，所以这里不能直接修改游戏状态
        // 使用Script来更新状态，使用Storable来管理状态

        // 从当前游戏状态中获取储存空间
        const namespace =
            ctx.gameState.clientGame.game
                .getLiveGame()
                .getStorable()
                .getNamespace(LiveGame.GameSpacesKey.game)

        // 选择一个数字
        const availableNumbers = [3, 6, 8];
        const number = availableNumbers[Math.floor(Math.random() * availableNumbers.length)];

        // 将数字存储到储存空间中
        // 在之后的脚本中通过读取这个数字来判断玩家是否猜对
        // 通常不建议直接在脚本文件中创建变量，因为这会导致脚本行为不可预测
        namespace.set("number", number);

        // 带有副作用的脚本必须返回一个清理函数
        // 清理函数会在某种情况下被调用，以清理脚本中的副作用
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

    // 我们不再需要这个图片，所以我们需要释放其资源
    // 在释放之后调用其任何方法都是不合法并且不安全的
    image2.dispose().toActions(),

    // 兼容性最高的旧版写法
    // scene1
    //     .applyTransition(new Dissolve(Image.staticImageDataToSrc(mainMenuBackground2), 2000))
    //     .toActions(),
    // scene2.activate().toActions(),
    // scene1
    //     .deactivate().toActions(),
    // scene1._transitionToScene(scene2, new Dissolve(Image.staticImageDataToSrc(mainMenuBackground2), 2000)).toActions(),
    // scene2actions

    // 新版写法
    scene1.jumpTo(
        scene2actions,
        {
            transition: new Dissolve(Image.staticImageDataToSrc(mainMenuBackground2), 2000)
        }
    ).toActions(),
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

scene2.srcManager.register(image1)
    .register(new Image("_", {
        src: mainMenuBackground2
    }))
    .register(image1_2)

scene3.srcManager.register(image1)
    .register(new Image("_", {
        src: mainMenuBackground
    }))
    .register(image1_3)

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


