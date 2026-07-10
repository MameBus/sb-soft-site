import { DoesNotExistError } from "@sb-soft/common/db";
import { deleteSubscriber, getSubscriber, rerollToken, VerifiedStatus, verifyAuth } from "@sb-soft/common/db/subscribers";
import { sendTemplateEmail, unSubConfirmTemplate, unSubVerifyTemplate } from "@sb-soft/common/ses";

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
    // First we need to make sure the user exists and is actually verified
    try {
        const subscriber = await getSubscriber(emailAddress);
        
        if (subscriber.verifiedStatus != VerifiedStatus.VERIFIED) {
            return {
                actionOutcome: UnsubOutcome.NotVerified
            };
        }
    } catch (error) {
        if (error instanceof DoesNotExistError) {
            return {
                actionOutcome: UnsubOutcome.Failed
            };
        }
        else {
            throw error;
        }
    }
    
    // We'll need to reroll their access token before firing the email
    const newToken = await rerollToken(emailAddress);

    console.log("Firing email");
    await sendUnsubscribeValidateEmail(emailAddress, newToken);
    
    return {
        actionOutcome: UnsubOutcome.Success
    };
}

// Take a token, compare to the db and if it's confirmed, delete the user from the db
export async function confirmUnsub(emailAddress : string, token : string) : Promise<boolean> {
    // Make sure the user actually exists first of all
    try {
        await getSubscriber(emailAddress);
    } catch (error) {
        if (error instanceof DoesNotExistError) {
            return true; // We kind of deleted it ig
        }
        throw error;
    }
    
    // Make sure the access token is valid
    const tokenValid = await verifyAuth(emailAddress, token);
    if (!tokenValid) {
        return false;
    }
    
    // try to actually do the delete
    await deleteSubscriber(emailAddress);

    await sendUnsubscribeConfirmationEmail(emailAddress);
    return true;
}

async function sendUnsubscribeValidateEmail(emailAddress : string, token : string) {
    const template = unSubVerifyTemplate({
        email: emailAddress, 
        token: token
    });
    
    await sendTemplateEmail(emailAddress, template);
}

async function sendUnsubscribeConfirmationEmail(emailAddress : string) {
    const template = unSubConfirmTemplate({
        email: emailAddress
    });
    
    await sendTemplateEmail(emailAddress, template);
}