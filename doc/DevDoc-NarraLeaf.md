
# NarraLeaf语义规定

这是一个拟定的NarraLeaf语义规定，用于描述NarraLeaf的语法和语义。  
如果你有更好的建议，请直接修改该文档



## 1. 综述

NarraLeaf语法参考了Java, JavaScript, C#, Python等语言的语法，
使用OOP的思想，抽象化游戏中的元素

和其他视觉小说引擎不同，NarraLeaf的语法更加接近于编程语言，而不是标记语言  
同时NarraLeaf语言本身不负责游戏的UI，而是专注于舞台上的元素  
同时，和其他引擎不同，NarraLeaf秉承着无渲染库的原则，使用原生的HTML和CSS来渲染游戏  
这使得NarraLeaf的游戏可以在任何支持HTML和CSS的平台上运行，例如浏览器、Electron、NW.js等  
并且无渲染库和使用Chromium原生动画API对GPU的要求也更低，使得NarraLeaf可以在更多的设备上运行

> NarraLeaf的顶级抽象元素是[故事(Story)](../renderer/lib/game/game/elements/story.ts)
，往下则是[场景(Scene)](../renderer/lib/game/game/elements/scene.ts)  
场景则包含了多个同等级抽象元素：
[角色(Character)](../renderer/lib/game/game/elements/text.ts)、
[图片(Image)](../renderer/lib/game/game/elements/image.ts)、
[声音(Sound)](../renderer/lib/game/game/elements/sound.ts)、
[选项(Menu)](../renderer/lib/game/game/elements/menu.ts)、
[脚本(Script)](../renderer/lib/game/game/elements/script.ts)、
[条件(Condition)](../renderer/lib/game/game/elements/condition.ts)、
[流程控制(Control)](../renderer/lib/game/game/elements/control.ts)

> 场景具有如下子级抽象元素：`转场(Transition)`和接口[ITransition](../renderer/lib/game/game/elements/transition/type.ts)  
> 角色具有如下子级抽象元素：`句子(Sentence)`、`文本(Text)`  
> 图片具有如下子级抽象元素：[变换(Transform)](../renderer/lib/game/game/elements/transform/transform.ts)  
> 脚本具有如下子级抽象元素：`Lambda表达式(Lambda)`

需要注意的是，角色控制故事概念中的角色的**文本**和**配音**行为，而图片控制故事中的图片显示行为

### 1.0 Core基础调用

NarraLeaf Core的调用方式可能有些令人混乱，这是一个例子

```typescript
// 通过Loader，我们可以直接加载图片
import i1_3_2_background from "@/public/static/images/i1_3_2_background.jpg";

// 定义一个故事
const story = new Story("夏日树上的未来");

// 定义一个流程
// 流程名字对于玩家是不可见的，只是用于调试和追踪
const scene1 = new Scene("1_3_2_和叶言道晚安", {
    background: i1_3_2_background,
});

// 定义一个角色
// 角色名字对玩家是可见的，用于显示在游戏中
// 如果要创建一个旁白角色，在Character构造函数中传入null
// 更多配置，请参阅Character类的构造函数
const character1 = new Character("Sensei");

// 值得一提的是，我们可以使用一个TypeScript文件单独存储这些定义并且导出
// 这是合法并且建议的做法

// 为这个流程添加行为
const scene1Actions = scene1.action([
    scene1
        // 在某些情况下，这是必要的，不过NarraLeaf会帮助你管理这些状态
        .activate()

        // 在每个链式调用的操作结尾都要使用toActions()方法来返回操作
        // 这对于脚本至关重要，因为我们无法跟踪链式调用的返回值
        // 因此，几乎所有的链式调用都需要以toActions()方法结尾
        .toActions(),
    
    // 为角色添加行为
    character1
        // 说一句纯文本
        .say("那睡前的20点到22点就是自由活动的时间，叶言可以做很多想做的事情。")
        
        // 让"23点"这个词变成红色
        .say([
            new Word("23点", {color: "#f00"}),
            new Word("的时候护士姐姐们会再来检查一下身体，都没问题就可以休息啦！")
        ]) // 对于更高级的操作，可以手动构建Sentence对象
        
        // 同理
        .toActions(),
]);

// 将流程添加到故事中
story.action([
    scene1Actions
]);
```

