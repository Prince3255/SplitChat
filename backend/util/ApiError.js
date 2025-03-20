class ApiError extends Error {
    constructor (statusCode, message = "Something went wrong", error = [], stack = "") {
        super (message)
        this.statusCode = statusCode,
        this.error = error,
        this.message = message,
        this.success = false,
        this.data = null

        if (stack) {
            this.stack = stack
        }
        else {
            Error.captureStackTrace(this, this.constructor)
        }
    }

    toJSON() {
        return {
            message: this.message,
            statusCode: this.statusCode,
            error: this.error,
            success: this.success,
            data: this.data
        };
    }
}

export { ApiError }