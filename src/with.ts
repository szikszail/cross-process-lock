import { lock, LockOptions } from "./lock";

export type LockCallback<T> = () => Promise<T>;

/**
 * Executes the callback with locking the given file before,
 * and releasing it after the callback is executed.
 * 
 * Generally, the callback/operation should target the file locked.
 * 
 * @param file The path of the file to lock.
 * @param callback The function to execute while the file is locked.
 */
export function withLock<T>(file: string, callback: LockCallback<T>): Promise<T>;
/**
 * Executes the callback with locking the given file before,
 * and releasing it after the callback is executed.
 * 
 * Generally, the callback/operation should target the file locked.
 * 
 * @param file The path of the file to lock.
 * @param options The lock options/timeout.
 * @param callback The function to execute while the file is locked.
 */
export function withLock<T>(file: string, options: LockOptions, callback: LockCallback<T>): Promise<T>;
export async function withLock<T>(file: string, options: LockOptions | LockCallback<T>, callback?: LockCallback<T>): Promise<T> {
    if (typeof options === "function") {
        callback = options;
        options = {};
    }
    if (typeof callback !== "function") {
        throw new TypeError("Callback function must be set!");
    }
    const unlock = await lock(file, options);
    try {
        return callback();
    } finally {
        await unlock();
    }
}