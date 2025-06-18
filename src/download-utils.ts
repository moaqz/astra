import fs, { createWriteStream } from "node:fs";
import { EventEmitter } from "node:events";
import path from "node:path";
import { createHash } from "node:crypto";

export const emitter = new EventEmitter();

export const DOWNLOAD_EVENTS = {
  "download:progress": "download:progress",
  "download:completed": "download:completed",
  "download:start": "download:start",
  "download:skipped": "download:skipped",
  "download:failed": "download:failed",
  "download:checksum_check": "download:checksum_check",
} as const;

export async function downloadFileWithProgress(url: string, sha1: string, destPath: string) {
  const { response, reader } = await fetchWithRetry(url);
  const writeStream = createWriteStream(destPath);
  const totalSize = Number.parseInt(response.headers.get("content-length") || "0");
  const fileName = path.basename(destPath);

  let downloadedBytes = 0;

  const baseMetadata = {
    name: fileName,
    url,
    path: destPath,
    size: totalSize,
  };

  const hash = createHash("sha1");

  try {
    emitter.emit(DOWNLOAD_EVENTS["download:start"], {
      ...baseMetadata,
      downloadSize: 0,
      progress: 0,
    });

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      hash.update(value);
      writeStream.write(value);
      downloadedBytes += value.length;

      emitter.emit(DOWNLOAD_EVENTS["download:progress"], {
        ...baseMetadata,
        downloadSize: downloadedBytes,
        progress: totalSize > 0
          ? Math.floor((downloadedBytes / totalSize) * 100)
          : 0,
      });
    }
  } finally {
    reader.releaseLock();
    writeStream.end();
  }

  const calculatedHash = hash.digest("hex");
  emitter.emit(DOWNLOAD_EVENTS["download:checksum_check"], {
    ...baseMetadata,
    expectedHash: sha1,
    calculatedHash,
  });

  if (calculatedHash === sha1) {
    emitter.emit(DOWNLOAD_EVENTS["download:completed"], {
      ...baseMetadata,
      downloadSize: downloadedBytes,
      progress: 100,
    });

    return;
  }

  try {
    await fs.promises.unlink(destPath);
    emitter.emit(DOWNLOAD_EVENTS["download:failed"], {
      ...baseMetadata,
      error: "Checksum mismatch",
    });
  } catch (_) {
    emitter.emit(DOWNLOAD_EVENTS["download:failed"], {
      ...baseMetadata,
      error: "Checksum mismatch and file deletion failed",
    });

    throw new Error(`Checksum validation failed and couldn't delete file ${fileName}.`);
  }
}

async function fetchWithRetry(url: string, maxRetries = 3) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const reader = response.body!.getReader();
      return { response, reader };
    } catch (e) {
      if (attempt === maxRetries) {
        throw e;
      }

      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }

  throw new Error("Unexpected error in fetchWithRetry");
}
