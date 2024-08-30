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
    Sound,
    Story,
    Transform,
    Word
} from "@lib/game/game/common/core";
import {GameState, LiveGame} from "@lib/game/game/common/game";
import type {TransformDefinitions} from "@lib/game/game/common/types";

import {
    character1,
    character2,
    image1, image1_2,
    image2,
    mainMenuBackground,
    mainMenuBackground2,
    scene1, scene2Bgm,
    shake,
    sound1,
    speechless
} from "@lib/game/story/definitions";
import {Dissolve} from "@lib/game/game/elements/transition/dissolve";
import {SoundType} from "@lib/game/game/elements/sound";

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

const scene3 = new Scene("scene3", {
    background: mainMenuBackground,
    invertY: true,
});

const scene3actions = scene3.action([
    // scene3.activate().toActions(),
    // scene3.deactivate().toActions(),
    image1.init().toActions(),
    image1.show(new Transform<TransformDefinitions.ImageTransformProps>([
        {
            props: {
                position: "left",
                opacity: 1,
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

    image1.applyTransform(new Transform<TransformDefinitions.ImageTransformProps>([
        {
            props: {
                position: "right",
                opacity: 1,
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
    image1.hide({
        ease: "linear",
        duration: 2,
    }).toActions(),
    new Character(null)
        .say("hello")
        .say("world")
        .toActions(),
    scene3.deactivate().toActions(),
]);

const scene2 = new Scene("scene2", {
    background: mainMenuBackground2,
    invertY: true,
    backgroundMusic: scene2Bgm,
    backgroundMusicFade: 1000,
});

const scene2actions = scene2.action([
    image1.init().toActions(),
    new Character(null)
        .say("hello")
        .toActions(),
    // scene2.sleep(1000).toActions(),
    // image1_2.show({
    //     duration: 0.5,
    // }).toActions(),
    image1.show(new Transform<TransformDefinitions.ImageTransformProps>([
        {
            props: {
                position: "right",
                opacity: 1,
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
    scene2.sleep(1000).toActions(),
    new Character(null)
        .say("world")
        .toActions(),
    image1.hide({
        ease: "linear",
        duration: 2,
    }).toActions(),

    // scene2.setBackgroundMusic(scene2Bgm).toActions(),

    scene2.jumpTo(scene3actions, {
        transition: new Dissolve(mainMenuBackground, 2000)
    }).toActions(),
]);

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

const scene1Actions = scene1.action([
    scene1.activate().toActions(),

    image1.init().toActions(),
    image2.init().toActions(),

    image1.show({
        ease: "circOut",
        duration: 0.5,
        sync: true,
    }).toActions(),
    scene1.sleep(1000).toActions(),
    character1
        .say("你好！")
        .toActions(),
    Control.allAsync([
        shake(image1), // 通过自定义的函数返回操作
        Control.do([
            speechless(scene1, image2),
            image2.dispose().toActions(),
        ]).toActions(),
        sound1.play().toActions()
    ]).toActions(),


    character1.say("你最近过的怎么样？")
        .toActions(),


    new Menu("我最近过的怎么样？")
        .choose("我过的很好", [
            character2.say("是吗？")
                .say("那真的是太棒了")
                .toActions()
        ])
        .choose("还不错吧", [
            character2.say("我也一样")
                .say("过的还不错")
                .toActions(),

            image1.hide().toActions(),

            scene1.jumpTo(
                scene2actions,
                {
                    transition: new Dissolve(mainMenuBackground2, 2000)
                }
            ).toActions(),
        ])
        .toActions(),


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

    // 直接通过jumpTo方法跳转到下一个场景
    // 该方法会卸载当前场景，这意味着该方法之后的所有操作都不会被执行
    scene1.jumpTo(
        scene2actions,
        {
            transition: new Dissolve(Image.staticImageDataToSrc(mainMenuBackground2), 2000)
        }
    ).toActions(),
]);

// @todo: 自动注册资源
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
    .register(image1)

scene3.srcManager.register(image1)
    .register(new Image("_", {
        src: mainMenuBackground
    }))
    .register(image1)

function isNumberCorrect(gameState: GameState, number: number) {
    const namespace =
        gameState.clientGame.game
            .getLiveGame()
            .storable
            .getNamespace(LiveGame.GameSpacesKey.game)
    return namespace.get("number") === number;
}

// @todo: 测试多场景

story.action([
    scene1Actions
]);

export {
    story
}


