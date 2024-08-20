

export type Status<T = void, U = Error> = {
    status: true;
    data: T;
} | {
    status: false;
    data: U;
};

export function success<T extends void>(): Status<void>;
export function success<T>(data: T extends void ? void : T): Status<T>;
export function success<T>(data?: T): Status<T | void> {
    return { status: true, data };
}
export function failure<U>(data: U): {
    status: false;
    data: U;
} {
    return { status: false, data };
}

