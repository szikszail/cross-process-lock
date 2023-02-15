jest.mock("../src/lock");

import { lock } from "../src/lock";
import { withLock } from "../src/with";

describe("withLock", () => {
  const FILE = "test.txt";
  let unlock: jest.Mock;
  let callback: jest.Mock;

  beforeEach(() => {
    jest.resetAllMocks();
    unlock = jest.fn();
    callback = jest.fn();
    (lock as unknown as jest.Mock).mockResolvedValue(unlock);
  });

  test("should handle missing callback", async () => {
    // @ts-ignore
    await expect(withLock(FILE)).rejects.toThrow("Callback function must be set!");
  });

  test("should handle lock error", async () => {
    (lock as unknown as jest.Mock).mockRejectedValue(new Error("LOCK ERROR"));
    await expect(withLock(FILE, callback)).rejects.toThrow("LOCK ERROR");
    expect(callback).not.toHaveBeenCalled();
  });

  test("should lock and unlock", async () => {
    await withLock(FILE, callback);
    expect(lock).toHaveBeenCalledWith(FILE, expect.anything());
    expect(callback).toHaveBeenCalled();
    expect(unlock).toHaveBeenCalled();
  });

  test("should handle missing options", async () => {
    await withLock(FILE, callback);
    expect(lock).toHaveBeenCalledWith(FILE, {});
  });

  test("should handle explicit options", async () => {
    await withLock(FILE, {
      lockTimeout: 1,
      waitTimeout: 2,
    }, callback);
    expect(lock).toHaveBeenCalledWith(FILE, {
      lockTimeout: 1,
      waitTimeout: 2,
    });
  });

  test("should pass callback return value", async () => {
    callback.mockResolvedValue(42);
    await expect(withLock(FILE, callback)).resolves.toEqual(42);
  });

  test("should re-raise callback error", async () => {
    callback.mockRejectedValue(new Error("CALLBACK ERROR"));
    await expect(withLock(FILE, callback)).rejects.toThrow("CALLBACK ERROR");
    expect(unlock).toHaveBeenCalled();
  });
});