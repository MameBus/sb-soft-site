import { confirmUnsub } from "../services/unsubService.js";

type UnsubConfirmEvent = {
    body: {
        emailAddress : string,
        token : string
    }
}

export const handler = async (event : UnsubConfirmEvent) => {
    console.log("Received event:", event);

    try {
        // Hand over to unsub service
        const email = event.body.emailAddress;
        const token = event.body.token;
        console.log(`Got Email: ${email} and token ${token}`);
        confirmUnsub(email, token);
    } catch (error) {
        console.error(`Failed to process: ${error instanceof Error ? error.message : 'Unknown error'}`);
        throw error;
    }
};