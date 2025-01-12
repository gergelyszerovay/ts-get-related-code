import { writeFile } from "node:fs/promises";

function replacer(key: string, value: unknown) {
  if (key[0] === "_") {
    return undefined;
  }
  return value;
}

export async function writeJsonFile(
  filePath: string,
  obj: unknown
): Promise<void> {
  await writeFile(filePath, JSON.stringify(obj, replacer, 2), {
    encoding: "utf-8",
  });
}
