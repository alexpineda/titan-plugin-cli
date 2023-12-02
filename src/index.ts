#!/usr/bin/env node
import { writeFileSync } from "fs";
import { build } from "./build";
import { buildAll } from "./build-all";
import { fileExists } from "./files";
import {
  getLocalPluginManifest,
  getLocalRepositoryManifests,
} from "./local-repository";
import { makeConfigTypes } from "./make-config-types";
import path from "path";

const args = process.argv.slice(2); // slice off the first two elements

// use the command line arguments as needed
if (args.length !== 3) {
  console.error(
    "Usage: titan-plugin-cli --plugins <path-to-plugins> <path-to-output>"
  );
  console.error(
    "Usage: titan-plugin-cli --plugin <path-to-plugin> <path-to-output>"
  );
  console.error(
    "Usage: titan-plugin-cli --plugin-types <path-to-plugin> <path-to-output>"
  );
  process.exit(1);
}

const tryBuild = async () => {
  const command = args[0];
  const srcDir = args[1];
  const outDir = args[2];
  if (command === "--plugins") {
    if (await fileExists(srcDir)) {
      buildAll(getLocalRepositoryManifests(srcDir), outDir);
    } else {
      console.error(`The path ${srcDir} does not exist.`);
      process.exit(1);
    }
  } else if (command === "--plugin") {
    if (await fileExists(srcDir)) {
      build(getLocalPluginManifest(srcDir), outDir);
    } else {
      console.error(`The path ${srcDir} does not exist.`);
      process.exit(1);
    }
  } else if (command === "--plugin-types") {
    const { manifest } = getLocalPluginManifest(srcDir);
    const types = makeConfigTypes(manifest.config, manifest.version);
    writeFileSync(path.join(outDir, `config-${manifest.version}.d.ts`), types);
  } else {
    console.error(`Unknown command ${command}`);
    process.exit(1);
  }
};

tryBuild();
