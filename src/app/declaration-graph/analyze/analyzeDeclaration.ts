import {
  ClassDeclaration,
  EnumDeclaration,
  FunctionDeclaration,
  InterfaceDeclaration,
  TypeAliasDeclaration,
} from "ts-morph";
import { DeclarationDetail } from "./DeclarationDetail";
import { TsDeclarationTypes } from "./TsDeclarationTypes.type";
import { getReferences } from "./getReferences";

export function analyzeDeclaration(
  declarationType: TsDeclarationTypes,
  _declaration:
    | ClassDeclaration
    | TypeAliasDeclaration
    | InterfaceDeclaration
    | EnumDeclaration
    | FunctionDeclaration
): DeclarationDetail {
  const name = _declaration.getName() as string;
  // console.log(name);

  // const functionDeclarations = _declaration.getDescendantsOfKind(
  //   SyntaxKind.ArrowFunction
  // );

  // functionDeclarations.forEach((funcDecl) => {
  //   console.log(name + " " + funcDecl.getSignature());
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

  return {
    name,
    code: _declaration.getFullText(),
    // getText() should contain the tsdoc, too
    // _declaration.getJsDocs().map((doc) => doc.getText()) +
    // (_declaration.getJsDocs().length ? "\n" : "") +
    // _declaration.getText(),
    filePath: _declaration.getSourceFile().getFilePath(),
    start: _declaration.getJsDocs()?.[0]?.getStart() || _declaration.getStart(),
    // start: _declaration.getFullStart(),
    end: _declaration.getEnd(),
    _declaration,
    isExported: _declaration.isExported(),
    declarationType,
    references: getReferences(_declaration),
  };
}
