import { symbolFlagNames } from "./symbolFlagNames";

export function getSymbolFlagNames(flag: number): string[] {
  return Object.keys(symbolFlagNames)
    .map((k) => (flag & Number(k) ? symbolFlagNames[k] : undefined))
    .filter(Boolean);
}
