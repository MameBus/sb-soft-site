import { unsub } from "../services/unsubService.js";
import { APIGatewayProxyEventV2 } from "aws-lambda";

type UnsubEvent = {
    email : string
}

export const handler = async (event : APIGatewayProxyEventV2) => {
    console.log("Received event:", event);

    try {
        // Process the body
        const body = event.body;
        if (body == undefined) {
            throw new Error("Request is missing body");
        }
        const unsubEvent = JSON.parse(body) as UnsubEvent;
        const email = unsubEvent.email;

        // Hand over to unsub service
        console.log("Got email from event: " + email);
        await unsub(email);
    } catch (error) {
        console.error(`Failed to process: ${error instanceof Error ? error.message : 'Unknown error'}`);
        throw error;
    }
};