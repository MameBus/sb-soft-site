import { DoesNotExistError } from "../../util/errors.js";
import { DbClient } from "../dbClient.js";
import { Published } from "./types.js";

// Table properties
const tableName = "site-published-pages";

// Db client for this table
const dbClient = new DbClient(tableName);

function buildKey(pageName: string) {
    return {
        pageName: pageName
    };
}

export async function putPublishedDb(pageName: string) {
    const published : Published = {
        pageName: pageName
    };
    
    await dbClient.putRecord(published);
}

export async function getPublishedDb(pageName: string) {
    try {
        return await dbClient.getRecord(buildKey(pageName), true);        
    } catch (error) {
        if (error instanceof DoesNotExistError) {
            return null;
        }
        throw error;
    }
}
