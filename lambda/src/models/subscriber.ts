// Model for the subscriber table in dynamodb
export type Subscriber = {
    emailAddress: string,
    verified: boolean,
    token: string,
    tokenExpire: Date
};