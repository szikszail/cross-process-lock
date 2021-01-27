jest.unmock("fs");
jest.unmock("../src/metadata.ts");

import { join } from "path";
import { unlinkSync, writeFileSync, existsSync, mkdtempSync, rmSync } from "fs";
import { lock, unlock } from "../src";

describe("Integration", () => {
    const TMP_DIR = mkdtempSync("tmp-");
    const FILE = join(TMP_DIR, "test.txt");
    const LOCK_FILE = `${FILE}.lock`;

    beforeAll(() => {
        writeFileSync(FILE, "test", "utf8");
    });

    afterAll(() => {
        rmSync(TMP_DIR, { recursive: true })
    })

    beforeEach(() => {
        if (existsSync(LOCK_FILE)) {
            unlinkSync(LOCK_FILE);
        }
    });

    test("should work for single thread file (with returned unlock)", async () => {
        const ul = await lock(FILE);

        // doing something important

        await ul();

        expect(existsSync(LOCK_FILE)).toBe(false);
    });

    test("should work for single thread file (with independent unlock)", async () => {
        await lock(FILE);

        // doing something important

        await unlock(FILE);

        expect(existsSync(LOCK_FILE)).toBe(false);
    });
});