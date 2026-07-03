import { slugify } from "../utils/formatters.js";
import { boardModel } from "../models/boardModel.js";

const createNew = async ( request ) => {
    try {
        // Xu ly logic du lieu tuy dac thu du an
        const newBoard = {
            ...request,
            slug: slugify(request.title),

        }

        // Goi toi Model de xu ly luu ban ghi
        const boardCreated = await boardModel.createNew(newBoard);

        // Lay ban ghi vua duoc tao ra tu Model (Tuy vao du an, co the khong can thuc hien buoc nay)
        const getNewBoard = await boardModel.findOneById(boardCreated.insertedId);
        
        // Xu ly cac logic khac voi cac Collections lien quan tuy dac thu du an
        // Ban email, notification, log, ... 
        
        // Tra ve ket qua
        return getNewBoard;
    } catch (error) {
        throw error;
    }
}

export const boardService = {
    createNew
}