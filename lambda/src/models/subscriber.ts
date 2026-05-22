// Model for the subscriber table in dynamodb
export type Subscriber = {
    emailAddress: string,
    verifiedStatus: string,
    validationToken: string,
    tokenExpire: string
};

export const verifiedStatusValues = {
    verified: "verified",
    awaiting: "awaiting"
}