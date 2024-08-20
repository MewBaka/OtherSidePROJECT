"use client";

import {Image as GameImage} from "@lib/game/game/elements/image";
import {GameState} from "@lib/ui/components/player/gameState";
import React, {useEffect} from "react";
import {SrcManager} from "@lib/game/game/elements/srcManager";
import {Utils} from "@lib/game/game/common/Utils";

export const Img = React.memo(function ({
                                            state,
                                            image
                                        }: Readonly<{
    state: GameState;
    image: GameImage;
}>) {
    const props: any = {
        ...image.toHTMLElementProps(),
        ref: image.getScope(),
        src: image.config.cache
            ? SrcManager.cacheablize(Utils.srcToString(image.state.src), window.location.origin)
            : image.state.src,
    };

    useEffect(() => {
        const initTransform = image.toTransform();
        Object.assign(image.getScope()?.current || {}, initTransform.propToCSS(state, image.state));
    }, []);

    return (
        <img {...props}/>
    );
})