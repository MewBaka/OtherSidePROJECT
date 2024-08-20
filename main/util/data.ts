
/**
 * @param obj1 source object
 * @param obj2 this object will overwrite the source object
 * @example
 * deepMerge(defaultConfig, config);
 */
export function deepMerge<T = Record<string, any>>(obj1: Record<string, any>, obj2: Record<string, any>): T {
    const result: Record<string, any> = {};

    for (const key in obj1) {
        if (obj1.hasOwnProperty(key)) {
            if (typeof obj1[key] === 'object' && obj1[key] !== null && !Array.isArray(obj1[key]) && obj2.hasOwnProperty(key) && typeof obj2[key] === 'object' && obj2[key] !== null && !Array.isArray(obj2[key])) {
                result[key] = deepMerge(obj1[key], obj2[key]);
            } else {
                result[key] = obj1[key];
            }
        }
    }

    for (const key in obj2) {
        if (obj2.hasOwnProperty(key)) {
            result[key] = obj2[key];
        }
    }

    return result as T;
}


