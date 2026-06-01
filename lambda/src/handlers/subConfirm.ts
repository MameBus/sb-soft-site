import { buildResponse } from "../services/responseService.js";
import { ConfirmOutcome, confirmSub } from "../services/subService.js";
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda"; 

type SubConfirmEvent = {
    email : string,
    token : string
}

export async function handler(event : APIGatewayProxyEventV2 ) : Promise<APIGatewayProxyResultV2> {
    console.log("Received event:", event);

    try {
        // Process the body
        const body = event.body;
        if (body == undefined) {
            throw new Error("Request is missing body");
        }
        const subConfirmEvent = JSON.parse(body) as SubConfirmEvent;
        const email = subConfirmEvent.email;
        const token = subConfirmEvent.token;

        console.log(`Got Email: ${email} and token ${token}`);
        const confirmResponse = await confirmSub(email, token);

        var responseCode;
        var responseMessage;
        switch (confirmResponse.actionOutcome) {
            case ConfirmOutcome.AlreadyVerified:
                responseCode = 200;
                responseMessage = "Already Verified";
                break;
            case ConfirmOutcome.Success:
                responseCode = 200;
                responseMessage = "Success";
                break;
            case ConfirmOutcome.Failed:
            default:
                responseCode = 400;
                responseMessage = "Verification Failed";
        }

        return buildResponse(responseCode, responseMessage);
    } catch (error) {
        console.error(`Failed to process: ${error instanceof Error ? error.message : 'Unknown error'}`);
        throw error;
    }
};