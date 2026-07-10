import { AlreadyExistsError } from "../../util/errors.js";
import { getPublishedDb, putPublishedDb } from "./repository.js";

// Add a new page into persistence
export async function addPage(pageName: string) {
    // Try to get first to make sure it doesn't already exist
    const published = await getPublishedDb(pageName);

    if (published == null) {
        throw new AlreadyExistsError();
    }

    // Otherwise we can chuck it in
    await putPublishedDb(pageName);
}

// Verify whether a page exists already
export async function doesPageExist(pageName: string) {
    // Try to get it
    const published = await getPublishedDb(pageName);

    return published != null;
}