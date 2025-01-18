import {
  ClassDeclaration,
  TypeAliasDeclaration,
  InterfaceDeclaration,
  EnumDeclaration,
  FunctionDeclaration,
  VariableDeclaration,
} from "ts-morph";

// https://ts-morph.com/navigation/finding-references

export function getReferences(
  _declaration:
    | ClassDeclaration
    | TypeAliasDeclaration
    | InterfaceDeclaration
    | EnumDeclaration
    | FunctionDeclaration
    | VariableDeclaration
): { filePath: string; start: number; length: number; parentKind: string }[] {
  return _declaration
    .findReferences()
    .map((referencedSymbol) =>
      referencedSymbol.getReferences().map((reference) => {
        if (
          reference.getSourceFile().getFilePath() ===
          _declaration.getSourceFile().getFilePath()
        ) {
          return undefined;
        }
        return {
          filePath: reference.getSourceFile().getFilePath() as string,
          start: reference.getTextSpan().getStart(),
          length: reference.getTextSpan().getLength(),
          parentKind: reference.getNode().getParentOrThrow().getKindName(),
        };
      })
    )
    .flat()
    .filter((x) => !!x);
}
