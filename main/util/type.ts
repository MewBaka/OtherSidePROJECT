
export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Prefix<T, P extends string> = {
    [K in keyof T as K extends `${P}:${string}` ? K : never]: T[K];
};

export type Complementary<T, U> = Omit<T, keyof U> & U;
