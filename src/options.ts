import path from "node:path";
import os from "node:os";

export interface LauncherOptions {
  gameDirectory?: string;
  version: string;
}

export const defaultOpts = {
  gameDirectory: path.join(os.homedir(), ".astra", ".minecraft"),
};
