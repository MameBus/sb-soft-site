import { createHash, randomBytes } from "node:crypto";

// Securely generate a random 32 byte string
export function generateRandomToken() {
    return randomBytes(32).toString("hex");
}

// Securely hash a token using SHA256
export function hashToken(token : string) {
    return createHash('sha256').update(token).digest('hex');
}

// From the current time add on the time to live and return that date/time
export function generateTokenExpiry(ttl : number) {
    const date = new Date();
    date.setSeconds(date.getSeconds() + ttl);
    return date;
}

// Confirm that a hashed token did come from a test token
export function validateToken(testToken : string, actualHash : string) {
    const testHash = hashToken(testToken);
    return testHash == actualHash;
}

// Confirm a token is still in date
export function tokenInDate(date : string) {
    return date > new Date().toISOString()
}
