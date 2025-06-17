import type { ManifestV2, ManifestVersion } from "./types/manifest";
import type { VersionManifest } from "./types/version";
import type { AssetIndex } from "./types/assets";
import { type LauncherOptions } from "./options";

import fs from "node:fs/promises";
import path from "node:path";

export class ManifestService {
  private readonly API_URL = "https://launchermeta.mojang.com/mc/game/version_manifest_v2.json";
  private readonly defaultOpts: Required<LauncherOptions>;
  private manifest: ManifestV2 | null = null;

  constructor(opts: Required<LauncherOptions>) {
    this.defaultOpts = opts;
  }

  public getVersionsDir(): string {
    return path.join(this.defaultOpts.gameDirectory, "versions");
  }

  public getClientDir(): string {
    return path.join(this.defaultOpts.gameDirectory, "versions", this.defaultOpts.version);
  }

  public getAssetsDir(): string {
    return path.join(this.defaultOpts.gameDirectory, "assets", "objects");
  }

  public getAssetsIndexesDir(): string {
    return path.join(this.defaultOpts.gameDirectory, "assets", "indexes");
  }

  public getLibrariesDir(): string {
    return path.join(this.defaultOpts.gameDirectory, "libraries");
  }

  private async getRemoteManifest(): Promise<ManifestV2> {
    const response = await fetch(this.API_URL, {
      headers: {
        "Accept": "application/json"
      }
    });

    this.manifest = await response.json() as ManifestV2;
    return this.manifest;
  }

  private async getManifest(): Promise<ManifestV2> {
    if (!this.manifest) {
      return this.getRemoteManifest();
    }

    return this.manifest;
  }

  public async getReleaseVersions(): Promise<ManifestVersion[]> {
    const manifest = await this.getManifest();
    return manifest.versions.filter((v) => v.type === "release");
  }

  public async getVersion(versionId: string): Promise<VersionManifest> {
    const localVersionManifest = await this.getLocalVersion(versionId);
    if (localVersionManifest) {
      return localVersionManifest;
    }

    const version = (await this.getReleaseVersions()).find(v => v.id === versionId);
    if (!version) {
      throw new Error(`Version with ID '${versionId}' not found in the manifest.`);
    }

    const response = await fetch(version.url, {
      headers: {
        "Accept": "application/json"
      }
    });

    const versionManifest = await response.json() as VersionManifest;
    const versionManifestPath = path.join(
      this.getVersionsDir(),
      versionId,
      `${versionId}.json`
    );

    await fs.mkdir(path.dirname(versionManifestPath), { recursive: true });
    await fs.writeFile(versionManifestPath, JSON.stringify(versionManifest), "utf8");

    return versionManifest;
  }

  private async getLocalVersion(versionId: string): Promise<VersionManifest | null> {
    const versionManifestPath = path.join(
      this.getVersionsDir(),
      versionId,
      `${versionId}.json`
    );

    try {
      await fs.access(versionManifestPath, fs.constants.R_OK | fs.constants.W_OK);
      const versionManifest = await fs.readFile(versionManifestPath, "utf8");
      return JSON.parse(versionManifest);
    } catch (_) {
      return null;
    }
  }

  public async getAssetIndex(manifest: VersionManifest, version: string): Promise<AssetIndex> {
    const assetIndexPath = path.join(
      this.getAssetsIndexesDir(),
      `${version}.json`
    );

    try {
      await fs.access(assetIndexPath, fs.constants.R_OK | fs.constants.W_OK);
      const raw = await fs.readFile(assetIndexPath, "utf8");
      return JSON.parse(raw);
    } catch (_) { }

    const response = await fetch(manifest.assetIndex.url, {
      headers: {
        "Accept": "application/json"
      }
    });

    await fs.mkdir(path.dirname(assetIndexPath), { recursive: true });

    const assetIndex = await response.json() as Promise<AssetIndex>;
    await fs.writeFile(assetIndexPath, JSON.stringify(assetIndex), "utf8");
    return assetIndex;
  }
}
