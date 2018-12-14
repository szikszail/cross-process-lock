import { existsSync, unlinkSync } from "fs-extra";
import { logger } from "./logger";
import { LockMetadata, readMetadata } from "./metadata";

export type UnlockFunction = (file?: string) => Promise<void>;

export const unlock: UnlockFunction = async (file: string): Promise<void> => {
    logger.debug("unlock", file);

    const lockFile: string = `${file}.lock`;

    if (!existsSync(lockFile)) {
        logger.debug("unlock", "lock file does not exist");
        return;
    }

    const metadata: LockMetadata = await readMetadata(lockFile);
    if (!metadata || metadata.pID === process.pid) {
        try {
            unlinkSync(lockFile);
        } catch (e) {
            logger.debug("unlock", "error during deleting lock file", e);
        }
    }
};