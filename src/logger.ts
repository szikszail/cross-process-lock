import * as debug from "debug";
export const logger: debug.Debugger = debug(`cross-process-lock:${process.pid}`);