export type CliParams = {
  projectTsConfig: string;
  debug: boolean;
  declarationNames: ReadonlyArray<string>;
  ignoreExternalDeclarations: boolean;
  maxRecursionLevel: number;
};
