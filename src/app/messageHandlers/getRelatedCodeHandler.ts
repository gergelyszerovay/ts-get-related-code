import { RelatedCodeDefinition } from "@shared/server";
import { GetRelatedCode } from "@shared/server/commands";
import { writeFile } from "node:fs/promises";
import path, { basename } from "node:path";
import {
  ClassDeclaration,
  EnumDeclaration,
  FunctionDeclaration,
  InterfaceDeclaration,
  Project,
  TypeAliasDeclaration,
  VariableDeclaration,
} from "ts-morph";
import { getRelatedCode } from "../declaration-graph/relatedCode/getRelatedCode";
import { writeJsonFile } from "../utils/writeJsonFile";

export async function getRelatedCodeHandler(p: GetRelatedCode) {
  const {
    _serverState,
    externalCodeSizeLimit,
    codeSizeLimit,
    ignoreExternalDeclarations,
    maxRecursionLevel,
  } = p;
  const { logger, projectPath, debugPath, cliParamas } = _serverState;
  const { debugToConsole: debug, projectTsConfig } = cliParamas;

  const project = new Project({
    tsConfigFilePath: projectTsConfig,
  });

  let relatedCodeDefinitions: RelatedCodeDefinition[] = [];

  for (const declarationId of p.declarationIds) {
    const declarationIdX = declarationId.split("#");
    let declarationName =
      declarationIdX.length > 1 ? declarationIdX[1] : declarationIdX[0];
    let declarationSourceFile =
      declarationIdX.length > 1 ? declarationIdX[0] : undefined;

    const sourceFiles = project.getSourceFiles();

    for (const sourceFile of sourceFiles) {
      if (
        declarationSourceFile &&
        basename(sourceFile.getFilePath()) !== declarationSourceFile
      ) {
        continue;
      }
      let declaration:
        | ClassDeclaration
        | TypeAliasDeclaration
        | InterfaceDeclaration
        | EnumDeclaration
        | FunctionDeclaration
        | VariableDeclaration =
        sourceFile.getClass(declarationName) ||
        sourceFile.getFunction(declarationName) ||
        sourceFile.getEnum(declarationName) ||
        sourceFile.getTypeAlias(declarationName) ||
        sourceFile.getInterface(declarationName);
      if (!declaration) {
        const variableStatements = sourceFile.getVariableStatements();
        for (const variableStatement of variableStatements) {
          const variableDeclarations = variableStatement.getDeclarations();

          for (const variableDeclaration of variableDeclarations) {
            if (variableDeclaration.getName() === declarationName) {
              declaration = variableDeclaration;
            }
          }
        }
      }
      if (declaration) {
        relatedCodeDefinitions = [
          ...relatedCodeDefinitions,
          ...(await getRelatedCode(
            declaration,
            {
              codeSizeLimit,
              externalCodeSizeLimit,
              ignoreExternalDeclarations,
              recursionLevel: 0,
              relatedCodeDefinitions: [],
              parentDefinitionIdentifiers: declarationName,
              parentDefinitionLoc:
                declaration.getSourceFile().getFilePath() +
                "#" +
                declaration.getSourceFile().getFullStart(),
            },
            {
              logger,
              projectPath,
              debugPath,
              debug,
            }
          )),
        ];

        for (
          let recursionLevel = 1;
          recursionLevel <= maxRecursionLevel;
          recursionLevel++
        ) {
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
                {
                  codeSizeLimit,
                  externalCodeSizeLimit,
                  ignoreExternalDeclarations,
                  recursionLevel,
                  relatedCodeDefinitions,
                  parentDefinitionIdentifiers:
                    d1.parentDefinitionIdentifiers +
                    "/" +
                    d1.definitionIdentifier,
                  parentDefinitionLoc: d1.parentDefinitionLoc,
                },
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
      }
    }

    // srcProject.getC;
  }

  // const references = getReferences(declaration._declaration);

  const relatedCodeDefinitions2 = relatedCodeDefinitions.map((d) => ({
    ...d,
    _definitionCodeNode: undefined,
    details: undefined,
  }));

  // if (debug) {
  await writeJsonFile(
    path.join(debugPath, "relatedCode-full.json"),
    relatedCodeDefinitions
  );
  await writeJsonFile(
    path.join(debugPath, "relatedCode.json"),
    relatedCodeDefinitions2
  );
  // await writeJsonFile(path.join(debugPath, "references.json"), references);

  await writeFile(
    path.join(debugPath, "relatedcode.md"),
    relatedCodeDefinitions
      .map(
        (d) =>
          "```ts\n" +
          `// ${d.addedOnRecursionLevel} - ${d.definitionIdentifier} - ${d.definitionLoc}\n` +
          d.code.trim() +
          "\n```\n"
      )
      .join("")
  );
  // }

  // sendMessage({
  //   _event: "getRelatedCodeResult",
  //   relatedCodeDefinitions: relatedCodeDefinitions2,
  //   relatedCodeDefinitionNames: relatedCodeDefinitions.map(
  //     (d) => d.definitionIdentifier
  //   ),
  // });
}
