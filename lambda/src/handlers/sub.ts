import { sub } from "../services/subService.js";
import { APIGatewayProxyEventV2 } from "aws-lambda"; 

type SubEvent = {
    email : string,
}

export const handler = async (event : APIGatewayProxyEventV2 ) => {
    console.log("Received event:", event);

    try {
        // Process the body
        const body = event.body;
        if (body == undefined) {
            throw new Error("Request is missing body");
        }
        const subEvent = JSON.parse(body) as SubEvent;
        const email = subEvent.email;

        console.log("Got email from event: " + email);
        await sub(email);
    } catch (error) {
        console.error(`Failed to process: ${error instanceof Error ? error.message : 'Unknown error'}`);
        throw error;
    }
};