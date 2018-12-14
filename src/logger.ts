import { getLogger, Logger } from "log4js";

export const logger: Logger = getLogger(`cross-process-lock#${process.pid}`);