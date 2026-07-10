import { SendTemplatedEmailCommand, SESClient } from "@aws-sdk/client-ses";
import { fromAddress } from "../config/emailConfig.js";
import { EmailTemplate } from "./templates.js";

const client = new SESClient();

// Send some templated email
export async function sendTemplateEmail(recipientEmail : string, template: EmailTemplate) {
    const command = new SendTemplatedEmailCommand({
        Destination: {
            ToAddresses: [recipientEmail]
        },
        TemplateData: template.templateData,
        Source: fromAddress,
        Template: template.templateName
    });
    console.log(`Sending tempalted email with command: ${JSON.stringify(command)}`)
    try {
        await client.send(command);
    } catch (error) {
        if (error instanceof Error) {
            console.log("Send template email error " + error);
        }
        throw error;
    }
}

export { subVerifyTemplate, subConfirmTemplate, unSubVerifyTemplate, unSubConfirmTemplate, newDevlogTemplate } from './templates.js';
