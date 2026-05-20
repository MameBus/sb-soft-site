import { sub } from "../services/subService.js";

type SubEvent = {
    emailAddress : string
}

export const handler = async (event : SubEvent) => {
    console.log("Received event:", event);

    try {
        // Hand over to sub service
        sub(event.emailAddress);
    } catch (error) {
        console.error(`Failed to process: ${error instanceof Error ? error.message : 'Unknown error'}`);
        throw error;
    }
};