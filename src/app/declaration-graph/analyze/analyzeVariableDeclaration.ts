import { VariableDeclaration, VariableStatement } from "ts-morph";
import { DeclarationDetail } from "./DeclarationDetail";
import { getReferences } from "./getReferences";
import { getVarailbeDeclarationType } from "./getVarailbeDeclarationType";

export function analyzeVariableDeclaration(
  variableStatement: VariableStatement,
  _declaration: VariableDeclaration
): DeclarationDetail {
  const name = _declaration.getName() as string;

  // console.log(name);

  // const functionDeclarations = _declaration.getDescendantsOfKind(
  //   SyntaxKind.ArrowFunction
  // );

  // functionDeclarations.forEach((funcDecl) => {
  //   console.log(name + " fn");
  //   // Process parameters
  //   const parameters = funcDecl.getParameters();
  //   parameters.forEach((param) => {
  //     if (!param.getTypeNode()) {
  //       // Check if parameter type is implicit
  //       const inferredType = param.getType().getText();
  //       param.setType(inferredType); // Set explicit type
  //     }
  //   });

  //   // Process return type
  //   if (!funcDecl.getReturnTypeNode()) {
  //     // Check if return type is implicit
  //     const inferredReturnType = funcDecl.getReturnType().getText();
  //     funcDecl.setReturnType(inferredReturnType); // Set explicit return type
  //   }
  // });

  // const variableDeclarations = _declaration.getDescendantsOfKind(
  //   SyntaxKind.VariableDeclaration
  // );

  // variableDeclarations.forEach((variableDecl) => {
  //   // Check if the variable declaration is part of a destructuring assignment
  //   const parent = variableDecl.getParent();
  //   if (parent && parent.getKind() === SyntaxKind.VariableDeclarationList) {
  //     const grandParent = parent.getParent();
  //     if (
  //       grandParent &&
  //       grandParent.getKind() === SyntaxKind.VariableStatement
  //     ) {
  //       // Check if the variable has an implicit type (no type node)
  //       if (!variableDecl.getTypeNode()) {
  //         // Get the inferred type
  //         const inferredType = variableDecl.getType().getText();
  //         console.log(
  //           `Variable 1: ${variableDecl.getName()}, Type: ${inferredType}`
  //         );
  //         // Set the explicit type
  //         variableDecl.setType(inferredType);
  //         return;
  //       }
  //     }
  //   }
  //   // Check if the variable has an implicit type (no type node)
  //   if (!variableDecl.getTypeNode()) {
  //     // Get the inferred type
  //     const inferredType = variableDecl.getType().getText();
  //     console.log(
  //       `Variable 2: ${variableDecl.getName()}, Type: ${inferredType}`
  //     );
  //     variableDecl.setType(inferredType); // Set the explicit type
  //   }
  // });
  return {
    name,
    code:
      variableStatement.getJsDocs().map((doc) => doc.getText()) +
      (variableStatement.getJsDocs().length ? "\n" : "") +
      variableStatement.getText(),
    filePath: _declaration.getSourceFile().getFilePath(),
    start:
      // variableStatement.getJsDocs()?.[0]?.getStart() ||
      variableStatement.getFullStart(),
    end: variableStatement.getEnd(),
    _declaration,
    isExported: _declaration.isExported(),
    declarationType: getVarailbeDeclarationType(_declaration),
    references: getReferences(_declaration),
  };
}
