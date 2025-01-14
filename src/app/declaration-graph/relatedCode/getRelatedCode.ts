import finder from "find-package-json";
import pino from "pino";
import {
  ClassDeclaration,
  EnumDeclaration,
  FunctionDeclaration,
  InterfaceDeclaration,
  Node,
  TypeAliasDeclaration,
  VariableDeclaration,
  ts,
} from "ts-morph";
import { getSymbolFlagNames } from "./getSymbolFlagNames";
import { RelatedCodeDefinition } from "./RelatedCodeDefinition";

// TODO:
// - node_modules, recursivity

export async function getRelatedCode(
  _declaration:
    | ClassDeclaration
    | TypeAliasDeclaration
    | InterfaceDeclaration
    | EnumDeclaration
    | FunctionDeclaration
    | VariableDeclaration
    | Node,
  codeSizeLimit: number,
  ignoreExternalDeclarations: boolean,
  recursionLevel: number,
  relatedCodeDefinitions: RelatedCodeDefinition[],
  parentDefinitionIdentifiers: string,
  parentDefinitionLoc: string,
  {
    logger,
    projectPath,
    debugPath,
    debug,
  }: {
    logger: pino.Logger<never, boolean>;
    projectPath: string;
    debugPath: string;
    debug: boolean;
  }
): Promise<RelatedCodeDefinition[]> {
  const definitionKeys: Record<string, unknown> = {};
  relatedCodeDefinitions.forEach((def) => {
    definitionKeys[def.definitionLoc] = true;
  });
  logger.info(
    `Start declaration: ${_declaration.getStart()} ${_declaration.getEnd()} ${_declaration.getSourceFile().getFilePath()}\n${_declaration.getFullText()}`
  );
  try {
    _declaration.getDescendantsOfKind(ts.SyntaxKind.Identifier);
  } catch (e) {
    logger.info(e, "ts-morph bug 1");
    return [];
  }

  const relatedCode = _declaration
    .getDescendantsOfKind(ts.SyntaxKind.Identifier)
    .map((identifier) => {
      try {
        const identifierName = identifier.getText();
        logger.info(
          `Identifier: ${identifierName} ${identifier.getSourceFile().getFilePath()}#${identifier.getFullStart()}`
        );
        const parentKindName = identifier.getParent().getKindName();
        if (parentKindName.substring(0, 3) === "Jsx") {
          logger.info(`Skipping JSX/TSX node: ${identifierName}`);
          return undefined;
        }
        const definitions = identifier
          .getDefinitions()
          .map((definition, definitionIndex) => {
            let mode = "basic";
            const definitionNode = definition.getNode();
            const definitionNodeKindName = definitionNode.getKindName(); // Identifier
            // if (definition.getContainerName() === "__type") {
            //   logger.info("Skipping __type definition");
            //   return undefined;
            // }
            const declarationNode = definition.getDeclarationNode();
            if (!definitionNode) {
              logger.info("No definitionNode");
              return undefined;
            }
            if (
              definitionNode
                .getSourceFile()
                .getFilePath()
                .startsWith("/node_modules/typescript/lib/lib.")
            ) {
              logger.info("Internal TS declaration");
              return;
            }

            // definitionNode.

            const declarationNodeKindName = declarationNode?.getKindName();
            // const declarationAncestors = declarationNode.getAncestors();
            // const declarationAncestorsCode = declarationAncestors.map((a) =>
            //   a.getFullText().trim().substring(0, 100)
            // );

            const definitionAncestors = definitionNode.getAncestors();
            const definitionAncestorsCode = definitionAncestors.map((a) =>
              a.getFullText().trim().substring(0, 100)
            );

            let codeNode = definitionAncestors[definitionAncestors.length - 2];

            const code = codeNode.getFullText().substring(0, codeSizeLimit);
            const filePath = codeNode.getSourceFile().getFilePath();
            const start = codeNode.getFullStart();

            if (
              start > _declaration.getStart() &&
              start < _declaration.getEnd() &&
              filePath === _declaration.getSourceFile().getFilePath()
            ) {
              logger.info(`Skipping internal reference: ${identifierName}`);
              return undefined;
            }

            const codeLoc = `${filePath}#${start}`;

            if (codeLoc in definitionKeys) {
              logger.info(
                `Skipping already added definition: ${identifierName}`
              );
              return undefined;
            }
            definitionKeys[codeLoc] = true;

            logger.info(`codeNode ${codeLoc} \n${code.substring(0, 50)}`);

            const definitionIsExternal = filePath.includes("node_modules");

            if (ignoreExternalDeclarations && definitionIsExternal) {
              return undefined;
            }

            let definitionsPackage: string | undefined = undefined;

            if (definitionIsExternal) {
              const packageJsons = finder(filePath);
              const packageJson = packageJsons.next().value;
              definitionsPackage =
                packageJson?.["name"] + "@" + packageJson?.["version"];
            }
            let definitionIdentifier: string;
            try {
              // this fails on TicTacToeGameStore when processing:
              // create<TicTacToeGameStore>(...)
              definitionIdentifier = codeNode
                .getDescendantsOfKind(ts.SyntaxKind.Identifier)?.[0]
                ?.getText();
            } catch (e) {
              logger.info(e, "ts-morph bug 3");
              // Fall back to the identifierName in the referencing code
              definitionIdentifier = identifierName;
            }

            return {
              definitionLoc: codeLoc,
              definitionIdentifier,
              definitionsPackage,
              definitionNodeKindName,
              nodeFlags: definition.getNode().getFlags(),
              declarationNodeKindName,
              code,
              filePath,
              start,
              mode,
              _definitionCodeNode: codeNode,
              definitionIsExternal,
              // declarationAncestorsCode,
              // debug: definition.getNode().getParent().getParent().getFullText(),
              definitionAncestorsCode,
            };
          })
          .filter((d) => !!d);

        if (definitions.length === 0) {
          return undefined;
        }

        const firstDefinition = definitions[0];

        return {
          identifierName,
          identifierLoc: `${identifier.getSourceFile().getFilePath()}#${identifier.getStart()}`,
          definitionIdentifier: firstDefinition.definitionIdentifier,
          definitionLoc: firstDefinition.definitionLoc,
          code: firstDefinition.code,
          definitionIsExternal: firstDefinition.definitionIsExternal,
          definitionsPackage: firstDefinition.definitionsPackage,
          _definitionCodeNode: firstDefinition._definitionCodeNode,
          addedOnRecursionLevel: recursionLevel,
          parentDefinitionIdentifiers,
          parentDefinitionLoc,
          details: {
            identifierSymbolFlags:
              identifier.getSymbol() &&
              getSymbolFlagNames(identifier.getSymbol().getFlags()),
            identifierKindName: identifier.getKindName(),
            definitions,
            parentKindName,
          },
        };
      } catch (e) {
        logger.info(e, "ts-morph bug 2");
        logger.info(identifier.getSourceFile().getFilePath());
        return undefined;
      }
    })
    .filter((d) => !!d);

  return relatedCode;
}
