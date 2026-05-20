import { sub } from "../services/subService.js";
import { confirmUnsub } from "../services/unsubService.js";

type UnsubConfirmEvent = {
    emailAddress : string,
    token : string
}

export const handler = async (event : UnsubConfirmEvent) => {
    console.log("Received event:", event);

    try {
        // Hand over to unsub service
        confirmUnsub(event.emailAddress, event.token);
    } catch (error) {
        console.error(`Failed to process: ${error instanceof Error ? error.message : 'Unknown error'}`);
        throw error;
    }
};