import { existsSync, unlinkSync } from "fs";
import { logger } from "./logger";
import { LockMetadata, readMetadata } from "./metadata";

/**
 * Releases the cross-process lock for the given file, for the actual process.
 * 
 * @param file The path of the file to lock.
 * @returns 
 */
export async function unlock(file: string): Promise<void> {
    logger("unlock file:%s", file);

    const lockFile = `${file}.lock`;

    if (!existsSync(lockFile)) {
        logger("unlock lock file does not exist");
        return;
    }

    const metadata: LockMetadata = await readMetadata(lockFile);
    if (!metadata || metadata.pID === process.pid) {
        try {
            unlinkSync(lockFile);
        } catch (e) {
            logger("unlock error during deleting lock file:%s", e);
        }
    } else {
        logger("unlock foreign lock file");
    }
}