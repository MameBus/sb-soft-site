import { doesPageExist } from "@sb-soft/common/db/published";
import { DevLogFile, readFiles } from "./file-reader.js";
import { writeFile } from "node:fs/promises";

async function main() {
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
    await Promise.all(files.map(async (file) => {
        const isInDb = await doesPageExist(file.fileName);
        if (isInDb) {
            return;
        }
        filesToPublish.push(file);
    }));

    // Now write that to the output
    console.log(JSON.stringify(filesToPublish));
    writeFile(outFile, JSON.stringify(filesToPublish), 'utf-8');
}

main();