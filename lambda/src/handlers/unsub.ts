import { unsub } from "../services/unsubService.js";

type UnsubEvent = {
    body: {
        emailAddress : string
    }
}

export const handler = async (event : UnsubEvent) => {
    console.log("Received event:", event);

    try {
        // Hand over to unsub service
        const email = event.body.emailAddress;
        console.log("Got email from event: " + email);
        unsub(email);
    } catch (error) {
        console.error(`Failed to process: ${error instanceof Error ? error.message : 'Unknown error'}`);
        throw error;
    }
};