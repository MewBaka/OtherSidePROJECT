"use client";

import {createContext, useContext, useState} from "react";

type ThemeContextType = {
    theme: string;
    setTheme: (theme: string) => void;
};

const DefaultTheme = 'light';
const ThemeContext = createContext<null | ThemeContextType>(null);

export function ThemeProvider({children}: {
    children: React.ReactNode
}) {
    const [theme, setTheme] = useState(DefaultTheme);

    return (
        <>
            <ThemeContext.Provider value={{theme, setTheme}}>
                {children}
            </ThemeContext.Provider>
        </>
    );
}

export function useTheme(): ThemeContextType {
    return useContext(ThemeContext) as ThemeContextType;
}

