
# NarraLeaf语义规定

这是一个拟定的NarraLeaf语义规定，用于描述NarraLeaf的语法和语义。  
如果你有更好的建议，请直接修改该文档

该文档并非最终开发成果或可靠的API文档  
如果你需要完整的API文档，我还没写呢

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

> 角色具有如下子级抽象元素：`句子(Sentence)`、`文本(Text)`  
> 脚本具有如下子级抽象元素：`Lambda表达式(Lambda)`

两个特殊的类为[变换(Transform)](../renderer/lib/game/game/elements/transform/transform.ts)
和[过渡(Transition)](../renderer/lib/game/game/elements/transition/type.ts)

在NarraLeaf后续版本中，`转场(Transition)`将改名为`过渡(Transition)`，并且过渡和变换都能用在图片和场景上

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
scene1.action([
    // 为角色添加行为
    character1
        // 说一句纯文本
        .say("那睡前的20点到22点就是自由活动的时间，叶言可以做很多想做的事情。")
        
        // 让"23点"这个词变成红色
        .say([
            new Word("23点", {color: "#f00"}),
            new Word("的时候护士姐姐们会再来检查一下身体，都没问题就可以休息啦！")
        ]) // 对于更高级的操作，可以手动构建Sentence对象

        // 在每个链式调用的操作结尾都要使用toActions()方法来返回操作
        // 这对于脚本至关重要，因为我们无法跟踪链式调用的返回值
        // 因此，几乎所有的链式调用都需要以toActions()方法结尾
        .toActions(),
]);

