import { writeFile } from "node:fs/promises";

export async function writeToFile(fileContents: string, fileDir: string) {
    await writeFile(fileDir, fileContents, 'utf-8');
}