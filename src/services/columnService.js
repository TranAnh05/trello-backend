import { columnModel } from '../models/columnModel.js'
import { boardModel } from '../models/boardModel.js'

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
export const columnService = {
  createNew,
  update
}
