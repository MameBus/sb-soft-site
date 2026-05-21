import { confirmUnsub } from "../services/unsubService.js";
import { APIGatewayProxyEventV2 } from "aws-lambda";

type UnsubConfirmEvent = {
    email : string,
    token : string
}

export const handler = async (event : APIGatewayProxyEventV2) => {
    console.log("Received event:", event);

    try {
        // Process the body
        const body = event.body;
        if (body == undefined) {
            throw new Error("Request is missing body");
        }
        const unsubConfirmEvent = JSON.parse(body) as UnsubConfirmEvent;
        const email = unsubConfirmEvent.email;
        const token = unsubConfirmEvent.token;

        // Hand over to unsub service
        console.log(`Got Email: ${email} and token ${token}`);
        await confirmUnsub(email, token);
    } catch (error) {
        console.error(`Failed to process: ${error instanceof Error ? error.message : 'Unknown error'}`);
        throw error;
    }
};