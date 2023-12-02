import path, { basename } from "node:path";
import esbuild from "esbuild";
import readFolder  from "./files";

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

export const buildMigrations = async (
  srcDir: string,
  outDir: string,
) => {
    
    const files = (await readFolder(
        srcDir
    )).filter(f => !f.isFolder).map(f => f.path)

    const outdir = path.join(outDir, "migrations" );

    await esbuild.build({
        entryPoints: files,
        bundle: true,
        format: "esm",
        outdir,
        external,
        keepNames: true,
    });

    return (await readFolder(
        outdir
    )).filter(f => !f.isFolder).map(f => `migrations/${f.name}.js`)
};
