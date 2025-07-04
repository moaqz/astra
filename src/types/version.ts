import type { LauncherFeatures } from "./launcher";
import type { ManifestType } from "./manifest";

export type ManifestRule = {
  action: "allow" | "disallow";
  features?: LauncherFeatures;
  os?: {
    name?: "windows" | "osx" | "linux";
    version?: string;
    arch?: string;
  };
};

export type ManifestArgument = (
  | string
  | {
    rules: ManifestRule[],
    value: string | string[]
  }
);

export type Library = {
  downloads: {
    artifact?: {
      path: string;
      sha1: string;
      size: number;
      url: string;
    }
  },
  name: string;
  url?: string;
  rules?: ManifestRule[];
};

/**
 * @see https://minecraft.wiki/w/Client.json
 */
export type VersionManifest = {
  arguments?: {
    game: ManifestArgument[];
    jvm: ManifestArgument[];
  },
  assetIndex: {
    id: string;
    sha1: string;
    size: number;
    totalSize: number;
    url: string;
  },
  assets: string;
  complianceLevel: number;
  downloads: {
    client: {
      sha1: string;
      size: number;
      url: string;
    },
    client_mappings?: {
      sha1: string;
      size: number;
      url: string;
    }
    server: {
      sha1: string;
      size: number;
      url: string;
    },
    server_mappings?: {
      sha1: string;
      size: number;
      url: string;
    }
  },
  id: string;
  javaVersion: {
    component: string;
    majorVersion: number;
  },
  libraries: Library[],
  logging?: {
    client: {
      argument: string;
      file: {
        id: string;
        sha1: string;
        size: number;
        url: string;
      };
      type: string;
    };
  },
  mainClass: string;
  minecraftArguments?: string;
  minimumLauncherVersion: number;
  releaseTime: string;
  time: string;
  type: ManifestType;
};
