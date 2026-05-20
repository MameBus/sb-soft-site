export const subscribeConfirmationTemplateName = "SubscribeConfirm";

export function makeSubConfirmationTemplateData(email : string, token : string) {
    return JSON.stringify({
        email: email,
        token: token
    });
}