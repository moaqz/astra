import { ManifestService } from "./manifest";
import { defaultOpts, type LauncherOptions } from "./options";
import type { LibraryRules, VersionManifest } from "./types/version";
import { downloadFileWithProgress } from "./download-utils";
import { getArch, getOS } from "./os-utils";

import path from "node:path";
import fs, { constants } from "node:fs/promises";

export class Launcher {
  private readonly manifestService: ManifestService;
  private readonly opts: Required<LauncherOptions>;

  constructor(opts: LauncherOptions) {
    this.opts = {
      ...defaultOpts,
      ...opts,
    };
    this.manifestService = new ManifestService(this.opts as Required<LauncherOptions>);
  }

  public async download() {
    const versionManifest = await this.manifestService.getVersion(this.opts.version);
    await this.downloadLibraries(versionManifest);
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
        continue;
      }

      await fs.mkdir(libDir, { recursive: true });
      await downloadFileWithProgress(library.downloads.artifact.url, libPath);
    }
  }

  private async shouldDownloadLibrary(path: string, rules: LibraryRules): Promise<boolean> {
    if (!this.rulesMatch(rules)) {
      return false;
    }

    const fileExists = await fs.access(path, constants.R_OK)
      .then(() => true)
      .catch(() => false);

    if (fileExists) {
      return false;
    }

    return true;
  }

  private rulesMatch(rules: LibraryRules): boolean {
    if (!rules || rules.length === 0) {
      return true;
    }

    const currentOS = getOS();
    const currentArch = getArch();
    let allowed = false;

    for (const rule of rules) {
      let matches = true;

      if (rule.os) {
        if (rule.os.name && rule.os.name !== currentOS) {
          matches = false;
        }

        if (rule.os.arch && rule.os.arch !== currentArch) {
          matches = false;
        }
      }

      if (matches) {
        allowed = rule.action === "allow";
      }
    }

    return allowed;
  }
}
