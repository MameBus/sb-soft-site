export const subscribeVerifyTemplateName = "SubscribeVerify";

export function makeSubscribeVerifyTemplateData(email : string, token : string) {
    return JSON.stringify({
        email: email,
        token: token
    });
}