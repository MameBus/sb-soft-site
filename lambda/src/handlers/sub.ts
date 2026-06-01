import { buildResponse } from "../services/responseService.js";
import { sub, SubOutcome } from "../services/subService.js";
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda"; 

type SubEvent = {
    email : string,
}

export async function handler(event : APIGatewayProxyEventV2 ) : Promise<APIGatewayProxyResultV2> {
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
        const subResponse = await sub(email);
        console.log(`Response was ${JSON.stringify(subResponse)}`);

        var responseCode;
        var responseMessage;
        switch (subResponse.actionOutcome) {
            case SubOutcome.AlreadyVerified:
                responseCode = 200;
                responseMessage = "Already Verified";
                break;
            case SubOutcome.VerificationSent:
                responseCode = 200;
                responseMessage = "Verification Sent";
                break;
            case SubOutcome.Failed:
            default:
                responseCode = 500;
                responseMessage = "Unexpected Failure";
        }

        return buildResponse(responseCode, responseMessage);
    } catch (error) {
        console.error(`Failed to process: ${error instanceof Error ? error.message : 'Unknown error'}`);
        throw error;
    }
};