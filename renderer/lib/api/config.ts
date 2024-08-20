import Logo from "@/public/static/images/mewbaka.png";


const Constants = {
    routes: {
        HOME: "/",
        MAIN_MENU: "/main-menu",
        ABOUT: "/about",
        GALLERY: "/gallery",
        SAVE: "/save",
        SETTINGS: "/settings",
        PLAYER: "/game/player",
    },
    src: {
        images: {
            LOGO: Logo,
        }
    },
    info: {
        app: {
            name: "OtherSideProject",
            version: "0.1.2"
        }
    },
    style: {
        zIndex: {
            QUICK_MENU: 100,
            STAGE: 0,
        }
    },
    app: {
        store: {
            saveFileSuffix: "save",
            settingFileSuffix: "setting",
        },
        request: {
            maxAlive: 36000,
            cacheableRoute: "/api/cacheable",
            cacheableRouteParam: "request_url"
        }
    }
};

export {
    Constants,
}

