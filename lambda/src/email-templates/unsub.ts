export const unsubscribeVerifyTemplateName = "UnsubscribeVerify";

export function makeUnsubscribeVerifyTemplateData(email : string, token : string) {
    return JSON.stringify({
        email: email,
        token: token
    });
}