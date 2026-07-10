import { ScanCommand } from "@aws-sdk/client-dynamodb";
import { docClient, subscribersTable } from "./dbClient";

// Response telling the outside where we're up to on sending emails out
type EmailBatch = {
    emails: string[],
    nextStartKey: string | undefined // This will be undefined when we've reached the end
};

const limit = 50;

export async function getNextEmailsBatch(startKey: string | undefined) : Promise<EmailBatch> {
    // Query the next 50 Emails
    const scanCommand = new ScanCommand({
        TableName: subscribersTable,
        Limit: limit,
        FilterExpression: "verifiedStatus = :verifiedStatus",

        ExpressionAttributeValues: {
            ":status": {
                S: "verified"
            }
        },

        ExclusiveStartKey: 
            startKey ? {
                "emailAddress": {
                    S: startKey
                }
            }
            : undefined
    });

    // Execute the query
    const scanResult = await docClient.send(scanCommand);
    const items = scanResult.Items;

    if (items == undefined) { // There are none
        return {
            emails: [],
            nextStartKey: undefined
        };
    }

    // Extract the emails from the result
    const results : string[] = [];
    items.map((item) => {
        const email = item['email'].S;
        if (email == undefined) {
            console.error(`Results do not match expected structure. Item looked like ${results}`);
            throw Error();
        }
        results.push(email);
    });

    // Grab the last evaluated key
    var nextKey = undefined;
    const lastEvaluatedKey = scanResult.LastEvaluatedKey;
    if (lastEvaluatedKey != undefined) {
        nextKey = lastEvaluatedKey['emailAddress'].S;
    }

    return {
        emails: results,
        nextStartKey: nextKey
    };
}