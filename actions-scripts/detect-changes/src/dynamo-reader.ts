import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";

const tableName = 'site-published-pages';

// Client that talks to dynamodb
const client = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(client);

function buildKey(fileName: string) {
    return {
        pageName: fileName
    };
}

// Just checks if a file name is present as a key in the dynamo db table
export async function isFileInDb(fileName: string) {
    const getCommand = new GetCommand({
        TableName: tableName,
        Key: buildKey(fileName)
    });
    console.log(`Getting from db with command ${JSON.stringify(getCommand)}`);
    const getResponse = await docClient.send(getCommand);
    if (getResponse == null) {
        return false; // Is not in db
    }
    else {
        return true; // Is in db
    }
}