import readFolder from "./files";
import { readFileSync } from "fs";
import path from "node:path";
import { ExtractedPluginManifest } from "./plugin-manifest";


export const getLocalRepositoryManifests = (dir: string) => async () => {
    const files = await readFolder(
        dir
    );

    const manifests: ExtractedPluginManifest[] = [];
    
    for (const pkg of files) {
        if (!pkg.isFolder) continue;

        let manifest: any;
        try {
            manifest = JSON.parse( readFileSync(path.join(pkg.path, "package.json"), "utf-8") as any );
        } catch (error) {
            console.log("error reading package.json", pkg.path, error);
            continue;
        }
        console.log(manifest)
        const folderName = pkg.name;
        const sourceFolderPath = pkg.path;

        if (manifest.deprecated) {
            continue;
        }

        manifests.push({
            manifest,
            folderName,
            sourceFolderPath,
        });

    }

    return { packages: manifests };
}