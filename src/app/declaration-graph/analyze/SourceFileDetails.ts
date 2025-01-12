import { SourceFile } from "ts-morph";
import { DeclarationDetail } from "./DeclarationDetail";

/**
 * Represents detailed information about a source file, including its path,
 * imports, and declarations.
 */

export type SourceFileDetails = {
  /**
   * The original source file object.
   */
  _sourceFile: SourceFile;
  filePath: string;
  externalNamedAndDefaultImports: Array<string>;
  externalImportStatements: Array<string>;
  declarations: Array<DeclarationDetail>;
  diagnosticsMessage: string;
};
