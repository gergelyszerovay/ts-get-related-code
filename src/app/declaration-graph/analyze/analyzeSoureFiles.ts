import { Project } from "ts-morph";
import { SourceFileDetails } from "./SourceFileDetails";
import { analyzeDeclaration } from "./analyzeDeclaration";
import { analyzeExternalImports } from "./analyzeExternalImports";
import { analyzeVariableDeclaration } from "./analyzeVariableDeclaration";

export function analyzeSoureFiles(project: Project): SourceFileDetails[] {
  const sourceFilesDetails: SourceFileDetails[] = [];
  project.getSourceFiles().forEach((_sourceFile) => {
    const diagnostics = _sourceFile.getPreEmitDiagnostics();

    const sourceFileDetails: SourceFileDetails = {
      _sourceFile,
      filePath: _sourceFile.getFilePath(),
      diagnosticsMessage: diagnostics
        .map((d) => {
          const m = d.getMessageText();
          if (typeof m === "string") {
            return m;
          }
          return "DMC: " + m.getMessageText();
        })
        .join("\n"),
      ...analyzeExternalImports(_sourceFile),
      declarations: [
        ..._sourceFile
          .getClasses()
          .map((_declaration) => analyzeDeclaration("class", _declaration)),
        ..._sourceFile
          .getEnums()
          .map((_declaration) => analyzeDeclaration("enum", _declaration)),
        ..._sourceFile
          .getFunctions()
          .map((_declaration) => analyzeDeclaration("function", _declaration)),
        ..._sourceFile
          .getInterfaces()
          .map((_declaration) => analyzeDeclaration("interface", _declaration)),
        ..._sourceFile
          .getTypeAliases()
          .map((_declaration) => analyzeDeclaration("type", _declaration)),
        ..._sourceFile
          .getVariableStatements()
          .map((variableStatement) => {
            // TODO: error, if there are more then one declaration
            return variableStatement.getDeclarations().map((_declaration) => {
              return analyzeVariableDeclaration(
                variableStatement,
                _declaration
              );
            });
          })
          .flat(),
      ],
    };
    sourceFilesDetails.push(sourceFileDetails);
  });
  return sourceFilesDetails;
}
