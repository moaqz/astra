/* eslint-disable no-console */
import { Launcher } from "./launcher";
import { emitter, DOWNLOAD_EVENTS } from "./download-utils";
import { styleText } from "node:util";

const launcher = new Launcher({
  version: "1.21.5",
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

await launcher.download();
