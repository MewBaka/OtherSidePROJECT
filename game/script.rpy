# 游戏的脚本可置于此文件中。

# 声明此游戏使用的角色。颜色参数可使角色姓名着色。

define e = Character("艾琳")

init python:
    import datetime

# 游戏在此开始。

label load_saved_game(newest_slot):
    $ renpy.load(newest_slot)
    return

label pre_start():
    $ saved_games = list(filter(lambda game: not (game[0].startswith("auto-") or game[0].startswith("_reload")), renpy.list_saved_games()))

    if (len(saved_games) > 0):
        $ newest_slot = max(saved_games, key=lambda x: x[3])
        $ newest_time = datetime.datetime.fromtimestamp(newest_slot[3]).strftime('%Y-%m-%d %H:%M:%S')
        $ renpy.notify("最近的存档时间为：" + newest_time)
        $ renpy.call_screen("confirm", "你已有一个存档，是否使用该存档？最新存档时间：" + newest_time, yes_action=lambda: renpy.call("load_saved_game", newest_slot=newest_slot[0]), no_action=lambda: Return())

    return


label start:
    $ renpy.call("pre_start")

    $ renpy.notify("konnichiwa, sensei!")

    # 显示一个背景。此处默认显示占位图，但您也可以在图片目录添加一个文件
    # （命名为 bg room.png 或 bg room.jpg）来显示。

    scene bg room

    # 显示角色立绘。此处使用了占位图，但您也可以在图片目录添加命名为
    # eileen happy.png 的文件来将其替换掉。

    show eileen happy

    # 此处显示各行对话。

    e "您已创建一个新的 Ren'Py 游戏。"

    e "当您完善了故事、图片和音乐之后，您就可以向全世界发布了！"

    # 此处为游戏结尾。

    return
