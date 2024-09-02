import type {Status} from "../../../../../main/util/status";
import {PreloadedWindow} from "@lib/api/ipc";

export type StoreResponse<A, B = Error> = Status<A, B>;
export interface ISavedGameProvider {
    isAvailable(): Promise<StoreResponse<boolean>>;
    save(name: string, data: Record<string, any>): Promise<StoreResponse<void>>;
    load<T = Record<string, any>>(name: string): Promise<StoreResponse<T>>;
    list(): Promise<StoreResponse<string[]>>;
}
export interface ISettingsProvider {
    isAvailable(): Promise<StoreResponse<boolean>>;
    get<T>(namespace: string): Promise<StoreResponse<T>>;
    set<T>(namespace: string, value: T): Promise<StoreResponse<void>>;
}

export class LocalFsSavedGameClient implements ISavedGameProvider {
    static fileExt = "msgpack";

    constructor(protected window: PreloadedWindow) {
    }

    async isAvailable(): Promise<StoreResponse<boolean>> {
        return {status: true, data: !!this.window?.api?.game?.localFs?.saved};
    }

    public async save(id: string, data: Record<string, any>) {
        return await this.window.api.game.localFs.saved.write(id, data);
    }

    async load<T = Record<string, any>>(id: string): Promise<Status<T, Error>> {
        return await this.window.api.game.localFs.saved.read(id) as Status<T, Error>;
    }

    async list() {
        return await this.window.api.game.localFs.saved.list();
    }
}

export class LocalFsSettingsClient implements ISettingsProvider {
    constructor(protected window: PreloadedWindow) {
    }

    async isAvailable(): Promise<StoreResponse<boolean>> {
        return {status: true, data: !!this.window?.api?.game?.localFs?.settings};
    }

    async get<T>(namespace: string): Promise<StoreResponse<T>> {
        return await this.window.api.game.localFs.settings.get(namespace);
    }

    async set<T>(namespace: string, value: T): Promise<StoreResponse<void>> {
        return await this.window.api.game.localFs.settings.set(namespace, value);
    }
}
