import pino from "pino";
import { CliParams } from "./CliParams";

export type ServerState = {
  cliParamas: CliParams;
  logger: pino.Logger<never, boolean>;
  projectPath: string;
  debugPath: string;
};
