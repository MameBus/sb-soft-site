import { confirmSub, sub } from "../services/subService.js";

type SubConfirmEvent = {
    emailAddress : string,
    token : string
}

export const handler = async (event : SubConfirmEvent) => {
    console.log("Received event:", event);

    try {
        // Hand over to sub service
        confirmSub(event.emailAddress, event.token);
    } catch (error) {
        console.error(`Failed to process: ${error instanceof Error ? error.message : 'Unknown error'}`);
        throw error;
    }
};