import { AttributeValue, DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DeleteCommand, DynamoDBDocumentClient, GetCommand, PutCommand, ScanCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { DoesNotExistError } from "../util/errors.js";

// Client that talks to dynamodb
const client = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(client);

// A reusable dc client that wraps around doc client and handles reusable logging logic
export class DbClient {
    tableName: string;
    
    constructor(tableName: string) {
        this.tableName = tableName;
    }

    async getRecord(key: any, consistentRead: boolean) {
        const getCommand = new GetCommand({
            TableName: this.tableName,
            Key: key,
            ConsistentRead: consistentRead
        });

        console.log(`Getting from table ${this.tableName} with key ${JSON.stringify(key)}`);

        const getResponse = await docClient.send(getCommand);
        if (getResponse.Item == undefined) {
            throw new DoesNotExistError();
        }
        
        return getResponse.Item;
    }

    async putRecord(record: any) {
        const putCommand = new PutCommand({
            TableName: this.tableName,
            Item: record
        });
        console.log(`Inserting into table ${this.tableName}`);
        await docClient.send(putCommand);
    }

    async deleteRecord(key: any) {
        const deleteCommand = new DeleteCommand({
            TableName: this.tableName,
            Key: key
        });
        console.log(`Deleting from table ${this.tableName} with key ${JSON.stringify(key)}`);
        await docClient.send(deleteCommand);
    }

    async updateRecord(key: any, updateExpression: string, expressionValues: Record<string, any>) {
        const updateCommand = new UpdateCommand({
            TableName: this.tableName,
            Key: key,
            UpdateExpression: updateExpression,
            ExpressionAttributeValues: expressionValues
        });
        console.log(`Update in table ${this.tableName} with expression ${updateExpression}`);
        await docClient.send(updateCommand);
    }

    async scanBatch(limit: number, filterExpression: string, expressionAttributeValues: Record<string, AttributeValue>, startKey: any) {
        // Query the next 50 Emails
        const scanCommand = new ScanCommand({
            TableName: this.tableName,
            Limit: limit,
            FilterExpression: filterExpression,
            ExpressionAttributeValues: expressionAttributeValues,
            ExclusiveStartKey: startKey
        });

        // Execute the query
        console.log(`Scanning in table ${this.tableName} with expression ${filterExpression}`);
        const scanResult = await docClient.send(scanCommand);
        const items = scanResult.Items;
        return items;
    }
}
