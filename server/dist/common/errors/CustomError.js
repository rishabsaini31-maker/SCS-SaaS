export class CustomError extends Error {
    constructor(message, status = 400) {
        super(message);
        this.status = status;
        Object.setPrototypeOf(this, CustomError.prototype);
    }
}
//# sourceMappingURL=CustomError.js.map