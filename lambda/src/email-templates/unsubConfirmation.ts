export const unsubscribeConfirmationtemplateName = "UnsubscribeConfirm";

export function makeUnsubscribeConfirmationTemplateData(email : string) {
    return JSON.stringify({
        email: email
    });
}