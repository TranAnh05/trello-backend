import { columnModel } from '../models/columnModel.js'
import { boardModel } from '../models/boardModel.js'
import { cardModel } from '../models/cardModel.js'
import ApiError from '~/utils/ApiError.js'
import { StatusCodes } from 'http-status-codes'

const createNew = async (request) => {
  try {
    const newColumn = {
      ...request
    }

    const columnCreated = await columnModel.createNew(newColumn)

    const getNewColumn = await columnModel.findOneById(
      columnCreated.insertedId
    )

    if (getNewColumn) {
      getNewColumn.cards = []

      await boardModel.pushColumnOrderIds(getNewColumn)
    }
    return getNewColumn
  } catch (error) {
    throw error
  }
}

const update = async (columnId, reqBody) => {
  try {
    const updateData = {
      ...reqBody,
      updatedAt: Date.now()
    }

    const updatedColumn = await columnModel.update(columnId, updateData)

    return updatedColumn
  } catch (error) {
    throw error
  }
}

const deleteItem = async (columnId) => {
  try {
    // Tim column theo columnId
    const targetColumn = await columnModel.findOneById(columnId)

    if (!targetColumn) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Column not found')
    }

    // Xoa column
    await columnModel.deleteOneById(columnId)

    // Xoa cac card thuoc column
    await cardModel.deleteManyByColumnId(columnId)

    // Xoa columnId khoi board.columnOrderIds
    await boardModel.pullColumnOrderIds(targetColumn)
    return { deleteResult: 'Column and its cards deleted successfully' }
  } catch (error) {
    throw error
  }
}
export const columnService = {
  createNew,
  update,
  deleteItem
}
