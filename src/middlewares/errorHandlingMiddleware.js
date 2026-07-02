import { StatusCodes } from "http-status-codes";

// Middleare xử lý lỗi tập trung trong ứng dụng Backend Node.js sử dụng Express
export const errorHandlingMiddleware = (err, req, res, next) => {
    // Nếu lỗi không có StatusCode, thì mặc định là 500 (Internal Server Error) (lỗi do Dev không cẩn thận)
    if(!err.statusCode) err.statusCode = StatusCodes.INTERNAL_SERVER_ERROR;

    // Tạo biến responseError để lưu trữ thông tin lỗi trả về cho client
    const responseError = {
        statusCode: err.statusCode,
        message: err.message || StatusCodes[err.statusCode], // Nếu lỗi không có message thì lấy message mặc định từ http-status-codes
        stack: err.stack, // stack trace của lỗi, giúp Dev debug lỗi nhanh hơn
    }

    // console.error(`Error:`, responseError);

    // Trả về lỗi cho client với status code và message lỗi
    res.status(responseError.statusCode).json(responseError);
}