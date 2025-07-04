import path from "node:path";
import os from "node:os";

export const defaultOpts = {
  gameDirectory: path.join(os.homedir(), ".astra", ".minecraft"),
  isDemoUser: false,
  hasCustomResolution: false,
  hasQuickPlaysSupport: false,
  isQuickPlaySingleplayer: false,
  isQuickPlayMultiplayer: false,
  isQuickPlayRealms: false,
};
