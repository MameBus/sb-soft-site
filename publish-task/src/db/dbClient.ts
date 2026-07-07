import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

// Client that talks to dynamodb
const client = new DynamoDBClient();
export const docClient = DynamoDBDocumentClient.from(client);

export const subscribersTable = 'site-newsletter-subscribers';
export const notificationsTable = 'site-published-pages';