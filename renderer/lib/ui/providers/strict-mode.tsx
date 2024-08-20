"use client";

import {createContext, StrictMode, useContext, useState} from "react";

const StateContext = createContext<null | {
    strict: boolean;
    setStrict: (strict: boolean) => void;
}>(null);

export function StrictProvider({children}: {
    children: React.ReactNode
}) {
    const [strict, setStrict] = useState(true);
    const strictMode = useStrict();

    return (
        <StateContext.Provider value={{strict, setStrict}}>
            {strictMode ? (<StrictMode>{children}</StrictMode>) : children}
        </StateContext.Provider>
    );
}

export function useStrict() {
    return useContext(StateContext)?.strict;
}

export function RejectStrictMode() {
    return useContext(StateContext)?.setStrict(false);
}

