import { existsSync } from "fs";
import { mkdir } from "fs/promises";
import { rm } from "node:fs/promises";
import path from "path";
import pino from "pino";

export async function getLoggerAndSetupDebug(
  debug: boolean,
  debugPath: string
): Promise<pino.Logger<never> | undefined> {
  if (debug) {
    if (existsSync(debugPath)) {
      await rm(debugPath, { recursive: true });
    }
    await mkdir(debugPath);
    const transport = pino.transport({
      targets: [
        {
          target: "pino/file",
          options: { destination: path.join(debugPath, "log.ndjson") },
        },
        ...(debug
          ? [
              {
                target: "pino/file",
              },
            ]
          : []),
      ],
    });
    return pino(transport);
  }
  return undefined;
}
