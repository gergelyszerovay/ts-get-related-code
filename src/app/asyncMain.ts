import meow from "meow";
import { existsSync } from "node:fs";
import { mkdir, rm } from "node:fs/promises";
import path, { dirname } from "node:path";
import { getRelatedCodeHandler } from "./messageHandlers/getRelatedCodeHandler";
import { ServerState } from "./ServerState";
import { getLoggerAndSetupDebug } from "./utils/getLoggerAndSetupDebug";

export async function asyncMain() {
  const usage = `
Examples
  $ cli --projectTsConfig=../project/tsconfig.json --debug=true
`;

  const cli = meow(usage, {
    importMeta: import.meta, // This is required
    flags: {
      // server
      projectTsConfig: {
        type: "string",
        isRequired: true,
      },
      debug: {
        type: "boolean",
        default: true,
      },
      declarationNames: {
        type: "string",
        isRequired: true,
      },
      ignoreExternalDeclarations: {
        type: "boolean",
        default: true,
      },
      maxRecursionLevel: {
        type: "number",
        default: 0,
      },
    },
  });

  const { debug, projectTsConfig, declarationNames } = cli.flags;

  const projectPath = path.resolve(dirname(projectTsConfig));

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
    cliParamas: {
      ...cli.flags,
      declarationNames: declarationNames.split(","),
    },
  };

  logger?.info({ ...serverState, logger: "REMOVED" }, "serverState");

  getRelatedCodeHandler({
    _event: "getRelatedCode",
    _serverState: serverState,
    declarationNames: declarationNames.split(","),
  });
}
