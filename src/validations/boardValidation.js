import Joi from "joi";
import { StatusCodes } from "http-status-codes";

const createNew = async (req, res) => {
    /**
     * Mặc định chúng ta không cần custom message ở phía backend, vì chúng ta sẽ custom message ở phía frontend
     * Backend chỉ cần validate dữ liệu và trả về message mặc định từ thư viện là được
     * Việc validate dữ liệu bắt buộc phải có ở phía backend vì đây là điểm cuối để lưu dữ liệu vào database, nếu không validate dữ liệu ở phía backend thì sẽ rất nguy hiểm, vì người dùng có thể gửi dữ liệu không hợp lệ vào database
     * Nên validate dữ liệu ở phía backend là bắt buộc, còn validate dữ liệu ở phía frontend là tùy chọn, nhưng nên có để tăng trải nghiệm người dùng
     */
    const correctCondition = Joi.object({
        title: Joi.string().required().min(3).max(50).trim().strict(),
        description: Joi.string().required().min(3).max(256).trim().strict(),
    });

    try {
        /**
         * validateAsync: Joi method để validate dữ liệu bất đồng bộ
         * abortEarly: false: Joi sẽ không dừng validate khi gặp lỗi đầu tiên, mà sẽ tiếp tục validate tất cả các trường và trả về tất cả các lỗi
         */
        await correctCondition.validateAsync(req.body, { abortEarly: false });

        res.status(StatusCodes.CREATED).json({
            message: "API create new board",
        });
    } catch (error) {
        res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
            errors: new Error(error).message,
        });
    }
};

export const boardValidation = {
    createNew,
};
