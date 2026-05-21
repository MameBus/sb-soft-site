import { confirmSub } from "../services/subService.js";
import { APIGatewayProxyEventV2 } from "aws-lambda"; 

type SubConfirmEvent = {
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
        const subConfirmEvent = JSON.parse(body) as SubConfirmEvent;
        const email = subConfirmEvent.email;
        const token = subConfirmEvent.token;

        console.log(`Got Email: ${email} and token ${token}`);
        await confirmSub(email, token);
    } catch (error) {
        console.error(`Failed to process: ${error instanceof Error ? error.message : 'Unknown error'}`);
        throw error;
    }
};