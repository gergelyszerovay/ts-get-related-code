import {
  ClassDeclaration,
  EnumDeclaration,
  FunctionDeclaration,
  InterfaceDeclaration,
  TypeAliasDeclaration,
  VariableDeclaration,
} from "ts-morph";
import { TsDeclarationTypes } from "./TsDeclarationTypes.type";

export type DeclarationDetail = {
  name: string;
  code: string;
  isExported: boolean;
  filePath: string;
  start: number;
  end: number;
  _declaration:
    | ClassDeclaration
    | TypeAliasDeclaration
    | InterfaceDeclaration
    | EnumDeclaration
    | FunctionDeclaration
    | VariableDeclaration;
  declarationType: TsDeclarationTypes;
  references: Array<{
    filePath: string;
    start: number;
    length: number;
    parentKind: string;
  }>;
};
