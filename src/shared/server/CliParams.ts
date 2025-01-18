export type CliParams = {
  projectTsConfig: string;
  debugToConsole: boolean;
  declarationNames: ReadonlyArray<string>;
  ignoreExternalDeclarations: boolean;
  maxRecursionLevel: number;
};
