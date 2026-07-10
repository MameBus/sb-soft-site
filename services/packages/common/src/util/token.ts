import { createHash, randomBytes } from "node:crypto";
import { TOKEN_TTL } from "../config/tokenConfig.js";

// A type for representing a generated token
type Token = {
    raw: string,
    hash: string,
    expires: string
};

// Generate a new token and attach the expiry
export function newToken() : Token {
    const rawToken = generateRandomToken();
    const hashedToken = hashToken(rawToken);
    const expiry = generateTokenExpiry(TOKEN_TTL);

    return {
        raw: rawToken,
        hash: hashedToken,
        expires: expiry.toISOString()
    };
}

// Confirm that a hashed token did come from a test token
export function validateToken(testToken : string, actualHash : string, expiry : string) {
    const testHash = hashToken(testToken);
    const inDate = tokenInDate(expiry);

    return testHash == actualHash && inDate;
}

// Securely generate a random 32 byte string
function generateRandomToken() {
    return randomBytes(32).toString("hex");
}

// Securely hash a token using SHA256
function hashToken(token : string) {
    return createHash('sha256').update(token).digest('hex');
}

// From the current time add on the time to live and return that date/time
function generateTokenExpiry(ttl : number) {
    const date = new Date();
    date.setSeconds(date.getSeconds() + ttl);
    return date;
}

// Confirm a token is still in date
function tokenInDate(date : string) {
    return date > new Date().toISOString()
}
