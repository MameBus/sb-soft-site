// https://stackoverflow.com/questions/31626231/custom-error-class-in-typescript

export class AlreadyExistsError extends Error {
    constructor(msg?: string) {
        super(msg);

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, AlreadyExistsError.prototype);
    }
}

export class DoesNotExistError extends Error {
    constructor(msg?: string) {
        super(msg);

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, DoesNotExistError.prototype);
    }
}