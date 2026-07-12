import { getVerifiedSubscribers, rerollToken, Subscriber } from "@sb-soft/common/db/subscribers";
import { sesApiLimit, usersPerBatch } from "./config.js";
import { newDevlogTemplate, sendTemplateEmail } from "@sb-soft/common/ses";
import { sleep } from "./util.js";
import { addPage } from "@sb-soft/common/db/published";

// Declare some types
type Notification = {
    fileName: string,
    snippit: string
};

async function markNotificationsPublished(notifications: Notification[]) {
    // Just put each notification into the published table
    for (const notification of notifications) {
        addPage(notification.fileName);
    }
}

async function sendNotifications(notifications: Notification[]) {
    // Loop by batch of users
    var nextKey = undefined;
    do {
        // Query the next batch of users
        const nextSubscribers = await getVerifiedSubscribers(usersPerBatch, nextKey);
        
        for (const subscriber of nextSubscribers) {
            await sendAllNotificationsForUser(subscriber, notifications);
        }

        // Take not of the next start key for the next run if there was even any returned this go
        nextKey = nextSubscribers.length == 0 ? undefined : nextSubscribers[-1].emailAddress;
    } while (nextKey);
}

async function sendAllNotificationsForUser(subscriber: Subscriber, notifications: Notification[]) {
    // Cycle the users unsubscribe token, so we'll send out all emails with the same token
    const newToken = await rerollToken(subscriber.emailAddress);

    // For each user we're going to send out each email one by one
    for (const notification of notifications) {
        const template = newDevlogTemplate({
            email: subscriber.emailAddress,
            token: newToken,
            logid: notification.fileName,
            preview: notification.snippit
        });
        sendTemplateEmail(subscriber.emailAddress, template);
        
        // Need to wait to send the next one to make sure we don't hit our rate limit
        await sleep((1 / sesApiLimit) * 1000);
    }
}

async function main() {
    // Read the notifications to send out via environment variables
    const notificationsRaw = process.env.NOTIFICATIONS;

    if (notificationsRaw == undefined) {
        console.error('Missing NOTIFICATIONS environment variable.');
        process.exit(1);
    }

    const notifications = JSON.parse(notificationsRaw) as Notification[];

    console.log(`Got notifications from env as: ${JSON.stringify(notifications)}`);

    // We want to mark each notification as published
    const notificationsPublished = markNotificationsPublished(notifications);

    // Actually send out the notifications
    const notificationsSent = sendNotifications(notifications);

    // Wait for everything to be done before we quit out
    await Promise.all([notificationsPublished, notificationsSent]);
}

main();