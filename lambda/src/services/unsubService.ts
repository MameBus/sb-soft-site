import { makeUnsubscribeVerifyTemplateData, unsubscribeVerifyTemplateName } from "../email-templates/unsub.js";
import { makeUnsubscribeConfirmationTemplateData } from "../email-templates/unsubConfirmation.js";
import { verifiedStatusValues } from "../models/subscriber.js";
import { sendTemplateEmail } from "./emailService.js";
import { rerollToken, tryDeleteSubscriber } from "./subscriberService.js";

export enum UnsubOutcome {
    Success,
    NotVerified,
    Failed
}

type UnsubResponse = {
    actionOutcome: UnsubOutcome
}

// Handle generating a token, update the dynamo db record for the user, and fire off an Email
export async function unsub(emailAddress : string) : Promise<UnsubResponse> {
    const rerollTokenResult = await rerollToken(emailAddress, verifiedStatusValues.verified);

    // If status was given and it wasn't verified we don't actually need to do anything
    if (rerollTokenResult.status != undefined && rerollTokenResult.status == verifiedStatusValues.awaiting) {
        return {
            actionOutcome: UnsubOutcome.NotVerified
        };
    }

    // If we failed or don't have a token then something went wrong
    if (!rerollTokenResult.success || rerollTokenResult.nextToken == undefined) {
        return {
            actionOutcome: UnsubOutcome.Failed
        };
    }

    // Otherwise we're successful, just fire the email and call it a day
    console.log("Firing email");
    await sendUnsubscribeValidateEmail(emailAddress, rerollTokenResult.nextToken);
    return {
        actionOutcome: UnsubOutcome.Success
    };
}

// Take a token, compare to the db and if it's confirmed, delete the user from the db
export async function confirmUnsub(emailAddress : string, token : string) : Promise<boolean> {
    const confirmUnsubResult = await tryDeleteSubscriber(emailAddress, token);

    // If it failed then bubble up a fail
    if (!confirmUnsubResult) {
        return false;
    }

    // Otherwise send off the email and call it a day
    await sendUnsubscribeConfirmationEmail(emailAddress);
    return true;
}

async function sendUnsubscribeValidateEmail(emailAddress : string, token : string) {
    await sendTemplateEmail(emailAddress, makeUnsubscribeVerifyTemplateData(emailAddress, token), unsubscribeVerifyTemplateName);
}

async function sendUnsubscribeConfirmationEmail(emailAddress : string) {
    await sendTemplateEmail(emailAddress, makeUnsubscribeConfirmationTemplateData(emailAddress), unsubscribeVerifyTemplateName);
}