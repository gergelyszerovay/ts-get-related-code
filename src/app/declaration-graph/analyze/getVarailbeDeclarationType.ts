import { SyntaxKind, VariableDeclaration } from "ts-morph";
import { TsDeclarationTypes } from "./TsDeclarationTypes.type";

export function getVarailbeDeclarationType(
  _declaration: VariableDeclaration
): TsDeclarationTypes {
  if (
    _declaration.getInitializerIfKind(SyntaxKind.ArrowFunction) ||
    _declaration.getInitializerIfKind(SyntaxKind.FunctionExpression)
  ) {
    if (_declaration.getText().includes("React.FC")) {
      return "function_react_fc";
    }
    return "function_as_variable";
  }
  return "variable";
}
