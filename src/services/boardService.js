import { slugify } from '../utils/formatters.js'
import { boardModel } from '../models/boardModel.js'
import ApiError from '../utils/ApiError.js'
import { StatusCodes } from 'http-status-codes'
import { cloneDeep } from 'lodash'

const createNew = async (request) => {
  try {
    // Xu ly logic du lieu tuy dac thu du an
    const newBoard = {
      ...request,
      slug: slugify(request.title)
    }

    // Goi toi Model de xu ly luu ban ghi
    const boardCreated = await boardModel.createNew(newBoard)

    // Lay ban ghi vua duoc tao ra tu Model (Tuy vao du an, co the khong can thuc hien buoc nay)
    const getNewBoard = await boardModel.findOneById(
      boardCreated.insertedId
    )

    // Xu ly cac logic khac voi cac Collections lien quan tuy dac thu du an
    // Ban email, notification, log, ...

    // Tra ve ket qua
    return getNewBoard
  } catch (error) {
    throw error
  }
}

const getDetails = async (boardId) => {
  try {
    const board = await boardModel.getDetails(boardId)
    if (!board) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found')
    }

    // Clone board ra mot cai moi de xu ly, khong anh huong toi board goc
    const resBoard = cloneDeep(board)

    resBoard.columns.forEach(column => {
      // Cach 1 - ObjectId trong Mongodb co support cho equals de so sanh 2 ObjectId voi nhau
      column.cards = resBoard.cards.filter(card => card.columnId.equals(column._id))
      // Cach 2
      // column.cards = resBoard.cards.filter(card => card.columnId.toString() === column._id.toString())
    })

    delete resBoard.cards

    return resBoard
  } catch (error) {
    throw error
  }
}

const update = async (boardId, reqBody) => {
  try {
    const updateData = {
      ...reqBody,
      updatedAt: Date.now()
    }

    const updatedBoard = await boardModel.update(boardId, updateData)

    return updatedBoard
  } catch (error) {
    throw error
  }
}

export const boardService = {
  createNew,
  getDetails,
  update
}
