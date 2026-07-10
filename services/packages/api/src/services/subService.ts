import { AlreadyExistsError } from "@sb-soft/common/db";
import { createNewSubscriber, getSubscriber, rerollToken, updateStatus, VerifiedStatus, verifyAuth } from "@sb-soft/common/db/subscribers";
import { sendTemplateEmail, subConfirmTemplate, subVerifyTemplate } from "@sb-soft/common/ses";

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
    var subscriber;
    var token : string;
    var hadError = false;
    try {
        const createResponse = await createNewSubscriber(emailAddress);    
        subscriber = createResponse.subscriber;
        token = createResponse.rawToken;
    } catch (error) {
        hadError = true;
        if (error == AlreadyExistsError) {
            console.log('Subscriber record already exists');
            subscriber = await getSubscriber(emailAddress);
            // Is already verified so we don't actually do anything
            if (subscriber.verifiedStatus == VerifiedStatus.VERIFIED) {
                return {
                    actionOutcome: SubOutcome.AlreadyVerified
                };
            }

            // Otherwise we will need to reroll the token
            token = await rerollToken(emailAddress);
        }
        else {
            throw error;
        }
    }

    // DB stuff done, just need to send out the verification email
    console.log("Sending validation Email");
    await sendSubscribeValidateEmail(emailAddress, token);
    return {
        actionOutcome: SubOutcome.VerificationSent
    };
}

// Take a token, compare to the db and if it's confirmed, update the db that they are confirmed
export async function confirmSub(emailAddress : string, token : string) : Promise<ConfirmResponse> {
    // Try to validate the token
    try {
        const tokenValidated = verifyAuth(emailAddress, token);
        if (!tokenValidated) {
            return {
                actionOutcome: ConfirmOutcome.Failed
            };
        }
    } catch (error) {
        return {
            actionOutcome: ConfirmOutcome.Failed
        };
    }

    // Grab the record to check if already verified
    const subscriber = await getSubscriber(emailAddress);
    if (subscriber.verifiedStatus == VerifiedStatus.VERIFIED) {
        return {
            actionOutcome: ConfirmOutcome.AlreadyVerified
        };
    }

    // Update the status to verified
    await updateStatus(emailAddress, VerifiedStatus.VERIFIED);

    // If we got here it was successful, just send off the confirmation email now
    console.log("Firing confirmation email");
    await sendSubscribeConfirmationEmail(emailAddress, token);
    return {
        actionOutcome: ConfirmOutcome.Success
    };
}

async function sendSubscribeValidateEmail(emailAddress : string, token : string) {
    const template = subVerifyTemplate({
        email: emailAddress, 
        token: token
    });
    
    await sendTemplateEmail(emailAddress, template);
}

async function sendSubscribeConfirmationEmail(emailAddress : string, token : string) {
    const template = subConfirmTemplate({
        email: emailAddress, 
        token: token
    });
    
    await sendTemplateEmail(emailAddress, template);
}