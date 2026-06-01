import { makeSubscribeVerifyTemplateData, subscribeVerifyTemplateName } from "../email-templates/sub.js";
import { subscribeConfirmationTemplateName } from "../email-templates/subConfirmation.js";
import { verifiedStatusValues } from "../models/subscriber.js";
import { sendTemplateEmail } from "./emailService.js";
import { createNewSubscriber, CreateSubscriberOutcome, rerollToken, SetStatusOutcome, setSubscriberStatus } from "./subscriberService.js";

export enum SubOutcome {
    AlreadyVerified,
    Failed,
    VerificationSent
}

export enum ConfirmOutcome {
    AlreadyVerified,
    Failed,
    Success
}

type SubResponse = {
    actionOutcome: SubOutcome
}

type ConfirmResponse = {
    actionOutcome: ConfirmOutcome
}

// Handle generating a token, update / create the dynamo db record for the user, and fire off an Email
export async function sub(emailAddress : string) : Promise<SubResponse> {
    // Try to make a new subscriber for a start
    const createNewSubscriberResult = await createNewSubscriber(emailAddress);

    var nextToken = createNewSubscriberResult.nextToken;

    // Check if it's already there, if so what we do depends on the state
    if (createNewSubscriberResult.actionOutcome == CreateSubscriberOutcome.AlreadyExists) {
        // Is already verified so we don't actually do anything
        if (createNewSubscriberResult.state == verifiedStatusValues.verified) {
            return {
                actionOutcome: SubOutcome.AlreadyVerified
            };
        }

        // Otherwise we will need to reroll the token
        const rerollTokenResult = await rerollToken(emailAddress);
        nextToken = rerollTokenResult.nextToken;
    }

    // Make sure token is actually with us
    if (nextToken == undefined) {
        return {
            actionOutcome: SubOutcome.Failed
        };
    }

    // DB stuff done, just need to send out the verification email
    console.log("Sending validation Email");
    await sendSubscribeValidateEmail(emailAddress, nextToken);
    return {
        actionOutcome: SubOutcome.VerificationSent
    };
}

// Take a token, compare to the db and if it's confirmed, update the db that they are confirmed
export async function confirmSub(emailAddress : string, token : string) : Promise<ConfirmResponse> {
    // Try to validate the token
    const setStatusResult = await setSubscriberStatus(emailAddress, token, verifiedStatusValues.verified);
    switch (setStatusResult.actionOutcome) {
        case SetStatusOutcome.AlreadyAtStatus:
            return {
                actionOutcome: ConfirmOutcome.AlreadyVerified 
            };
        case SetStatusOutcome.InvalidToken:
        case SetStatusOutcome.OutdatedToken:
        case SetStatusOutcome.OtherError:
            return {
                actionOutcome: ConfirmOutcome.Failed
            };
    }

    // If we got here it was successful, just send off the confirmation email now
    console.log("Firing confirmation email");
    await sendSubscribeConfirmationEmail(emailAddress, token);
    return {
        actionOutcome: ConfirmOutcome.Success
    };
}

async function sendSubscribeValidateEmail(emailAddress : string, token : string) {
    await sendTemplateEmail(emailAddress, makeSubscribeVerifyTemplateData(emailAddress, token), subscribeVerifyTemplateName);
}

async function sendSubscribeConfirmationEmail(emailAddress : string, token : string) {
    await sendTemplateEmail(emailAddress, makeSubscribeVerifyTemplateData(emailAddress, token), subscribeConfirmationTemplateName);   
}