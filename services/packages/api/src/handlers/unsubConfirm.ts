import { buildResponse } from "../services/responseService.js";
import { confirmUnsub } from "../services/unsubService.js";
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";

type UnsubConfirmEvent = {
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
        const unsubConfirmEvent = JSON.parse(body) as UnsubConfirmEvent;
        const email = unsubConfirmEvent.email;
        const token = unsubConfirmEvent.token;

        // Hand over to unsub service
        console.log(`Got Email: ${email} and token ${token}`);
        const confirmUnsubResult = await confirmUnsub(email, token);

        var responseCode;
        var responseMessage;
        switch (confirmUnsubResult) {
            case true:
                responseCode = 200;
                responseMessage = "Success"
                break;
            case false:
            default:
                responseCode = 400;
                responseMessage = "Verification Failed"
                break;
        }
        
        return buildResponse(responseCode, responseMessage);
    } catch (error) {
        console.error(`Failed to process: ${error instanceof Error ? error.message : 'Unknown error'}`);
        throw error;
    }
};