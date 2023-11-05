#!/usr/bin/env node
import {build} from "./build-plugins";
import { fileExists } from "./files";
import {getLocalRepositoryManifests} from "./local-repository";

const args = process.argv.slice(2); // slice off the first two elements

// use the command line arguments as needed
if (args.length !== 2) {
    console.error("Usage: build-plugins <path-to-repository> <path-to-output>");
    process.exit(1);
}

const tryBuild = async () => {
    if (await fileExists(args[0]) && await fileExists(args[1])) {
        build( getLocalRepositoryManifests( args[0] ), args[1] );
    }
}

tryBuild();