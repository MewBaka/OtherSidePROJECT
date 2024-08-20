
const alive: {
    [key: string]: any;
} = {};
export function setAlive<T>(key: string, value: T) {
    alive[key] = value;
}
export function getAlive<T>(key: string): T | undefined {
    return alive[key];
}
