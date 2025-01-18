import { ServerState } from "@shared/server";
import meow from "meow";
import { existsSync } from "node:fs";
import { mkdir, rm } from "node:fs/promises";
import path, { dirname } from "node:path";
import { getRelatedCodeHandler } from "./messageHandlers/getRelatedCodeHandler";
import { getLoggerAndSetupDebug } from "./utils/getLoggerAndSetupDebug";

const __dirname = import.meta.dirname;

export async function asyncMain() {
  const usage = `
Examples
  $ cli --projectTsConfig=../project/tsconfig.json --debug=file
`;

  const cli = meow(usage, {
    importMeta: import.meta, // This is required
    flags: {
      projectTsConfig: {
        type: "string",
        isRequired: true,
      },
      debugToConsole: {
        type: "boolean",
        default: false,
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
      codeSizeLimit: {
        type: "number",
        default: 0,
      },
      externalCodeSizeLimit: {
        type: "number",
        default: 1000,
      },
    },
  });

  const { debugToConsole, projectTsConfig, declarationNames } = cli.flags;

  const projectPath = path.resolve(dirname(projectTsConfig));

  if (!existsSync(projectPath)) {
    // TODO
    console.error("invalid projectPath");
  }

  // const debugPath = path.join(projectPath, "debug");
  const debugPath = path.join(__dirname, "..", "..", "debug");
  const logger = await getLoggerAndSetupDebug(debugToConsole, debugPath);

  if (existsSync(debugPath)) {
    await rm(debugPath, { recursive: true });
  }
  await mkdir(debugPath);

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
    declarationIds: declarationNames.split(","),
    ignoreExternalDeclarations: cli.flags.ignoreExternalDeclarations,
    maxRecursionLevel: cli.flags.maxRecursionLevel,
    codeSizeLimit: cli.flags.codeSizeLimit,
    externalCodeSizeLimit: cli.flags.externalCodeSizeLimit,
  });

  logger?.info("done");
  console.log("done");
}
