export interface LauncherFeatures {
  isDemoUser: boolean;
  hasCustomResolution: boolean;
  hasQuickPlaysSupport: boolean;
  isQuickPlaySingleplayer: boolean;
  isQuickPlayMultiplayer: boolean;
  isQuickPlayRealms: boolean;
}

export interface LauncherOptions extends Partial<LauncherFeatures> {
  gameDirectory?: string;
  version: string;
  versionType: string;
  auth: {
    name: string;
    uuid?: string;
    accessToken?: string;
    clientId?: string;
    xuid?: string;
    type?: string;
  }
}
