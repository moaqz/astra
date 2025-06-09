import type { ManifestType } from "./manifest";

/**
 * @see https://minecraft.wiki/w/Client.json
 */
export type VersionManifest = {
  arguments?: {
    game: (
      | string
      | {
        rules: {
          action: "allow" | "disallow";
          features?: {
            is_demo_user?: boolean;
            has_custom_resolution?: boolean;
            has_quick_plays_support?: boolean;
            is_quick_play_singleplayer?: boolean;
            is_quick_play_multiplayer?: boolean;
            is_quick_play_realms?: boolean;
          };
        }[];
        value: string | string[];
      }
    )[];
    jvm: (
      | string
      | {
        rules: {
          action: "allow" | "disallow";
          features?: {};
          os?: {
            name?: "windows" | "osx" | "linux";
            version?: string;
            arch?: string;
          };
        }[];
        value: string | string[];
      }
    )[];
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
  libraries: {
    downloads: {
      artifact: {
        path: string;
        sha1: string;
        size: number;
        url: string;
      }
    },
    name: string;
    url?: string;
    rules?: {
      action: "allow" | "disallow";
      os?: {
        name: "windows" | "osx" | "linux";
        version?: string;
        arch?: string;
      };
    }[];
  },
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