// 将流程添加到故事中
story.action([
    scene1,
]);
```

**需要注意的是，场景和故事的action方法只应该调用一次**  
而在脚本之外调用元素的方法而不调用toActions()方法会导致元素的行为不可预测  
这是因为为了跟踪元素调用的顺序，场景的action方法接收的是所有元素toActions返回的操作列表



### 1.1 场景(Scene)

场景不同于 Ren'Py 中的场景(Scene)，而是类似于 Ren'Py 中的标签(Label)，用于控制游戏流程  
场景本身也可以控制背景、背景音乐等场景应该有的行为  
这意味着，我们可以使用多个具有相同参数的场景来表演同一背景下不同故事的情节

### 1.2 声音(Sound)

声音则控制着几乎所有的声音，例如背景音乐，音乐，音效和配音  
而不同类型的声音的行为则由不同的元素控制  
背景音乐由场景控制，音乐和音效全局控制，配音则由角色控制

### 1.3 变换(Transform)和过渡(Transition)

变换用于为图片创建动画，理论支持几乎所有[Framer Motion](https://www.framer.com/motion/)支持的动画效果  
这包括了大多数的CSS属性，例如`transform`、`opacity`、`scale`等，
不过这意味着NarraLeaf无法在无渲染库的情况下支持更复杂的效果

过渡用于控制图片之间的切换效果，例如淡入淡出等  
通常来讲，用户可以使用接口[ITransition](../renderer/lib/game/game/elements/transition/type.ts)来自定义过渡效果  
不过，NarraLeaf也提供了一些内置的过渡效果，例如`fade`、`dissolve`等

例如，为图片
- 应用过渡：切换角色形态（图片）时，使用淡入淡出效果  
- 应用变换：应用图片动画，例如位移和抖动

为场景
- 应用过渡：切换场景时，使用淡入淡出效果  
- 应用变换：特殊背景效果，例如抖动背景图片


### 1.4 脚本(Script)

脚本用于控制游戏的逻辑，例如判断条件、控制流程等  
在NarraLeaf Core中，脚本可以是TypeScript代码  
需要注意的是，脚本本身不应该与当前NodeJS环境交互，不应该有副作用  
如果脚本有副作用，需要提供一个清理函数用于清理副作用  
在某些情况下，游戏剧本的初始化会运行多次，因此需要注意脚本的副作用，并且脚本本身不能和上一级环境的变量交互  

例如，脚本不得和当前TypeScript文件中定义的变量交互，而应该使用Storable储存变量

这是一个简单的例子，让用户从三个数字中选择一个数字，正确数字每次不一样

```typescript
new Script(({gameState}) => {
    // 由于游戏脚本创建必须没有副作用，所以这里不能直接修改游戏状态
    // 使用Script来更新状态，使用Storable来管理状态

    // 从当前游戏状态中获取储存空间
    const namespace =
        gameState
            .getStorable()
            .getNamespace("game")

    // 选择一个数字
    const availableNumbers = [3, 6, 8];
    const number = availableNumbers[Math.floor(Math.random() * availableNumbers.length)];

    // 将数字存储到储存空间中
    // 在之后的脚本中通过读取这个数字来判断玩家是否猜对
    // 通常不建议直接在脚本文件中创建变量，因为这会导致脚本行为不可预测
    namespace.set("answer", number);
}).toActions()
```

然后，通过Lambda等方式来检测数字

```typescript
new Condition()
    .If(({gameState}) => {
            const namespace =
                gameState
                    .getStorable()
                    .getNamespace("game")

            // 通过读取储存空间中的数字来判断玩家是否猜对
            return namespace.get("answer") === n;
        },
        
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
        shake(image1), // 可以通过自定义函数来创建复合动画

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

这些规定都是虚拟的，仅用作初版规范，可能会在未来版本中更改


### 2.0 一览

nleaf脚本参考了javascript中语法糖的写法

```
<element> [name][construct call] { [...statements] }
```

这是nleaf基础定义语法，该语法实际上是返回一个对象，name和construct call是可选的  
当name不为空，则该对象会被分配到当前作用域中

例如，定义一个匿名场景，并且分配给变量

```nleaf
define scene1 = scene {}
```

或者给定一个名字

```nleaf
scene scene1 {}
```

或者加入初始化参数

```nleaf
scene scene1({
    background: i1_3_2_background,
    images: {
        BG_hospital_2: "@/public/static/game/images/background/BG_hospital_2.jpg"
    }
}) {
    // do something
}
```

这个语法有些像是JavaScript的类定义，而该语法只是Scene构造函数的语法糖

对于其他元素，例如Character、Image、Sound等，也有类似的语法糖

```nleaf
character char1 {}
```

对于一些特殊元素，例如Transition和Transform，也有类似的语法糖
    
```nleaf
transform fade({
    sync: false
}) {
    {
        opacity: 0,
        duration: 2000
    },
    {
        opacity: 1,
        duration: 2000
    }
}
```

而应用变换则通过语句来执行

```nleaf
scene scene1 {
    show yanye1 with fade
}
```

通用来讲，流程化（Constructable）的元素（例如Scene和Story）在大括号中包含的是流程  
其他可执行（Actionable）的元素，例如Character，在大括号中包含的是配置  
而Transform和Transition则是特殊的元素，（Animation），它们在大括号中包含的是动画帧

### 2.1 文件名

NarraLeaf脚本文件（NarraLeaf Script）的文件名应该以`.nleaf`结尾

### 2.2 缩进

在缩进方面，解析器参考了JavaScript，没有缩进要求，不以缩进来判断代码块

### 2.3 基础语法

在基础语法方面，nleaf参考了JavaScript和Java的语法，使用`作用域`、`表达式`、`语句`等概念
以及一元运算符(语法糖)和多元运算符

例如，`{}`表示作用域，`()`表示表达式，`;`表示语句

### 2.4 注释

nleaf支持单行注释和多行注释

单行注释使用`//`，多行注释使用`/* */`

```javascript
// 这是一个单行注释

/*
这是一个多行注释
*/
```

### 2.5 定义

nleaf在定义变量时，使用`define`关键字，并且在define之前可以使用修饰符

例如，定义一个角色

```nleaf
const define character1 = new Character("角色1");
```

没有修饰符意味着这个变量是可变的

一个拟定的修饰符列表如下：

- `const`：表示这个变量是不可变的

### 2.6 赋值

nleaf在赋值时，使用`=`来赋值

例如，给一个变量赋值

```nleaf
character1 = new Character("角色1");
character1 = new Character("角色2"); // 这是合法的
```

对于不可变变量，不应该尝试赋值

### 2.7 表达式

nleaf支持多种表达式，例如算术表达式、逻辑表达式、关系表达式等

例如，一个简单的算术表达式

```nleaf
const define a = 1 + 2;
```

### 2.8 控制流

nleaf支持多种控制流，例如if语句、for语句、while语句等

例如，一个简单的if语句

```nleaf
if (a > 0) {
    // do something
} else {
    // do something
}
```


