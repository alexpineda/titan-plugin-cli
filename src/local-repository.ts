import readFolder from "./files";
import { readFileSync } from "fs";
import path from "node:path";
import { ExtractedPluginManifest } from "./plugin-manifest";
import { basename } from "path";

export const getLocalPluginManifest = (dir: string) => {
    const manifest = JSON.parse( readFileSync(path.join(dir, "package.json"), "utf-8") as any );
    const folderName = basename(dir);
    const sourceFolderPath = dir;

    return {
        manifest,
        folderName,
        sourceFolderPath,
    }
}

export const getLocalRepositoryManifests = (dir: string) => async () => {
    const files = await readFolder(
        dir
    );

    const manifests: ExtractedPluginManifest[] = [];
    
    for (const pkg of files) {
        if (!pkg.isFolder) continue;

        try {
            const plugin = getLocalPluginManifest(pkg.path);
            if (plugin.manifest.deprecated) {
                console.log("Skipping deprecated plugin", plugin.manifest.name);
                continue;
            }
            manifests.push(plugin);
        } catch (e) {
            console.error("Error reading plugin manifest", e);
        }
        

    }

    return { packages: manifests };
}