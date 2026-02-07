jest.mock("fs");
jest.unmock("../src/metadata");

import { readFile, writeFile } from "fs";
import { readMetadata, saveMetadata } from "../src/metadata";

describe("metadata", () => {
  const FILE = "test.txt";

  describe("readMetadata", () => {
    test("should handle file error", async () => {
      (readFile as unknown as jest.Mock).mockImplementation((_1, _2, fn) => {
        fn(new Error("readFile Error"));
      });

      await expect(readMetadata(FILE)).rejects.toThrow("readFile Error");
      expect(readFile).toHaveBeenCalledWith(
        FILE,
        { encoding: "utf8" },
        expect.any(Function),
      );
    });

    test("should handle JSON error", async () => {
      (readFile as unknown as jest.Mock).mockImplementation((_1, _2, fn) => {
        fn(null, "notajson");
      });

      await expect(readMetadata(FILE)).resolves.toBeNull();
    });

    test("should parse LockMetadata", async () => {
      const data = { a: 1 };
      (readFile as unknown as jest.Mock).mockImplementation((_1, _2, fn) => {
        fn(null, JSON.stringify(data));
      });

      await expect(readMetadata(FILE)).resolves.toEqual(data);
    });
  });

  describe("saveMetadata", () => {
    const LOCK_TIME = 42;

    test("should handle file error", async () => {
      (writeFile as unknown as jest.Mock).mockImplementation(
        (_1, _2, _3, fn) => {
          fn(new Error("writeFile Error"));
        },
      );

      await expect(saveMetadata(FILE, LOCK_TIME)).rejects.toThrow(
        "writeFile Error",
      );

      const METADATA = JSON.stringify({
        pID: process.pid,
        lockTime: LOCK_TIME,
      });
      expect(writeFile).toHaveBeenCalledWith(
        FILE,
        METADATA,
        { encoding: "utf8" },
        expect.any(Function),
      );
    });

    test("should write metadata", async () => {
      (writeFile as unknown as jest.Mock).mockImplementation(
        (_1, _2, _3, fn) => {
          fn();
        },
      );

      await expect(saveMetadata(FILE, LOCK_TIME)).resolves.toBeUndefined();
    });
  });
});
