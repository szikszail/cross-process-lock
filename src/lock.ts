import { logger } from "./logger";
import { unlock, UnlockFunction } from "./unlock";
import { existsSync } from "fs";
import { readMetadata, saveMetadata, LockMetadata } from "./metadata";

export interface LockOptions {
    lockTimeout?: number;
    waitTimeout?: number;
    debug?: boolean;
}

export type LockFunction = (file: string, options?: LockOptions) => Promise<UnlockFunction>;

const DEFAULT_OPTIONS: LockOptions = {
    waitTimeout: 12e5,
    lockTimeout: 1e4,
    debug: false,
};
const INTERVAL: number = 500;

const timeout = (ms: number): Promise<void> => new Promise((resolve): void => {
    setTimeout(resolve, ms);
});

export const lock: LockFunction = async (file: string, options: LockOptions = {}): Promise<UnlockFunction> => {
    options = {
        ...DEFAULT_OPTIONS,
        ...options,
    };
    if (options.debug) {
        logger.level = "debug";
    }

    logger.debug("lock", { file, options });

    if (!existsSync(file)) {
        logger.debug("lock", "file does not exist");
        throw new Error(`The given file (${file}) does not exist!`);
    }

    const lockTime: number = Date.now();
    const lockFile: string = `${file}.lock`;

    const tryToLock = (): Promise<UnlockFunction> => new Promise((resolve, reject) => {
        const now: number = Date.now();
        logger.debug("lock", { now });
        if (now - lockTime >= options.waitTimeout) {
            logger.debug("lock", "too many tries");
            reject(`Couldn't lock file ("${file}") in the given timeout (${options.waitTimeout} ms)`);
        } else {
            const done = () => resolve(unlock.bind(null, file));
            const schedule = () => {
                logger.debug('lock', 'schedule');
                setTimeout(() => {
                    logger.debug('lock', 'schedule', 'called');
                    tryToLock().then(done, reject);
                }, INTERVAL);
            };

            let def: Promise<LockMetadata> = Promise.resolve(null);
            if (existsSync(lockFile)) {
                logger.debug('lock', 'read metadata');
                def = readMetadata(lockFile);
            }
            def.then((metadata: LockMetadata): void => {
                const actual: number = Date.now();
                const lockedTime: number = metadata ? actual - metadata.lockTime : -1;
                logger.debug("lock", { metadata, actual, lockedTime });
                if (!metadata || metadata.pID === process.pid || lockedTime > options.lockTimeout) {
                    logger.debug('lock', 'lock file')
                    saveMetadata(lockFile, lockTime).then(done, schedule);
                } else {
                    logger.debug('lock', 'next iteration');
                    schedule();
                }
            }, schedule);
        }
    });

    return tryToLock();
};