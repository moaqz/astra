import type { LauncherOptions } from "./options";
import { matchesAllRules } from "./rules";
import type { ManifestArgument } from "./types/version";

export function parseArgs(manifestArgs: ManifestArgument[], opts: LauncherOptions): string {
  let finalArgs = "";

  for (const entry of manifestArgs) {
    if (typeof entry === "string") {
      finalArgs += `${entry} `;
      continue;
    }

    const { rules, value } = entry;
    if (matchesAllRules(rules, opts)) {
      typeof value === "string"
        ? finalArgs += `${value} `
        : value.forEach((s) => { finalArgs += `${s} `; });
    }
  }

  return finalArgs.trim();
}
