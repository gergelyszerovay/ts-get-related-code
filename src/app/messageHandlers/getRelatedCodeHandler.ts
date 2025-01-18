import { GetRelatedCode } from "@shared/server/commands";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { getRelatedCodeRecursive } from "../declaration-graph/relatedCode/getRelatedCodeRecursive";
import { writeJsonFile } from "../utils/writeJsonFile";

export async function getRelatedCodeHandler(p: GetRelatedCode) {
  const { _serverState } = p;
  const { logger, debugPath } = _serverState;
  const relatedCodeDefinitions = await getRelatedCodeRecursive(p);

  const relatedCodeDefinitions2 = relatedCodeDefinitions.map((d) => ({
    ...d,
    _definitionCodeNode: undefined,
    details: undefined,
  }));

  // if (debug) {
  await writeJsonFile(
    path.join(debugPath, "relatedCode-full.json"),
    relatedCodeDefinitions
  );
  await writeJsonFile(
    path.join(debugPath, "relatedCode.json"),
    relatedCodeDefinitions2
  );
  // await writeJsonFile(path.join(debugPath, "references.json"), references);

  await writeFile(
    path.join(debugPath, "relatedcode.md"),
    relatedCodeDefinitions
      .map(
        (d) =>
          "```ts\n" +
          `// ${d.addedOnRecursionLevel} - ${d.definitionIdentifier} - ${d.definitionLoc}\n` +
          d.code.trim() +
          "\n```\n"
      )
      .join("")
  );
  // }

  // sendMessage({
  //   _event: "getRelatedCodeResult",
  //   relatedCodeDefinitions: relatedCodeDefinitions2,
  //   relatedCodeDefinitionNames: relatedCodeDefinitions.map(
  //     (d) => d.definitionIdentifier
  //   ),
  // });
}
