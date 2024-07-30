$ script_version = v1

define e = Character("艾琳",who_color="#ffffff")

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
