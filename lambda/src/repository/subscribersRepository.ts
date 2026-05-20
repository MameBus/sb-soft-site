import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

import {
    GetCommand,
    QueryCommand,
    UpdateCommand,
    DeleteCommand,
    PutCommand,
    DynamoDBDocumentClient
} from "@aws-sdk/lib-dynamodb";
import { Subscriber } from "../models/subscriber";

// Client that talks to dynamodb
const client = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(client);

// Table properties
const tableName = "newsletter_subscribers";

// Add a new subscriber
export async function putSubscriber(subscriber : Subscriber) {
    const putCommand = new PutCommand({
        TableName: tableName,
        Item: subscriber
    });  
    docClient.send(putCommand);
}

// Update subscriber
export async function updateSubscriber(subscriber : Subscriber) {
    const updateCommand = new UpdateCommand({
        TableName: tableName,
        Key: {
            emailAddress: subscriber.emailAddress
        },
        UpdateExpression: "set verified = :_verified, token = :_token, tokenExpire = :_tokenExpire",
        ExpressionAttributeValues: {
            ":_verified": subscriber.verified,
            ":_token": subscriber.token,
            ":_tokenExpire": subscriber.tokenExpire
        }
    });
    docClient.send(updateCommand);
}

// Delete a subscriber entry
export async function deleteSubscriber(emailAddress : string) {
    const deleteCommand = new DeleteCommand({
        TableName: tableName,
        Key: {
            emailAddress: emailAddress
        }
    });
    docClient.send(deleteCommand);
}

// Grab a subscriber entry from the partition key (emailAddress)
export async function getSubscriber(emailAddress : string) {
    const getCommand = new GetCommand({
        TableName: tableName,
        Key: {
            emailAddress
        },
        ConsistentRead: true
    });
    const getResponse = await docClient.send(getCommand);
    if (getResponse == null) {
        return null;
    }
    return getResponse.Item as Subscriber; 
}

// Grab all subscribers with state validated
export async function getAllValidatedSubscribers() {
    const queryCommand = new QueryCommand({
        TableName: tableName,
        KeyConditionExpression:
            "verified = :_verified",
        ExpressionAttributeValues: {
            ":_verified": true 
        },
        ConsistentRead: false // Eventual consistency is okay here
    });

    const response = await docClient.send(queryCommand);
    if (response.Items == null) {
        return null;
    }
    const subscribers : Subscriber[] = new Array(response.Items.length);
    response.Items.map((item) => {
        subscribers.push(item as Subscriber);
    });
    return subscribers;
}
