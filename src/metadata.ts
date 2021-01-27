import { readFile, writeFile } from "fs";
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
        logger("readMetadata file:%s", file);
        readFile(file, { encoding: "utf8" }, (err: Error, data: Buffer) => {
            logger("readMetadata err:%O", err)
            logger("readMetadata data:%O", data);
            if (err) {
                reject(err);
            } else {
                try {
                    const parsed = JSON.parse(String(data));
                    logger("readMetadata parsed:%O", parsed);
                    resolve(parsed);
                } catch (e) {
                    logger("readMetadata not JSON:%O", e);
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
        logger("saveMetadata", file, lockTime);
        const metadata: LockMetadata = {
            pID: process.pid,
            lockTime
        };
        logger("saveMetadata", metadata);
        writeFile(
            file,
            JSON.stringify(metadata),
            { encoding: "utf8" },
            (err: Error): void => {
                logger("saveMetadata", "done", err);
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            }
        )
    });
};