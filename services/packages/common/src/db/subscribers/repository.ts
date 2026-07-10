import { DoesNotExistError } from "../../util/errors.js";
import { DbClient } from "../dbClient.js";
import { Subscriber } from "./types.js";

// Table properties
const tableName = "site-newsletter-subscribers";

// Db client for this table
const dbClient = new DbClient(tableName);

function buildKey(email: string) {
    return {
        emailAddress: email
    };
}

// Add a new subscriber
export async function putSubscriberDb(subscriber : Subscriber) {
    await dbClient.putRecord(subscriber);
}

// Update subscriber
export async function updateSubscriberDb(subscriber : Subscriber) {
    const key = buildKey(subscriber.emailAddress);

    const updateExpression = "set verifiedStatus = :_verifiedStatus, validationToken = :_validationToken, tokenExpire = :_tokenExpire";

    const expressionAttributeValues = {
        ":_verifiedStatus": subscriber.verifiedStatus,
        ":_validationToken": subscriber.validationToken,
        ":_tokenExpire": subscriber.tokenExpire
    };
    
    await dbClient.updateRecord(key, updateExpression, expressionAttributeValues);
}

// Delete a subscriber entry
export async function deleteSubscriberDb(emailAddress : string) {
    const key = buildKey(emailAddress);
    
    await dbClient.deleteRecord(key);
}

// Grab a subscriber entry from the partition key (emailAddress)
export async function getSubscriberDb(emailAddress : string) {
    const key = buildKey(emailAddress);

    try {
        const item = await dbClient.getRecord(key, true);
        return item as unknown as Subscriber;     
    } catch (error) {
        if (error instanceof DoesNotExistError) {
            return null;
        }
        throw error;
    }
}

// Grab a chunk of verified subscribers
export async function getVerifiedSubscribersDb(limit: number, startEmail: string | undefined) : Promise<Subscriber[]> {
    const filterExpression = "verifiedStatus = :verifiedStatus";
    const expressionAttributeValues = {
        ":status": {
            S: "verified"
        }
    };
    const startKey = startEmail ? {
        "emailAddress": {
            S: startEmail
        }
    } : undefined;

    const items = await dbClient.scanBatch(limit, filterExpression, expressionAttributeValues, startKey);
    
    if (items == null) {
        return [];
    }
    else {
        return items as unknown as Subscriber[];
    }
}