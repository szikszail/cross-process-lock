import { readFile, writeFile } from "fs-extra";
import { logger } from "./logger";

export interface LockMetadata {
    pID: number;
    lockTime: number;
}

/**
 * Reads metadata from the given file
 * @param {string} file - path to file to read metadata from
 * @returns {Promise}
 */
export const readMetadata = (file: string): Promise<LockMetadata> => {
    return new Promise<LockMetadata>((resolve, reject): void => {
        logger.debug('readMetadata', file);
        readFile(file, { encoding: 'utf8' }, (err: Error, data: Buffer) => {
            logger.debug('readMetadata', err, data);
            /* istanbul ignore if */
            if (err) {
                reject(err);
            } else {
                try {
                    resolve(JSON.parse(String(data)));
                } catch (e) {
                    logger.debug('readMetadata', 'not JSON');
                    resolve(null);
                }
            }
        });
    });
};

/**
 * Saves metadata to the given file
 * @param {string} file - path to file to write metadata to
 * @param {number} lockTime - timestamp when lock should be registered
 * @returns {Promise}
 */
export const saveMetadata = (file: string, lockTime: number): Promise<void> => {
    return new Promise((resolve, reject) => {
        logger.debug('saveMetadata', file, lockTime);
        const metadata: LockMetadata = {
            pID: process.pid,
            lockTime
        };
        logger.debug('saveMetadata', metadata);
        writeFile(
            file,
            JSON.stringify(metadata),
            { encoding: 'utf8' },
            (err: Error): void => {
                logger.debug('saveMetadata', 'done', err);
                /* istanbul ignore if */
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            }
        )
    });
};