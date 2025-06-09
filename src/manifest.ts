import type { ManifestV2, ManifestVersion } from "./types/manifest";
import type { VersionManifest } from "./types/version";
import { ofetch } from "ofetch";

export class ManifestManager {
  private readonly manifestURL = "https://launchermeta.mojang.com/mc/game/version_manifest_v2.json";
  private _data: ManifestV2 | null = null;

  private async fetchManifest(): Promise<ManifestV2> {
    this._data = await ofetch<ManifestV2>(this.manifestURL);
    return this._data;
  }

  public async getManifest(): Promise<ManifestV2> {
    if (this._data) {
      return this._data;
    }

    return this.fetchManifest();
  }

  public async getVersion(id: string): Promise<VersionManifest> {
    const version = (await this.getManifest()).versions
      .find(v => v.id === id);

    if (!version) {
      throw new Error(`Version with ID '${id}' not found in the manifest.`);
    }

    const { url } = version;
    return ofetch<VersionManifest>(url);
  }

  public async listReleaseVersions(): Promise<ManifestVersion[]> {
    const manifest = await this.getManifest();
    return manifest.versions.filter((v) => v.type === "release");
  }
}
