import { StatusCodes } from "http-status-codes";
import ApiError from "../utils/apiError.js";

const createNew = async (req, res, next) => {
    try {   
        console.log(`req body:`, req.body);
        /**
         console.log(`req query:`, req.query);
         console.log(`req params:`, req.params);
         console.log(`req files:`, req.files);
         console.log(`req cookies:`, req.cookies);
         console.log(`req jwtEncoded:`, req.jwtEncoded);
         */

        // throw new ApiError(StatusCodes.BAD_REQUEST, "API create new board error"); 

        res.status(StatusCodes.CREATED).json({
            message: "API create new board",
        });


    } catch (error) {
        // Gọi next(error) để chuyển lỗi sang middleware xử lý lỗi tập trung
        // next(error) sẽ gọi middleware errorHandlingMiddleware và truyền lỗi vào đó để xử lý
        next(error);
    }
};

export const boardController = {
    createNew,
};
