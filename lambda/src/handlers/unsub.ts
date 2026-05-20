import { unsub } from "../services/unsubService";

type UnsubEvent = {
    emailAddress : string
}

export const handler = async (event : UnsubEvent) => {
    console.log("Received event:", event);

    try {
        // Hand over to unsub service
        unsub(event.emailAddress);
    } catch (error) {
        console.error(`Failed to process: ${error instanceof Error ? error.message : 'Unknown error'}`);
        throw error;
    }
};