import { existsSync, unlinkSync } from "fs";
import { logger } from "./logger";
import { LockMetadata, readMetadata } from "./metadata";

export type UnlockFunction = (file?: string) => Promise<void>;

export const unlock: UnlockFunction = async (file: string): Promise<void> => {
    logger("unlock file:%s", file);

    const lockFile: string = `${file}.lock`;

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
};