**需要注意的是，场景和故事的action方法只应该调用一次**  
而在脚本之外调用元素的方法而不调用toActions()方法会导致元素的行为不可预测  
这是因为为了跟踪元素调用的顺序，场景的action方法接收的是所有元素toActions返回的操作列表



### 1.1 场景(Scene)

场景不同于 Ren'Py 中的场景(Scene)，而是类似于 Ren'Py 中的标签(Label)，用于控制游戏流程  
场景本身也可以控制背景、背景音乐等场景应该有的行为  
这意味着，我们使用多个具有相同参数的场景来表演同一背景下不同故事的情节

### 1.2 声音(Sound)

声音则控制着几乎所有的声音，例如背景音乐，音乐，音效和配音  
而不同类型的声音的行为则由不同的元素控制  
背景音乐由场景控制，音乐和音效全局控制，配音则由角色控制

### 1.3 变换(Transform)和转场(Transition)

变换用于为图片创建动画，理论支持几乎所有[Framer Motion](https://www.framer.com/motion/)支持的动画效果  
这包括了大多数的CSS属性，例如`transform`、`opacity`、`scale`等，
不过这意味着NarraLeaf无法在无渲染库的情况下支持更复杂的效果

转场用于控制场景之间的切换效果，例如淡入淡出等  
通常来讲，用户可以使用接口[ITransition](../renderer/lib/game/game/elements/transition/type.ts)来自定义转场效果  
不过，NarraLeaf也提供了一些内置的转场效果，例如`fade`、`dissolve`等

### 1.4 脚本(Script)

脚本用于控制游戏的逻辑，例如判断条件、控制流程等  
在NarraLeaf Core中，脚本可以是TypeScript代码  
需要注意的是，脚本本身不应该与当前NodeJS环境交互，不应该有副作用  
如果脚本有副作用，需要提供一个清理函数用于清理副作用  
在某些情况下，游戏剧本的初始化会运行多次，因此需要注意脚本的副作用，并且脚本本身不能和上一级环境的变量交互  

例如，脚本不得和当前TypeScript文件中定义的变量交互，而应该使用Storable储存变量

这是一个简单的例子，让用户从三个数字中选择一个数字，正确数字每次不一样

```typescript
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
    namespace.set("answer", number);

    // 带有副作用的脚本必须返回一个清理函数
    // 清理函数会在某种情况下被调用，以清理脚本中的副作用
    return () => namespace.set("answer", void 0);
}).toActions()
```

然后，通过Lambda等方式来检测数字

```typescript
const checkNumber = (n: number) => new Condition()
    // 使用Lambda来检测数字是否正确
    .If(new Lambda(({gameState, resolve}) => {
        
            // 从当前游戏状态中获取储存空间
            const namespace =
                gameState.clientGame.game
                    .getLiveGame()
                    .storable
                    .getNamespace(LiveGame.GameSpacesKey.game);

            // 通过读取储存空间中的数字来判断玩家是否猜对
            resolve(namespace.get("answer") === n);
        }),
        
        character2.say("恭喜你！")
            .say("你猜对了！")
            .toActions()
        
    ).Else(character2.say("很遗憾，你猜错了").toActions())
    .toActions();
```

### 1.5 流程控制与同步异步(Control)

流程控制用于控制游戏的流程，例如循环、条件判断等

由于NarraLeaf在处理脚本时是单线程的，对于一些比较复杂的操作，我们需要使用异步操作  
在NarraLeaf中，存在两种操作执行方式，分别是`异步(Async)`和`同步(Sync)`  
在运行脚本时，异步操作**不会阻塞上一级执行上下文**，而是直接继续下一步  
对于一些动画操作，例如图片执行变换，异步操作不会让下一步操作等待动画结束  

而同步操作，会**阻塞上一级执行上下文**，等待当前操作完成后再执行下一步

下面是一个较为复杂的例子，让角色异步播放动画

```typescript
[
    Control.allAsync([ // 同时异步执行
        
        // 某些复合动画
        shake(image1),
        speechless(scene1, image2),

        // 需要注意的是，声音播放默认是同步的，我们需要在Sound构造函数中传入参数来异步播放
        sound1.play().toActions()
    ]).toActions(),
]
```

在这个例子中，为了让图片播放动画的同时继续说下一句话，我们需要使用`async`来异步播放动画  
而在播放复合动画的时候，我们需要使用`all`来同时播放多个动画  
因此，我们使用`allAsync`来同时异步播放多个动画

更多操作详见[Control](../renderer/lib/game/game/elements/control.ts)类

### 1.6 条件(Condition)

条件用于控制游戏的逻辑，例如判断是否满足某个条件  
条件会计算Lambda实例然后决定输出的行为

Condition实例本身不应该复用，但是其调用toActions()方法返回的行为可以复用

详见[Condition](../renderer/lib/game/game/elements/condition.ts)类

### 1.7 场景(Scene)

场景最重要的功能是显示背景图片、播放背景音乐和跳转  
背景图片和背景音乐的配置可以在Scene类的构造函数中传入  
场景(准确来讲是流程)之间的跳转使用jumpTo方法完成

例如跳转到其他场景

```typescript
[
    scene1.jumpTo(
        scene2,
        {
            transition: new Dissolve(mainMenuBackground2, 2000)
        }
    ).toActions(),
]
```

值得一提的是，这个功能通常与条件和选项配合使用

```typescript
[
    new Menu("选择")
        .choose("1", [
            character2.say("你选择了1")
                .toActions()
        ])
        .choose("2", [
            character2.say("你选择了2，奖励你跳转到场景2")
                .toActions(),

            scene1.jumpTo(
                scene2actions,
                {
                    transition: new Dissolve(mainMenuBackground2, 2000)
                }
            ).toActions(),
        ])
        .toActions(),
]
```

更多有关场景的操作详见[Scene](../renderer/lib/game/game/elements/scene.ts)类

### 1.8 更好的实践

如果要使代码更好维护，我们可以遵循一些很好的实践

1. 集中定义  
    将所有的角色、音乐、图片等定义集中在一个文件中，然后导出  
    这样可以使得代码更加清晰，而不是在一个文件中定义所有的元素
2. 使用TypeScript  
    使用TypeScript可以使得代码更加健壮，而不是使用JavaScript  
    并且可以帮助你找出你是否使用了错误的参数来调用
3. 使用Storable  
    使用Storable来管理游戏状态，而不是直接在脚本中定义变量  
    这样可以使得游戏状态更加清晰
4. 不调用非public方法  
    请不要调用没有public修饰符的方法，这些方法可能不符合正常的用户调用行为
5. 使用链式调用  
    为了使得代码更加简洁，我们建议使用链式调用来调用方法  
6. 使用toActions()  
    我们建议在每一个链式调用的结尾调用toActions()方法

## 2. 语法规范

NarraLeaf清楚，使用NarraLeaf Core对于非开发者来说是一件困难的事情  
因此，我们预定义了一些语法规范，并且在未来通过语法解析器来帮助非开发者编写游戏

### 2.1 文件名

NarraLeaf脚本文件（NarraLeaf Script）的文件名应该以`.nleaf`结尾

### 2.2 缩进

在缩进方面，解析器参考了JavaScript，没有缩进要求，不过我们建议使用4个空格作为缩进

### 2.3 基础语法

在基础语法方面，nleaf参考了JavaScript和Java的语法，使用`作用域`、`表达式`、`语句`等概念
以及一元运算符(语法糖)和多元运算符

例如，`{}`表示作用域，`()`表示表达式，`;`表示语句

nleaf不强制要求在句尾使用`;`，不过我们建议使用`;`来分隔语句
