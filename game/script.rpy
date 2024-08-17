$ script_version = v1

define e = Character("Sensei?",who_color="#ffffff")

label start:

    $ renpy.notify("头抬起,您是最新的")

    scene bg room

    show debug at top

    e "海内存知己,天涯若比邻"

    e "我们™正在为您升级到Ren'Py11版本"

    menu :
        e "回滚吗"
        "不回滚":
            e "太棒了,感谢您使用Ren'Py11"
        "不滚":
            e "太棒了,感谢您使用Ren'Py11"

    return
