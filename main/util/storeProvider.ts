import * as msgpack from "msgpack-lite";
import path from "node:path";


type SafeFileSystem = typeof import("node:fs/promises");
export class FileStore {
    static fileExt = "msgpack";
    fs: SafeFileSystem;
    basePath: string;
    /**
     * for safety's sake, the fs module is not directly imported, but passed in as a parameter  
     * so only the caller who has the fs module can create an instance of this class
     */
    constructor(fs: SafeFileSystem, basePath: string) {
        this.fs = fs;
        this.basePath = basePath;
    }
    async save(_path: string, data: Record<string, any>): Promise<void> {
        const buffer = msgpack.encode(data);
        await this.fs.writeFile(path.resolve(this.basePath, _path), buffer);
    }
    async load<T = Record<string, any>>(_path: string): Promise<T> {
        const buffer = await this.fs.readFile(path.resolve(this.basePath, _path));
        return msgpack.decode(buffer);
    }
    async isFileExists(_path: string): Promise<boolean> {
        try {
            await this.fs.access(path.resolve(this.basePath, _path));
            return true;
        } catch (e) {
            return false;
        }
    }
    async createFolder(_path: string): Promise<void> {
        await this.fs.mkdir(path.resolve(this.basePath, _path), { recursive: true });
    }
    async getFileNames(_path: string): Promise<string[]> {
        return (await this.fs.readdir(path.resolve(this.basePath, _path))).filter((name) => name.endsWith(FileStore.fileExt));
    }
    getName(_path: string, suffix?: string) {
        return _path + "." + (suffix ? (suffix + ".") : "") + FileStore.fileExt;
    }
}

