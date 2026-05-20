import { SendTemplatedEmailCommand, SESClient } from "@aws-sdk/client-ses";

const fromAddress = "noreply@sbox-soft.com"

const client = new SESClient();

// Send some templated email
export async function sendTemplateEmail(recipientEmail : string, templateData : string, templateName : string) {
    const command = new SendTemplatedEmailCommand({
        Destination: {
            ToAddresses: [recipientEmail]
        },
        TemplateData: templateData,
        Source: fromAddress,
        Template: templateName
    });
    try {
        return await client.send(command);
    } catch (error) {
        if (error instanceof Error) {
            console.log("Send template email error " + error);
        }
        throw error;
    }
}