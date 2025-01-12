import { ImportDeclaration, SourceFile } from "ts-morph";

export function analyzeExternalImports(f: SourceFile) {
  const externalNamedAndDefaultImports: Array<string> = [];
  const externalImportStatements: Array<string> = [];
  f.getImportDeclarations().forEach((i) => {
    const importStatement = i.getText();
    // TODO: filter for tsconfig's paths
    if (!importStatement.includes("'.") && !importStatement.includes('".')) {
      externalImportStatements.push(importStatement);
      externalNamedAndDefaultImports.push(
        ...(i as ImportDeclaration).getNamedImports().map((ni) => ni.getText())
      );
      const defaultImport = (i as ImportDeclaration)
        .getDefaultImport()
        ?.getText();
      if (defaultImport) {
        externalNamedAndDefaultImports.push(defaultImport);
      }
    }
  });
  return { externalNamedAndDefaultImports, externalImportStatements };
}
