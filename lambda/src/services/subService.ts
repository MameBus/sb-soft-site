import { Subscriber } from "../models/subscriber";
import { getSubscriber, putSubscriber, updateSubscriber } from "../repository/subscribersRepository";
import { generateRandomToken, generateTokenExpiry, hashToken, validateToken } from "./tokenService";

const tokenTtl = 60 * 60 * 24; // 1 day

// Handle generating a token, update / create the dynamo db record for the user, and fire off an Email
export async function sub(emailAddress : string) {
    // Check first if there is a subscriber entry
    const existingSubscriber = await getSubscriber(emailAddress);
    
    // If the subscriber exists and is already verified then we do nothing
    if (existingSubscriber?.verified) {
        return;
    }

    // Generate a new email validation token
    const token = generateRandomToken();
    const hash = hashToken(token);
    const expiry = generateTokenExpiry(tokenTtl);

    // Create the new subscriber object
    const newSubscriber : Subscriber = {
        emailAddress: emailAddress,
        verified: false,
        token: hash,
        tokenExpire: expiry
    }

    // If doesn't exist create a whole new one
    if (existingSubscriber == null) {
        putSubscriber(newSubscriber);
    }
    // Otherwise does exist and it's unvalidated, replace the token
    else {
        updateSubscriber(newSubscriber);
    }

    // Fire off a subscribe email
    sendSubscribeValidateEmail(emailAddress, token);
}

// Take a token, compare to the db and if it's confirmed, update the db that they are confirmed
export async function confirmSub(emailAddress : string, token : string) {
    // First we need to get the subscriber to compare the tokens
    var subscriber = await getSubscriber(emailAddress);

    // If we didn't find the subscriber, then we don't do anything
    if (subscriber == null) {
        return;
    }
    // If we did find the subscriber, and they are already verified, we do nothing
    else if (subscriber.verified) {
        return;
    }

    // Otherwise we just compare the token we got with the hashed token in the record and check the expiry
    if (validateToken(token, subscriber.token) && subscriber.tokenExpire > new Date()) { // Valid
        subscriber.verified = true;
        subscriber.token = ''; // Reset the token to be blank so that the token can't be used for ubsubbing
        updateSubscriber(subscriber);
    }
    
    sendSubscribeConfirmationEmail(emailAddress);
}

async function sendSubscribeValidateEmail(emailAddress : string, token : string) {
    
}

async function sendSubscribeConfirmationEmail(emailAddress : string) {
    
}
