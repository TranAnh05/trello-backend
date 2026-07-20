import { StatusCodes } from 'http-status-codes'
// import ApiError from '../utils/apiError.js'
import { boardService } from '../services/boardService.js'

const createNew = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    const createdBoard = await boardService.createNew(userId, req.body)
    res.status(StatusCodes.CREATED).json(createdBoard)
  } catch (error) {
    // Gọi next(error) để chuyển lỗi sang middleware xử lý lỗi tập trung
    // next(error) sẽ gọi middleware errorHandlingMiddleware và truyền lỗi vào đó để xử lý
    next(error)
  }
}

const getDetails = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    const boardId = req.params.id
    const board = await boardService.getDetails(userId, boardId)

    res.status(StatusCodes.OK).json(board)
  } catch (error) {
    // Gọi next(error) để chuyển lỗi sang middleware xử lý lỗi tập trung
    // next(error) sẽ gọi middleware errorHandlingMiddleware và truyền lỗi vào đó để xử lý
    next(error)
  }
}

const update = async (req, res, next) => {
  try {
    const boardId = req.params.id
    const updatedBoard = await boardService.update(boardId, req.body)

    res.status(StatusCodes.OK).json(updatedBoard)
  } catch (error) {
    next(error)
  }
}

const moveCardToDifferentColumn = async (req, res, next) => {
  try {
    const result = await boardService.moveCardToDifferentColumn(req.body)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const getBoards = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id

    const { page, itemsPerPage, q } = req.query
    const queryFilters = q
    const result = await boardService.getBoards(userId, page, itemsPerPage, queryFilters)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

export const boardController = {
  createNew,
  getDetails,
  update,
  moveCardToDifferentColumn,
  getBoards
}
