define e = Character("艾琳",who_color="#ffffff")

# 存档逻辑判断,禁止修改
init python:
    import datetime
label load_saved_game(newest_slot):
    $ ShowMenu("load")

label pre_start():
    $ saved_games = list(filter(lambda game: not (game[0].startswith("auto-") or game[0].startswith("_reload")), renpy.list_saved_games()))
    if (len(saved_games) > 0):
        python:
            newest_slot = max(saved_games, key=lambda x: x[3])
            newest_time = datetime.datetime.fromtimestamp(newest_slot[3]).strftime('%Y-%m-%d %H:%M:%S')
            renpy.call_screen(
                "confirm", 
                "您先前保存过一个存档,是否前往存档页面?", 
                yes_action=ShowMenu("save"), 
                yes_title="读取存档",
                no_title="继续开始新游戏"
            )
    return

label start:
    # $ renpy.call("pre_start")

    $ renpy.notify("Game start")

    scene bg room

    show eileen happy

    e "您已创建一个新的 Ren'Py 游戏。"

    menu:
        "您想要做什么？"
        
        "什么也不干":
            "好的"

    e "当您完善了故事、图片和音乐之后，您就可以向全世界发布了！"

    return
