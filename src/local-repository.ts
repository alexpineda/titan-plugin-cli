import readFolder from "./files";
import { readFileSync } from "fs";
import path from "node:path";
import { ExtractedPluginManifest } from "./plugin-manifest";
import semver from "semver";


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

        if (manifest.peerDependencies && manifest.peerDependencies["@titan-reactor-runtime/host"] && manifest.peerDependencies["@titan-reactor-runtime/ui"]) {
            // semver major and minor must match
            const hostVersion = manifest.peerDependencies["@titan-reactor-runtime/host"];
            const uiVersion = manifest.peerDependencies["@titan-reactor-runtime/ui"];
            if (semver.major(hostVersion) !== semver.major(uiVersion) || semver.minor(hostVersion) !== semver.minor(uiVersion)) {
                console.log("Host and UI peer dependencies versions must match. Skipping", folderName);
                continue;
            }
        }

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