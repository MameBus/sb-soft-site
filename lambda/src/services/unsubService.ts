import { Subscriber } from "../models/subscriber";
import { deleteSubscriber, getSubscriber, updateSubscriber } from "../repository/subscribersRepository";
import { generateRandomToken, generateTokenExpiry, hashToken, validateToken } from "./tokenService";

const tokenTtl = 60 * 60 * 24; // 1 day

// Handle generating a token, update the dynamo db record for the user, and fire off an Email
export async function unsub(emailAddress : string) : Promise<void> {
    // Check first if there is a subscriber entry
    const existingSubscriber = await getSubscriber(emailAddress);

    // If there is no record or they aren't verified anyway just do nothing
    if (existingSubscriber == null || !existingSubscriber.verified) {
        return;
    }

    // Valid state, so start by updating the token
    const token = generateRandomToken();
    const hash = hashToken(token);
    const expiry = generateTokenExpiry(tokenTtl);

    // Create the new subscriber object
    const updatedSubscriber : Subscriber = {
        emailAddress: emailAddress,
        verified: true,
        token: hash,
        tokenExpire: expiry
    }

    // Update the record
    updateSubscriber(updatedSubscriber);

    // Fire off the verify email
    sendUnsubscribeValidateEmail(emailAddress, token);
}

// Take a token, compare to the db and if it's confirmed, delete the user from the db
export async function confirmUnsub(emailAddress : string, token : string) : Promise<void> {
    // First we need to get the subscriber to compare the tokens
    var subscriber = await getSubscriber(emailAddress);

    // If we didn't find the subscriber or they aren't verified anyway, then we don't do anything
    if (subscriber == null || !subscriber.verified) {
        return;
    }

    // Otherwise we just compare the token we got with the hashed token in the record and check the expiry
    if (validateToken(token, subscriber.token) && subscriber.tokenExpire > new Date()) { // Valid
        deleteSubscriber(emailAddress);
    }
    
    sendUnsubscribeConfirmationEmail(emailAddress);
}

async function sendUnsubscribeValidateEmail(emailAddress : string, token : string) {
    
}

async function sendUnsubscribeConfirmationEmail(emailAddress : string) {
    
}