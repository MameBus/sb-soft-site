import { AlreadyExistsError, DoesNotExistError } from "../../util/errors.js";
import { newToken, validateToken } from "../../util/token.js";
import { deleteSubscriberDb, getSubscriberDb, getVerifiedSubscribersDb, putSubscriberDb, updateSubscriberDb } from "./repository.js";
import { defaultVerifiedStatus, Subscriber, VerifiedStatus } from "./types.js";

export async function getSubscriber(email : string) {
    console.log("Getting the subscriber record");
    const subscriber = await getSubscriberDb(email);
    console.log(`Got subscriber as: ${subscriber}`);
    return subscriber;
}

// Create a brand new unverified subscriber and return the access token
export async function createNewSubscriber(email : string) {
    // First try to pull it down
    const subscriber = await getSubscriberDb(email);

    // If it does exist, then we can't add it in
    if (subscriber != null) {
        throw new AlreadyExistsError();
    }

    // Does not exist, so we can make it
    console.log("Subscriber, does not exist, adding new");
    
    const token = newToken();
    const newSubscriber : Subscriber = {
        emailAddress: email,
        verifiedStatus: defaultVerifiedStatus,
        validationToken: token.hash,
        tokenExpire: token.expires
    };

    await putSubscriberDb(newSubscriber);

    return {
        subscriber: newSubscriber,
        rawToken: token.raw
    };
}

// Try to delete a subscriber
export async function deleteSubscriber(email : string) {
    // First try to pull it down
    const subscriber = await getSubscriberDb(email);

    if (subscriber == null) {
        throw new DoesNotExistError();
    }

    await deleteSubscriberDb(email);
}

// Reroll a subscribers token and return the new raw token
export async function rerollToken(email : string) : Promise<string> {
    const subscriber = await getSubscriberDb(email);

    // Don't do anything if it doesn't actually exist
    if (subscriber == null) {
        throw new DoesNotExistError();
    }

    const token = newToken();

    const updatedSubscriber : Subscriber = {
        emailAddress: email,
        verifiedStatus: subscriber.verifiedStatus,
        validationToken: token.hash,
        tokenExpire: token.expires
    };

    await updateSubscriberDb(updatedSubscriber);

    return token.raw;
}

// Update the status of a subscriber
export async function updateStatus(email: string, newStatus: VerifiedStatus) {
    // Pull down the account first
    const subscriber = await getSubscriberDb(email);

    if (subscriber == null) {
        throw new DoesNotExistError();
    }

    // Now update the status
    subscriber.verifiedStatus = newStatus;

    // Now do the update
    await updateSubscriberDb(subscriber);
}

// Verify an auth token
export async function verifyAuth(email: string, token: string) {
    // Pull down the account first
    const subscriber = await getSubscriberDb(email);

    if (subscriber == null) {
        throw new DoesNotExistError();
    }

    return validateToken(token, subscriber.validationToken, subscriber.tokenExpire);
}

// Scan a batch of verified subscribers
export async function getVerifiedSubscribers(limit: number, startEmail: string | undefined) {
    const subscribers = await getVerifiedSubscribersDb(limit, startEmail);
    return subscribers;
}

export {Subscriber, VerifiedStatus} from './types.js';
