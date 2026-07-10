export interface EmailTemplate {
    templateName: string,
    templateData: any
}

// Sub verify
type SubVerifyTemplateData = {
    email: string,
    token: string
}

export function subVerifyTemplate(templateData: SubVerifyTemplateData) : EmailTemplate {
    return {
        templateName: 'SubscribeVerify',
        templateData: templateData
    };
}

// Sub confirm
type SubConfirmTemplateData = {
    email: string,
    token: string
}

export function subConfirmTemplate(templateData: SubConfirmTemplateData) : EmailTemplate {
    return {
        templateName: 'SubscribeConfirm',
        templateData: templateData
    };
}

// Unsub verify
type UnSubVerifyTemplateData = {
    email: string,
    token: string
}

export function unSubVerifyTemplate(templateData: UnSubVerifyTemplateData) : EmailTemplate {
    return {
        templateName: 'UnsubscribeVerify',
        templateData: templateData
    };
}

// Unsub verify
type UnSubConfirmTemplateData = {
    email: string
}

export function unSubConfirmTemplate(templateData: UnSubConfirmTemplateData) : EmailTemplate {
    return {
        templateName: 'UnsubscribeConfirm',
        templateData: templateData
    };
}

// New devlog
type NewDevlogTemplateData = {
    email: string,
    token: string,
    logid: string,
    preview: string
}

export function newDevlogTemplate(teplateData: NewDevlogTemplateData) {
    return {
        templateName: 'NewDevlog',
        templateData: teplateData
    };
}
