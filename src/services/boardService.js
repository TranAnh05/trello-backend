import { slugify } from "../utils/formatters.js";

const createNew = async ( request ) => {
    try {
        // Xu ly logic du lieu tuy dac thu du an
        const newBoard = {
            ...request,
            slug: slugify(request.title),

        }

        // Goi toi Model de xu ly luu ban ghi

        // Xu ly cac logic khac voi cac Collections lien quan tuy dac thu du an
        // Ban email, notification, log, ... 
        
        // Tra ve ket qua
        return newBoard;
    } catch (error) {

    }
}

export const boardService = {
    createNew
}