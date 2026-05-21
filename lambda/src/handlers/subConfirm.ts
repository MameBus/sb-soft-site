import { confirmSub } from "../services/subService.js";

type SubConfirmEvent = {
    body: {
        emailAddress : string,
        token : string
    }
}

export const handler = async (event : SubConfirmEvent) => {
    console.log("Received event:", event);

    try {
        // Hand over to sub service
        const email = event.body.emailAddress;
        const token = event.body.token;
        console.log(`Got Email: ${email} and token ${token}`);
        confirmSub(email, token);
    } catch (error) {
        console.error(`Failed to process: ${error instanceof Error ? error.message : 'Unknown error'}`);
        throw error;
    }
};