import path from "node:path";
import { writeFileSync } from "node:fs";
import { ExtractedPluginManifest } from "./plugin-manifest";
import { BuiltPackage, build } from "./build";

type Repository = () => Promise<{
    packages: ExtractedPluginManifest[];
    cleanup?: () => void;
}>;


export const buildAll = async (repository: Repository, outDir: string) => {
    const { packages, cleanup } = await repository();

    const index = new Map<string, BuiltPackage>();

    for (const { sourceFolderPath, manifest, folderName } of packages) {
        const result = await build({ sourceFolderPath, manifest, folderName }, outDir);
        if (result) {
            index.set(result.name, result);
        }
    }

    if (cleanup) {
        cleanup();
    }

    const indexJson = {
        indexVersion: 2,
        packages: [...index.values()],
    }

    writeFileSync(path.join(outDir, "index.json"), JSON.stringify(indexJson));
};
