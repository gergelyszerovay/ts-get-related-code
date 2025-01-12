import meow from "meow";
import { existsSync } from "node:fs";
import { mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { getRelatedCodeHandler } from "./messageHandlers/getRelatedCodeHandler";
import { ServerState } from "./ServerState";
import { getLoggerAndSetupDebug } from "./utils/getLoggerAndSetupDebug";

export async function asyncMain() {
  const usage = `
Examples
  $ cli --projectDir=./ --debug=true
`;

  const cli = meow(usage, {
    importMeta: import.meta, // This is required
    flags: {
      // server
      projectDir: {
        type: "string",
        isRequired: true,
      },
      debug: {
        type: "boolean",
        default: true,
      },
      declarationName: {
        type: "string",
        isRequired: true,
      },
    },
  });

  const { debug, projectDir, declarationName } = cli.flags;

  const projectPath = path.resolve(projectDir);

  if (!existsSync(projectPath)) {
    // TODO
    console.error("invalid projectPath");
  }

  const debugPath = path.join(projectPath, "debug");
  const logger = await getLoggerAndSetupDebug(debug, debugPath);

  if (debug) {
    if (existsSync(debugPath)) {
      await rm(debugPath, { recursive: true });
    }
    await mkdir(debugPath);
  }

  const serverState: ServerState = {
    logger,
    projectPath,
    debugPath,
    cliParamas: cli.flags,
  };

  logger?.info({ ...serverState, logger: "REMOVED" }, "serverState");

  getRelatedCodeHandler({
    _event: "getRelatedCode",
    _serverState: serverState,
    declarationName,
  });
}
