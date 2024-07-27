# 侧面Project 开发规范

为了方便您更好地理解我们的代码并做出贡献，故编写出此开发规范

## 模块化

为了防止后期维护麻烦，我们将剧情分散到了各个Label里，而不是全部放到`start`之下

举个例子，我们写一段并不正常的剧情，再把他们变成Script

```
区域：A1 角色：测试角色（Debug）测试角色二号（Debug2）
测试角色：我来到了这里
测试角色二：欢迎你来到这里，我们一起去下一个区域吧
[跳转区域 A2]

区域：A2 角色：测试角色（Debug）
测试角色：这里勾起了我的一些回忆...
	- 听听 > 测试角色：我逗你玩的
	- 算了 > 测试角色：好，那我不说了
测试角色：走吧
[跳转End]

区域：A2 角色：测试角色（Debug）
测试角色：好了，就这样
```

把它们转换成Script，就像这样：

```python
define Debug = Character('测试角色')
define Debug02 = Character('测试角色二号')

default A2_Debug_Memory_isOK = False

# 开始
label start:
    # 这个部分只放置铺垫内容
    jump A1 # 跳转到A1部分剧情
  
# 区域剧情
label A1:
    Debug "我来到了这里"
    Debug02 "欢迎你来到这里，我们一起去下一个区域吧"
    jump A2 # 跳转到A2部分剧情

label A2:
    if not A2_Debug_Memory_isOK: # 判断剧情是否已完成
        Debug "这里勾起了我的一些回忆..."
        menu:
            "听听":
                jump A2_Debug_Memory
            "算了":
                Debug "好，那我不说了"
    Debug "走吧"
    jump GameEnd

# 独有剧情
label A2_Debug_Memory:
    Debug "我逗你玩的"
    $ A2_Debug_Memory_isOK = True # 设定剧情已完成，返回后继续做下面的剧情
    jump A2 # 返回
 
# 结束
label GameEnd:
    Debug "好了，就这样"
```

在这里，我们分开讲一下

1. Line 4 定义独有剧情完成变量

   防止后面提示未定义变量

2. Line 18 判断独有剧情是否完成

   为什么需要判断独有剧情是否完成，因为Ren'Py有个也不算太逆天的特性，就是中途离开这个Label之后，下一次还会从头再来，因此，为了做到从断点继续，我们就要放置一个判断。这样，在玩家通过独有剧情后，无需从头开始，而是继续推

   命名规则：在独有剧情命名规则后加`_isOK`，如`A2_Debug_Memory_isOK`

3. Line20

   为什么要把`Debug "这里勾起了我的一些回忆..."`写入**Menu**标签之内？我们是想模仿其他游戏，在弹出选择的同时显示文字，就像这样：

   ![](https://s3.bmp.ovh/imgs/2024/07/27/46bb4dd4c1cca5d4.png)

   更美观，不是吗？

4. Line 22 独有剧情命名规则

   在这里，命名是 `A2_Debug_Memory`，命名规则为：`<区域名（label）>_<人物名>_<类型（例如叙述记忆，则为Memory，首字母大写）>`

5. Line 31 设置剧情完成状态

   `$ xxx_isOK = True`

备注：

1. 选择（menu）均在一个label内进行，menu完成后无需添加`jump`
2. 多线路对话时在同一个label进行，使用`if`判断该说什么，后期剧情出入大的部分使用独立label

## 分支

为了后期维护方便，本仓库采用多分支

`beta` 测试版分支

`dev_xxx` xxx负责开发的分支

`doc` 文档专用分支

`script` 脚本专用分支

其中，**doc**分支仅允许修改文档文件，**script**分支仅允许修改`/game/script.rpy`文件。若需修改其他程序类文件，请单独打开一个分支，命名为：**dev_你的名字**。若发现提交的Pull Requests中修改了不应修改的内容（如在script分支修改程序），则此Pull Requests不予通过

请推送到**beta**分支，推送到**main**分支的Pull Requests不予通过

### 合并周期

在您提交Pull Requests且通过审核后，团队内会根据目前的工作进度确定是否将其合并到**beta**分支，一般不超过七天

部分功能实现后，**beta**分支将会向**main**分支合并，完成正式版发布

**doc**分支以及**script**分支不定期合并到**beta**分支
