import { Node, NodeFlags } from "ts-morph";

export type RelatedCodeDefinition = {
  identifierName: string;
  identifierLoc: string;
  definitionIdentifier: string;
  definitionLoc: string;
  code: string;
  definitionIsExternal: boolean;
  definitionsPackage?: string;
  addedOnRecursionLevel: number;
  _definitionCodeNode?: Node;
  parentDefinitionIdentifiers: string;
  parentDefinitionLoc: string;
  details: {
    identifierSymbolFlags: string[];
    identifierKindName: string;
    definitions: {
      definitionIdentifier: string;
      definitionLoc: string;
      definitionIsExternal: boolean;
      definitionsPackage?: string;
      definitionNodeKindName: string;
      nodeFlags: NodeFlags;
      declarationNodeKindName: string | undefined;
      code: string;
      filePath: string;
      start: number;
      mode: string;
      _definitionCodeNode?: Node;
      // declarationAncestorsCode: string[];
      definitionAncestorsCode: string[];
      debug?: unknown;
    }[];
    parentKindName: string;
  };
};
