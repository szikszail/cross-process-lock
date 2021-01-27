jest.mock("fs");
jest.mock("../src/metadata.ts");

import { existsSync, unlinkSync } from "fs";
import { readMetadata } from "../src/metadata";
import { unlock } from "../src/unlock";

describe("Unlock", () => {
    const FILE = "test.txt";
    const LOCK_FILE = `${FILE}.lock`;

    beforeEach(() => {
        jest.resetAllMocks();
    });

    test("should handle if lock file is missing, i.e. file already unlocked", async () => {
        (existsSync as unknown as jest.Mock).mockReturnValue(false);

        await unlock(FILE);

        expect(existsSync).toHaveBeenCalledWith(LOCK_FILE);
        expect(unlinkSync).not.toHaveBeenCalled();
    });

    test("should delete lock file if it is corrupted", async () => {
        (existsSync as unknown as jest.Mock).mockReturnValue(true);
        (readMetadata as unknown as jest.Mock).mockResolvedValue(null);

        await unlock(FILE);

        expect(readMetadata).toHaveBeenCalledWith(LOCK_FILE);
        expect(unlinkSync).toHaveBeenCalledWith(LOCK_FILE);
    });

    test("should delete lock file if it is own", async () => {
        (existsSync as unknown as jest.Mock).mockReturnValue(true);
        (readMetadata as unknown as jest.Mock).mockResolvedValue({
            pID: process.pid,
        });

        await unlock(FILE);

        expect(unlinkSync).toHaveBeenCalledWith(LOCK_FILE);
    });

    test("should not delete foreign lock file", async () => {
        (existsSync as unknown as jest.Mock).mockReturnValue(true);
        (readMetadata as unknown as jest.Mock).mockResolvedValue({
            pID: -1,
        });

        await unlock(FILE);

        expect(unlinkSync).not.toHaveBeenCalled();
    });

    test("should handle if lock file cannot be deleted", async () => {
        (existsSync as unknown as jest.Mock).mockReturnValue(true);
        (unlinkSync as unknown as jest.Mock).mockImplementation(() => {
            throw new Error("unlinkSync Error");
        });
        (readMetadata as unknown as jest.Mock).mockResolvedValue(null);

        await expect(unlock(FILE)).resolves.toBeUndefined();
    });
});