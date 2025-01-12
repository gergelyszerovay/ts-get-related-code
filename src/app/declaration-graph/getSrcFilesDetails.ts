import path from "path";
import pino from "pino";
import { Project } from "ts-morph";
import { CliParams } from "../CliParams";
import { writeJsonFile } from "../utils/writeJsonFile";
import { analyzeSoureFiles } from "./analyze/analyzeSoureFiles";

export async function getSrcFilesDetails(
  { debug }: CliParams,
  {
    logger,
    projectPath,
    debugPath,
  }: {
    logger: pino.Logger<never, boolean>;
    projectPath: string;
    debugPath: string;
  }
) {
  process.chdir(projectPath);

  const srcProject = new Project({
    tsConfigFilePath: "./tsconfig.app.json",
    // skipAddingFilesFromTsConfig: true,
  });

  // const diagnostics = srcProject.getPreEmitDiagnostics();
  // logger.info(diagnostics.map((d) => d.getMessageText() + "\n"));

  // logger.info(getCompilerOptionsFromTsConfig("./tsconfig.app.json"));

  // const emitResult = await srcProject.emit();
  // for (const diagnostic of emitResult.getDiagnostics()) {
  //   logger.info(diagnostic.getMessageText());
  // }

  // const diagnostics2 = srcProject.getProgram().d;
  // logger.info(diagnostics2.map((d) => d.getMessageText() + "\n"));

  // const sourceFiles = srcProject.getSourceFiles();

  const srcFilesDetails = analyzeSoureFiles(srcProject);

  // TODO: enforce unique names

  // logger?.info(
  //   srcFilesDetails.map((d) => d.filePath + " " + d.diagnosticsMessage),
  //   "srcFilesDetails files"
  // );

  // // Collect diagnostics
  // const allDiagnostics = ts.getPreEmitDiagnostics(
  //   srcProject.getProgram().compilerObject
  // );

  // allDiagnostics.forEach((diagnostic) => {
  //   if (diagnostic.file) {
  //     const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(
  //       diagnostic.start!
  //     );
  //     const message = ts.flattenDiagnosticMessageText(
  //       diagnostic.messageText,
  //       "\n"
  //     );
  //     logger?.info(
  //       `${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`
  //     );
  //   } else {
  //     logger?.info(
  //       ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n")
  //     );
  //   }
  // });

  if (debug) {
    await writeJsonFile(
      path.join(debugPath, "srcFilesDetails.json"),
      srcFilesDetails
    );
  }

  return { srcProject, srcFilesDetails };
}
