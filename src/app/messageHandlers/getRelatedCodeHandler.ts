import { writeFile } from "node:fs/promises";
import path from "node:path";
import { getReferences } from "../declaration-graph/analyze/getReferences";
import { getSrcFilesDetails } from "../declaration-graph/getSrcFilesDetails";
import { getRelatedCode } from "../declaration-graph/relatedCode/getRelatedCode";
import { GetRelatedCode } from "../messageTypes/GetRelatedCode";
import { writeJsonFile } from "../utils/writeJsonFile";

export async function getRelatedCodeHandler(p: GetRelatedCode) {
  const { _serverState } = p;
  const { logger, projectPath, debugPath, cliParamas } = _serverState;
  const { debug } = cliParamas;

  // process.chdir(projectPath);

  const { srcFilesDetails } = await getSrcFilesDetails(
    { debug },
    { logger, projectPath, debugPath }
  );

  const allDeclarations = srcFilesDetails
    .map((detail) => detail.declarations)
    .flat();

  const declaration = allDeclarations.find((d) => d.name === p.declarationName);
  if (!declaration) {
    throw new Error("TODO");
  }

  const references = getReferences(declaration._declaration);

  let relatedCodeDefinitions = await getRelatedCode(
    declaration._declaration,
    500,
    0,
    [],
    p.declarationName,
    declaration._declaration.getSourceFile().getFilePath() +
      "#" +
      declaration._declaration.getSourceFile().getFullStart(),
    {
      logger,
      projectPath,
      debugPath,
      debug,
    }
  );

  for (let recursionLevel = 1; recursionLevel <= 2; recursionLevel++) {
    for (let d1 of relatedCodeDefinitions) {
      if (
        d1.definitionIsExternal ||
        !d1._definitionCodeNode ||
        d1.addedOnRecursionLevel !== recursionLevel - 1
      ) {
        continue;
      }
      relatedCodeDefinitions = [
        ...relatedCodeDefinitions,
        ...(await getRelatedCode(
          d1._definitionCodeNode,
          500,
          recursionLevel,
          relatedCodeDefinitions,
          d1.parentDefinitionIdentifiers + "/" + d1.definitionIdentifier,
          d1.parentDefinitionLoc,
          {
            logger,
            projectPath,
            debugPath,
            debug,
          }
        )),
      ];
    }
  }

  const relatedCodeDefinitions2 = relatedCodeDefinitions.map((d) => ({
    ...d,
    _definitionCodeNode: undefined,
    details: undefined,
  }));

  if (debug) {
    await writeJsonFile(
      path.join(debugPath, "relatedCode-full.json"),
      relatedCodeDefinitions
    );
    await writeJsonFile(
      path.join(debugPath, "relatedCode.json"),
      relatedCodeDefinitions2
    );
    await writeJsonFile(path.join(debugPath, "references.json"), references);

    await writeFile(
      path.join(debugPath, "relatedcode.md"),
      "```ts\n" +
        relatedCodeDefinitions.map((d) => d.code).join("\n") +
        "\n```\n"
    );
  }
}
