import matter from "gray-matter";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

// Handles reading each file and parsing it into a usable format
export type DevLogFile = {
    fileName: string,
    snippit: string
}

// Read each file and format contents
export function readFiles(directory: string) : DevLogFile[] {
    const files = readdirSync(directory);

    const result : DevLogFile[] = [];

    files.map((file) => {
        console.log(`Reading file ${file}`);
        
        var fileContentsRaw;
        try {
            fileContentsRaw = readFileSync(join(directory, file)).toString();    
        } catch (error) {
            console.log(error);
            return;
        }
        
        console.log(`File contents are ${fileContentsRaw}`);

        // Process using gray-matter so we can read front matter
        const fileContentsProcessed = matter(fileContentsRaw);
        const snippit = fileContentsProcessed.data['snippit'];
        if (snippit == undefined) {
            console.log("Doesn't match formatting, skipping");
            return;
        }

        console.log("Valid contents, adding");
        result.push({
            fileName: file,
            snippit: snippit
        });       
    });

    return result;
}