import { TOKEN_TTL } from "../config/tokenConfig.js";
import { Subscriber, verifiedStatusValues } from "../models/subscriber.js";
import { deleteSubscriber, getSubscriber, putSubscriber, updateSubscriber } from "../repository/subscribersRepository.js";
import { generateRandomToken, generateTokenExpiry, hashToken, tokenInDate, validateToken } from "./tokenService.js";

export enum CreateSubscriberOutcome {
    Success,
    AlreadyExists
}

export enum SetStatusOutcome {
    Success,
    AlreadyAtStatus,
    InvalidToken,
    OutdatedToken,
    OtherError
}

type CreateSubscriberResult = {
    actionOutcome: CreateSubscriberOutcome,
    state: string,
    nextToken?: string
}

type SetSubscriberStatusResult = {
    actionOutcome: SetStatusOutcome,
    nextToken?: string
}

type RerollTokenResult = {
    success: boolean,
    status?: string,
    nextToken?: string
}

async function getSubscriberFromDb(email : string) {
    console.log("Getting the subscriber record");
    const subscriber = await getSubscriber(email);
    console.log(`Got subscriber as: ${subscriber}`);
    return subscriber;
}

// Create a brand new unverified subscriber
export async function createNewSubscriber(email : string) : Promise<CreateSubscriberResult> {
    // First try to pull it down
    const subscriber = await getSubscriberFromDb(email);

    // If it does exist, then we're just going to return it's current state
    if (subscriber != null) {
        console.log("Subscriber found to already exist. Cancelling create new");
        const currentState = subscriber.verifiedStatus;
        return {
            actionOutcome: CreateSubscriberOutcome.AlreadyExists,
            state: currentState
        }
    }

    // Does not exist, so we can make a brand new one
    console.log("Subscriber, does not exist, adding new");
    const newToken = generateRandomToken();
    const hash = hashToken(newToken);
    const expiry = generateTokenExpiry(TOKEN_TTL).toISOString();
    const status = verifiedStatusValues.awaiting;
    const newSubscriber : Subscriber = {
        emailAddress: email,
        verifiedStatus: status,
        validationToken: hash,
        tokenExpire: expiry
    }
    await putSubscriber(newSubscriber);

    return {
        actionOutcome: CreateSubscriberOutcome.Success,
        state: status,
        nextToken: newToken
    }
}

// Try to delete a subscriber
export async function tryDeleteSubscriber(email : string, token : string) : Promise<Boolean> {
    // First try to pull it down
    const subscriber = await getSubscriberFromDb(email);

    // If we didn't find the subscriber or they aren't verified anyway, then we don't do anything
    if (subscriber == null || subscriber.verifiedStatus == verifiedStatusValues.awaiting) {
        console.log("Couldn't find subscriber or they aren't verified");
        return true;
    }

    // Otherwise we just compare the token we got with the hashed token in the record and check the expiry
    if (validateToken(token, subscriber.validationToken) && subscriber.tokenExpire > new Date().toISOString()) { // Valid
        console.log("Token was validated doing a delete");
        await deleteSubscriber(email);
        return true;
    }

    // If we get here then the token wasn't valid for one reason or another
    return false;
}

// Change the status for a given email. Validates the token and will generate a new token once the action is performed
export async function setSubscriberStatus(email : string, token : string, targetStatus : string) : Promise<SetSubscriberStatusResult> {
    // First pull down the record for the given email
    const subscriber = await getSubscriberFromDb(email);

    // If we didn't find the subscriber the result is an error
    if (subscriber == null) {
        console.log("Couldn't find subscriber");
        return { actionOutcome: SetStatusOutcome.OtherError }
    }

    // Check if the status already matches target, if so no need to actually do anything
    if (subscriber?.verifiedStatus == targetStatus) {
        console.log(`Status is already ${targetStatus}`);
        return { actionOutcome: SetStatusOutcome.AlreadyAtStatus };
    }

    // Now check if the token is correct
    if (!validateToken(token, subscriber.validationToken)) {
        console.log("Token does not match");
        return { actionOutcome: SetStatusOutcome.InvalidToken }
    }

    // Now check if the token is still in date
    if (!tokenInDate(subscriber.tokenExpire)) {
        console.log("Token has expired");
        return { actionOutcome: SetStatusOutcome.OutdatedToken }
    }

    // If we got here then it's all valid and we can perform the action
    console.log("Token has been validated, updating status and generating new token");

    const newToken = generateRandomToken();
    const hash = hashToken(newToken);
    const expiry = generateTokenExpiry(TOKEN_TTL).toISOString();

    const updatedSubscriber : Subscriber = {
        emailAddress: subscriber.emailAddress,
        verifiedStatus: targetStatus,
        validationToken: hash,
        tokenExpire: expiry
    }

    await updateSubscriber(updatedSubscriber);

    return { 
        actionOutcome: SetStatusOutcome.Success,
        nextToken: newToken
    }
}

// Reroll a subscribers token, optionally checking status first
export async function rerollToken(email : string, checkStatus? : string) : Promise<RerollTokenResult> {
    const subscriber = await getSubscriberFromDb(email);

    // Don't do anything if it doesn't actually exist
    if (subscriber == null) {
        return {
            success: false
        };
    }

    // If we're checking status then make sure status matches
    if (checkStatus != undefined && subscriber.verifiedStatus != checkStatus) {
        return {
            success: false,
            status: subscriber.verifiedStatus
        }
    }

    const newToken = generateRandomToken();
    const hash = hashToken(newToken);
    const expiry = generateTokenExpiry(TOKEN_TTL).toISOString();

    const updatedSubscriber : Subscriber = {
        emailAddress: email,
        verifiedStatus: subscriber.verifiedStatus,
        validationToken: hash,
        tokenExpire: expiry
    };

    await updateSubscriber(updatedSubscriber);

    return {
        success: true,
        nextToken: newToken
    };
}
