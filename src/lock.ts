import { logger } from "./logger";
import { unlock } from "./unlock";
import { existsSync } from "fs";
import { readMetadata, saveMetadata, LockMetadata } from "./metadata";

export interface LockOptions {
    lockTimeout?: number;
    waitTimeout?: number;
}

const DEFAULT_OPTIONS: LockOptions = {
    lockTimeout: 12e5,
    waitTimeout: 1e4,
};
const INTERVAL = 500;

export class LockError extends Error {
}


export type UnlockFunction = (file?: string) => Promise<void>;

/**
 * Creates a cross-process lock for the given file, for the actual process.
 * 
 * Note, that it will be only a soft-lock, the file will be locked for other
 * instances of cross-process-lock, or processes using the same API for locking.
 * 
 * @param file The path of the file to lock.
 * @param options The lock options/timeout.
 * @returns The function to unlock the file.
 */
export async function lock(file: string, options: LockOptions = {}): Promise<UnlockFunction> {
    options = {
        ...DEFAULT_OPTIONS,
        ...options,
    };

    logger("lock file:%s", file)
    logger("lock options:%o", options);

    if (!existsSync(file)) {
        logger("lock file does not exist");
        throw new Error(`The given file (${file}) does not exist!`);
    }

    const lockTime = Date.now();
    const lockFile = `${file}.lock`;

    const tryToLock = (): Promise<UnlockFunction> => new Promise((resolve, reject) => {
        const now = Date.now();
        logger("lock now:%d", now);

        if (now - lockTime >= options.waitTimeout) {
            logger("lock too many tries");
            return reject(new LockError(`Couldn't lock file (${file}) in the given timeout (${options.waitTimeout} ms)!`));
        }

        const done = () => resolve(unlock.bind(null, file));

        const next = () => {
            logger("lock schedule");
            setTimeout(() => {
                logger("lock schedule called");
                tryToLock().then(done, reject);
            }, INTERVAL);
        };

        let def: Promise<LockMetadata> = Promise.resolve(null);
        if (existsSync(lockFile)) {
            logger("lock read metadata");
            def = readMetadata(lockFile);
        }
        def.then((metadata: LockMetadata): void => {
            const actual: number = Date.now();
            const lockedTime: number = metadata ? actual - metadata.lockTime : -1;
            logger("lock metadata:%o", metadata);
            logger("lock actual:%d lockedTime:%d", actual, lockedTime );
            if (!metadata || metadata.pID === process.pid || lockedTime > options.lockTimeout) {
                logger("lock locking")
                saveMetadata(lockFile, lockTime).then(done, next);
            } else {
                logger("lock next iteration");
                next();
            }
        }, next);
    });

    return tryToLock();
}