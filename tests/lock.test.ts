jest.mock("fs");
jest.mock("../src/metadata.ts");

import { existsSync } from "fs";
import { lock } from "../src/lock";
import { readMetadata, saveMetadata } from "../src/metadata";

describe("Lock", () => {
  const FILE = "test.txt";
  const LOCK_FILE = `${FILE}.lock`;

  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("should handle missing file", async () => {
    (existsSync as unknown as jest.Mock).mockReturnValue(false);

    await expect(lock(FILE)).rejects.toThrow(
      "The given file (test.txt) does not exist!",
    );
  });

  test("should handle if lock could not happen in given time (wait timeout)", async () => {
    (existsSync as unknown as jest.Mock).mockReturnValue(true);

    await expect(
      lock(FILE, {
        waitTimeout: 0,
      }),
    ).rejects.toThrow(
      "Couldn't lock file (test.txt) in the given timeout (0 ms)!",
    );
  });

  test("should lock if no lock file exists (file is not locked)", async () => {
    (existsSync as unknown as jest.Mock).mockImplementation(
      (file) => file === FILE,
    );
    (saveMetadata as unknown as jest.Mock).mockResolvedValue(null);

    await expect(lock(FILE)).resolves.toBeInstanceOf(Function);
    expect(saveMetadata).toHaveBeenCalledWith(LOCK_FILE, expect.any(Number));
  });

  test("should lock if the same process has already locked it", async () => {
    (existsSync as unknown as jest.Mock).mockReturnValue(true);
    (saveMetadata as unknown as jest.Mock).mockResolvedValue(null);
    (readMetadata as unknown as jest.Mock).mockResolvedValue({
      pID: process.pid,
    });

    await expect(lock(FILE)).resolves.toBeInstanceOf(Function);
    expect(saveMetadata).toHaveBeenCalled();
  });

  test("should lock in case of foreign lock, if lock is timed out", async () => {
    (existsSync as unknown as jest.Mock).mockReturnValue(true);
    (saveMetadata as unknown as jest.Mock).mockResolvedValue(null);
    (readMetadata as unknown as jest.Mock).mockResolvedValue({
      pID: -1,
      lockTime: 0,
    });

    await expect(lock(FILE)).resolves.toBeInstanceOf(Function);
    expect(saveMetadata).toHaveBeenCalled();
  });

  test("should try again if error happens during reading metadata", async () => {
    (existsSync as unknown as jest.Mock).mockReturnValue(true);
    (saveMetadata as unknown as jest.Mock).mockResolvedValue(null);
    (readMetadata as unknown as jest.Mock)
      .mockRejectedValueOnce(null)
      .mockRejectedValueOnce(null)
      .mockResolvedValue(null);

    await expect(lock(FILE)).resolves.toBeInstanceOf(Function);
    expect(saveMetadata).toHaveBeenCalled();
    expect(readMetadata).toHaveBeenCalledTimes(3);
  });

  test("should try again if error happens during saving metadata", async () => {
    (existsSync as unknown as jest.Mock).mockReturnValue(true);
    (saveMetadata as unknown as jest.Mock)
      .mockRejectedValueOnce(null)
      .mockResolvedValueOnce(null);
    (readMetadata as unknown as jest.Mock).mockResolvedValue(null);

    await expect(lock(FILE)).resolves.toBeInstanceOf(Function);
    expect(saveMetadata).toHaveBeenCalledTimes(2);
  });

  test("should try again if foreign lock is still valid", async () => {
    (existsSync as unknown as jest.Mock).mockReturnValue(true);
    (saveMetadata as unknown as jest.Mock).mockResolvedValue(null);
    (readMetadata as unknown as jest.Mock)
      .mockResolvedValueOnce({
        pID: -1,
        lockTime: 0,
      })
      .mockResolvedValue(null);

    await expect(lock(FILE, { lockTimeout: Infinity })).resolves.toBeInstanceOf(
      Function,
    );
    expect(saveMetadata).toHaveBeenCalled();
    expect(readMetadata).toHaveBeenCalledTimes(2);
  });
});
