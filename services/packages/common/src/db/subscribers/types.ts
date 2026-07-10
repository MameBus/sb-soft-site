// Model for the subscriber table in dynamodb
export type Subscriber = {
    emailAddress: string,
    verifiedStatus: VerifiedStatus,
    validationToken: string,
    tokenExpire: string
};

export enum VerifiedStatus {
    VERIFIED = "verified",
    AWAITING = "awaiting"
};

export const defaultVerifiedStatus = VerifiedStatus.AWAITING;