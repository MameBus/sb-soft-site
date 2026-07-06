import { isFileInDb } from "./dynamo-reader.js";
import { DevLogFile, readFiles } from "./file-reader.js";
import { writeFile } from "node:fs/promises";

// Read the command line arguments
const inDir = process.argv[2];
const outFile = process.argv[3];

if (inDir == undefined || outFile == undefined) {
    console.error('Missing arguments [inDir] [outDir]');
}

// Read and parse all of the files
const files = readFiles(inDir);

// Figure out which files need to be published
const filesToPublish: DevLogFile[] = [];
files.map(async (file) => {
    const discard = await isFileInDb(file.fileName);
    if (discard) {
        return;
    }
    filesToPublish.push(file);
});

// Now write that to the output
writeFile(outFile, JSON.stringify(filesToPublish), 'utf-8');