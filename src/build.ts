import path, { basename } from "node:path";
import esbuild from "esbuild";
import { fileExists } from "./files";

import { copyFileSync, writeFileSync } from "node:fs";
import { ExtractedPluginManifest } from "./plugin-manifest";
import { makeConfigTypes } from "./make-config-types";
import sanitize from "sanitize-filename";
import { buildMigrations } from "./build-migrations";

const external = [
  "@titan-reactor-runtime/ui",
  "@titan-reactor-runtime/host",
  "react",
  "three",
  "camera-controls",
  "react-dom",
  "zustand",
  "react-dom/test-utils",
];

function generateUID() {
  let firstPart = (Math.random() * 46656) | 0;
  let secondPart = (Math.random() * 46656) | 0;
  return (
    ("000" + firstPart.toString(36)).slice(-3) +
    ("000" + secondPart.toString(36)).slice(-3)
  );
}

export type BuiltPackage = {
  rootUrl: string;
  name: string;
  version: string;
  description: string;
  files: string[];
};

export const build = async (
  { sourceFolderPath, manifest, folderName }: ExtractedPluginManifest,
  outDir: string
): Promise<BuiltPackage | null> => {
  if (manifest.deprecated) {
    return null;
  }
  // if (manifest.peerDependencies && manifest.peerDependencies["@titan-reactor-runtime/host"] && manifest.peerDependencies["@titan-reactor-runtime/ui"]) {
  //     // semver major and minor must match
  //     const hostVersion = manifest.peerDependencies["@titan-reactor-runtime/host"];
  //     const uiVersion = manifest.peerDependencies["@titan-reactor-runtime/ui"];
  //     if (semver.major(hostVersion) !== semver.major(uiVersion) || semver.minor(hostVersion) !== semver.minor(uiVersion)) {
  //         console.log("Host and UI peer dependencies versions must match. Skipping", folderName);
  //         continue;
  //     }
  // }
  const hostFilePath = path.join(sourceFolderPath, "src", "index.ts");
  const uiFilePath = path.join(sourceFolderPath, "src", "components", "index");

  const searchFiles = [
    { path: hostFilePath, type: "host.js" },
    { path: uiFilePath + ".tsx", type: "ui.js" },
    { path: uiFilePath + ".jsx", type: "ui.js" },
  ];

  const files: { path: string; type: string }[] = [];

  for (const file of searchFiles) {
    if (await fileExists(file.path)) {
      files.push(file);
    }
  }

  if (files.length === 0) {
    console.warn("no files found for", manifest.name);
    return null;
  }

  const outFolderName = generateUID() + "-" + sanitize(folderName);

  const idx: {
    name: string;
    version: string;
    description: string;
    rootUrl: string;
    files: string[];
  } = {
    name: manifest.name,
    version: manifest.version,
    description: manifest.description,
    rootUrl: outFolderName,
    files: [],
  };

  console.log(`building ${path.join(outFolderName)}`);


  for (const file of files) {

    try {
      const outfile = path.join(outDir, outFolderName, "dist", file.type);

      await esbuild.build({
        entryPoints: [file.path],
        bundle: true,
        format: "esm",
        outfile,
        external,
        banner: {
          js:
            file.type === "ui.js"
              ? `import { _rc } from "@titan-reactor-runtime/ui"; const registerComponent = (...args) => _rc("${manifest.name}", ...args);`
              : "",
        },
      });

      idx.files.push(basename(outfile));
    } catch (error) {
      throw new Error(
        "error building " + file.path + " " + (error as Error).message
      );
    }
  }

  try {
    if (await fileExists(path.join(sourceFolderPath, "src", "migrations"))) {
      idx.files.push(...await buildMigrations(path.join(sourceFolderPath, "src", "migrations"), path.join(outDir, outFolderName, "dist")));
    }
  } catch (error) {
    console.error("error building migrations", error);
  }

  try {
    copyFileSync(
      path.join(sourceFolderPath, "package.json"),
      path.join(outDir, outFolderName, "package.json")
    );

    const types = makeConfigTypes(manifest.config, manifest.version);
    writeFileSync(
      path.join(outDir, outFolderName, `config-${manifest.version}.d.ts`),
      types
    );

    if (await fileExists(path.join(sourceFolderPath, "readme.md"))) {
      idx.files.push("readme.md");
      copyFileSync(
        path.join(sourceFolderPath, "readme.md"),
        path.join(outDir, outFolderName, "readme.md")
      );
    }
    console.log(idx)
    return idx;
  } catch (error) {
    console.error("error building manifest", error);
  }
  return null;
};
