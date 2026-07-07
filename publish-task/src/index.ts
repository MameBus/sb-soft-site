import { getNextEmailsBatch } from "./db/subscribersDb";

// Declare some types
type Notification = {
    fileName: string,
    snippit: string
};

async function main() {
    // Read the notifications to send out via environment variables
    const notificationsRaw = process.env.NOTIFICATIONS;
    const limitPerSecond = 14; // The limit of how many SES API calls we can send out per second

    if (notificationsRaw == undefined) {
        console.error('Missing NOTIFICATIONS environment variable.');
        process.exit(1);
    }

    const notifications = JSON.parse(notificationsRaw) as Notification[];

    console.log(`Got notifications from env as: ${JSON.stringify(notifications)}`);

    // Go by users so that we only have to hit the db once per user
    var done = false;

    var nextKey = undefined;
    do {
        // Query the next batch of users
        const nextEmailsBatch = await getNextEmailsBatch(nextKey);

        // Cycle the users unsubscribe token, so we'll send out all emails with the same token
        

        // For each user we're going to send out each email one by one


        // Take not of the next start key for the next run
        nextKey = nextEmailsBatch.nextStartKey
    } while (nextKey);

    // Now we're done we need to mark each notification as sent
    notifications.map((notification) => {

    });
}

main();