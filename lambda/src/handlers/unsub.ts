import { buildResponse } from "../services/responseService.js";
import { unsub, UnsubOutcome } from "../services/unsubService.js";
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";

type UnsubEvent = {
    email : string
}

export async function handler(event : APIGatewayProxyEventV2 ) : Promise<APIGatewayProxyResultV2> {
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
        const unsubResult = await unsub(email);

        var responseCode;
        var responseMessage;
        switch (unsubResult.actionOutcome) {
            case UnsubOutcome.NotVerified:
                responseCode = 200,
                responseMessage = "Not verified"
                break;
            case UnsubOutcome.Success:
                responseCode = 200,
                responseMessage = "Success";
                break;
            case UnsubOutcome.Failed:
            default:
                responseCode = 500,
                responseMessage = "Unexpected Issue"
        }

        return buildResponse(responseCode, responseMessage);
    } catch (error) {
        console.error(`Failed to process: ${error instanceof Error ? error.message : 'Unknown error'}`);
        throw error;
    }
};