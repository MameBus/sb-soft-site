import { APIGatewayProxyResultV2 } from "aws-lambda";

export function buildResponse(statusCode : number, message : string) : APIGatewayProxyResultV2 {
    const body = {
        message: message
    };
    return {
        statusCode: statusCode,
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    };
}