class ApiError extends Error {
    constructor(statusCode, message) {
        super(message);

        // Tên của cái custom Error, nếu không set thì mặc định sẽ kế thừa là Error
        this.name = "ApiError";

        // Gắn thêm thuộc tính statusCode vào instance của ApiError, để khi throw ra lỗi thì có thể biết được status code của lỗi đó
        this.statusCode = statusCode;

        // Ghi lại stack trace của lỗi, giúp Dev debug lỗi nhanh hơn
        Error.captureStackTrace(this, this.constructor);
    }
}

export default ApiError;