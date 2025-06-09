export type ManifestType = "release" | "snapshot" | "old_beta" | "old_alpha";

export type ManifestVersion = {
  id: string;
  type: ManifestType;
  url: string;
  time: string;
  releaseTime: string;
  sha1: string;
  complianceLevel: number;
};

/**
 * @see https://minecraft.wiki/w/Version_manifest.json
 */
export type ManifestV2 = {
  latest: {
    release: string;
    snapshot: string;
  };
  versions: ManifestVersion[];
};
