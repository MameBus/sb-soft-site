import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

import {
    GetCommand,
    QueryCommand,
    UpdateCommand,
    DeleteCommand,
    PutCommand,
    DynamoDBDocumentClient
} from "@aws-sdk/lib-dynamodb";
import { Subscriber } from "../models/subscriber.js";

// Client that talks to dynamodb
const client = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(client);

// Table properties
const tableName = "site-newsletter-subscribers";

// Add a new subscriber
export async function putSubscriber(subscriber : Subscriber) {
    const putCommand = new PutCommand({
        TableName: tableName,
        Item: subscriber
    });
    console.log("Putting subscriber with command: " + JSON.stringify(putCommand));
    await docClient.send(putCommand);
}

// Update subscriber
export async function updateSubscriber(subscriber : Subscriber) {
    const updateCommand = new UpdateCommand({
        TableName: tableName,
        Key: {
            emailAddress: subscriber.emailAddress
        },
        UpdateExpression: "set verifiedStatus = :_verifiedStatus, validationToken = :_token, tokenExpire = :_tokenExpire",
        ExpressionAttributeValues: {
            ":_verifiedStatus": subscriber.verifiedStatus,
            ":_validationToken": subscriber.validationToken,
            ":_tokenExpire": subscriber.tokenExpire
        }
    });
    console.log("Updating subscriber with command: " + JSON.stringify(updateCommand));
    await docClient.send(updateCommand);
}

// Delete a subscriber entry
export async function deleteSubscriber(emailAddress : string) {
    const deleteCommand = new DeleteCommand({
        TableName: tableName,
        Key: {
            emailAddress: emailAddress
        }
    });
    console.log("Deleting subscriber with command: " + JSON.stringify(deleteCommand));
    await docClient.send(deleteCommand);
}

// Grab a subscriber entry from the partition key (emailAddress)
export async function getSubscriber(emailAddress : string) {
    const getCommand = new GetCommand({
        TableName: tableName,
        Key: {
            emailAddress: emailAddress
        },
        ConsistentRead: true
    });
    console.log("Getting subscriber with command: " + JSON.stringify(getCommand));
    const getResponse = await docClient.send(getCommand);
    if (getResponse == null) {
        console.log("Didn't get a value, returning null");
        return null;
    }
    console.log("Got value: " + JSON.stringify(getResponse.Item));
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
    console.log("Querying for all validated subscribers with command: " + JSON.stringify(queryCommand));

    const response = await docClient.send(queryCommand);
    if (response.Items == null) {
        console.log("Response was null, returning null");
        return null;
    }
    console.log("Got " + response.Items.length + " responses");
    const subscribers : Subscriber[] = new Array(response.Items.length);
    response.Items.map((item) => {
        subscribers.push(item as Subscriber);
    });
    return subscribers;
}
