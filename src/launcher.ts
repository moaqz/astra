import { ManifestService } from "./manifest";
import { defaultOpts, type LauncherOptions } from "./options";
import type { ManifestRule, VersionManifest } from "./types/version";
import { downloadFileWithProgress, DOWNLOAD_EVENTS, emitter } from "./download-utils";
import { parseArgs } from "./args";
import { matchesAllRules } from "./rules";

import path from "node:path";
import fs, { constants } from "node:fs/promises";

export class Launcher {
  private readonly manifestService: ManifestService;
  private readonly opts: Required<LauncherOptions>;
  private manifest: VersionManifest | null = null;

  constructor(opts: LauncherOptions) {
    this.opts = {
      ...defaultOpts,
      ...opts,
    };
    this.manifestService = new ManifestService(this.opts as Required<LauncherOptions>);
  }

  public async download() {
    const versionManifest = await this.manifestService.getVersion(this.opts.version);
    this.manifest = versionManifest;

    await this.downloadClient(versionManifest);
    await this.downloadLibraries(versionManifest);
    await this.downloadAssets(versionManifest);
  }

  public async start() {
    if (!this.manifest || !this.manifest.arguments) {
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const gameArgs = parseArgs(this.manifest.arguments.game, this.opts);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const jvmArgs = parseArgs(this.manifest.arguments.jvm, this.opts);
  }

  private async downloadClient(manifest: VersionManifest) {
    const clientDir = this.manifestService.getClientDir();
    const clientPath = path.join(
      clientDir,
      `${this.opts.version}.jar`
    );

    if (await this.fileExists(clientPath)) {
      this.skipDownload(clientPath, manifest.downloads.client.url);
      return;
    }

    await fs.mkdir(clientDir, { recursive: true });
    await downloadFileWithProgress(
      manifest.downloads.client.url,
      manifest.downloads.client.sha1,
      clientPath
    );
  }

  private async downloadAssets(manifest: VersionManifest) {
    const assetIndex = await this.manifestService.getAssetIndex(manifest, this.opts.version);

    const objects = Object.values(assetIndex.objects);
    for (const { hash } of objects) {
      const hashPrefix = hash.slice(0, 2);
      const assetURL = `https://resources.download.minecraft.net/${hashPrefix}/${hash}`;
      const assetPath = path.join(
        this.manifestService.getAssetsDir(),
        hashPrefix,
        hash
      );
      const assetDir = path.dirname(assetPath);

      if (!(await this.shouldDownloadAsset(assetPath))) {
        this.skipDownload(assetPath, assetURL);
        continue;
      }

      await fs.mkdir(assetDir, { recursive: true });
      await downloadFileWithProgress(assetURL, hash, assetPath);
    }
  }

  private async shouldDownloadAsset(path: string): Promise<boolean> {
    const exists = await this.fileExists(path);
    return !exists;
  }

  private async downloadLibraries(manifest: VersionManifest) {
    const baseDir = this.manifestService.getLibrariesDir();

    for (const library of manifest.libraries) {
      if (library.downloads.artifact == null) {
        /**
         * @todo
         * Dependencies required in older versions.
         */
        continue;
      }

      const libPath = path.join(baseDir, library.downloads.artifact.path);
      const libDir = path.dirname(libPath);
      if (
        !(await this.shouldDownloadLibrary(libPath, library.rules))
      ) {
        this.skipDownload(libPath, library.downloads.artifact.url);
        continue;
      }

      await fs.mkdir(libDir, { recursive: true });
      await downloadFileWithProgress(
        library.downloads.artifact.url,
        library.downloads.artifact.sha1,
        libPath
      );
    }
  }

  private async shouldDownloadLibrary(path: string, rules: ManifestRule[] | undefined): Promise<boolean> {
    if (rules && !matchesAllRules(rules, this.opts)) {
      return false;
    }

    if (await this.fileExists(path)) {
      return false;
    }

    return true;
  }

  private async fileExists(path: string): Promise<boolean> {
    return fs.access(path, constants.R_OK)
      .then(() => true)
      .catch(() => false);
  }

  private skipDownload(filePath: string, url: string) {
    emitter.emit(DOWNLOAD_EVENTS["download:skipped"], {
      name: path.basename(filePath),
      url,
      path: filePath,
    });
  }
}
