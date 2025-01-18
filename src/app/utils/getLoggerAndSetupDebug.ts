import path from "path";
import pino from "pino";

export async function getLoggerAndSetupDebug(
  debugToConsole: boolean,
  debugPath: string
): Promise<pino.Logger<never> | undefined> {
  const transport = pino.transport({
    targets: [
      {
        target: "pino/file",
        options: { destination: path.join(debugPath, "log.ndjson") },
      },
      ...(debugToConsole
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
