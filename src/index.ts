/* eslint-disable no-console */
import { Launcher } from "./launcher";
import { emitter, DOWNLOAD_EVENTS } from "./download-utils";
import { styleText } from "node:util";

const launcher = new Launcher({
  version: "1.21.7",
  versionType: "relase",
  auth: {
    name: "test"
  }
});

emitter.on(DOWNLOAD_EVENTS["download:start"], (data) => {
  console.log(`${styleText("green", "[START]")} Downloading ${data.name}`);
});

emitter.on(DOWNLOAD_EVENTS["download:progress"], (data) => {
  console.log(`${styleText("yellow", "[PROGRESS]")} ${data.progress}% of ${data.name}`);
});

emitter.on(DOWNLOAD_EVENTS["download:completed"], (data) => {
  console.log(`${styleText("cyan", "[COMPLETED]")} ${data.name} downloaded to ${data.path}`);
});

emitter.on(DOWNLOAD_EVENTS["download:skipped"], (data) => {
  console.log(`${styleText("grey", "[SKIPPED]")} ${data.name}`);
});

emitter.on(DOWNLOAD_EVENTS["download:failed"], (data) => {
  console.log(`${styleText("red", "[FAILED]")} ${data.name}`);
});

emitter.on(DOWNLOAD_EVENTS["download:checksum_check"], (data) => {
  console.log(`${styleText("magenta", "[CHECKSUM]")} Checking ${data.name}... Expected: ${data.expectedHash}, Calculated: ${data.calculatedHash}`);
});

await launcher.download();
await launcher.start();
