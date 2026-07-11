import Joi from 'joi'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '../utils/validators.js'
import { getDatabaseInstance } from '../config/mongodb.js'
import { ObjectId } from 'mongodb'
import { BOARD_TYPES } from '~/utils/constants.js'
import { columnModel } from './columnModel.js'
import { cardModel } from './cardModel.js'

// Define Collection (name & schema)
const BOARD_COLLECTION_NAME = 'boards'
/**
 * Tai sao van phai validate o Model truoc khi insert vao DB khi da validate o tang controller?
 * - De tranh truong hop xu ly loi o tang services
 */
const BOARD_COLLECTION_SCHEMA = Joi.object({
  title: Joi.string().required().min(3).max(50).trim().strict(),
  slug: Joi.string().required().min(3).trim().strict(),
  description: Joi.string().required().min(3).max(256).trim().strict(),
  type: Joi.string().valid(BOARD_TYPES.PUBLIC, BOARD_TYPES.PRIVATE).required(),

  columnOrderIds: Joi.array()
    .items(
      Joi.string()
        .pattern(OBJECT_ID_RULE)
        .message(OBJECT_ID_RULE_MESSAGE)
    )
    .default([]),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

// Chi dinh nhung fields ma chung ta khong muon cap nhat
const INVALID_UPDATE_FIELDS = ['_id', 'createdAt']

const validateBeforeCreate = async (data) => {
  return await BOARD_COLLECTION_SCHEMA.validateAsync(data, {
    abortEarly: false
  })
}

const createNew = async (data) => {
  try {
    const validData = await validateBeforeCreate(data)

    return await getDatabaseInstance()
      .collection(BOARD_COLLECTION_NAME)
      .insertOne(validData)
  } catch (error) {
    throw new Error(error)
  }
}

const findOneById = async (id) => {
  try {
    const board = await getDatabaseInstance()
      .collection(BOARD_COLLECTION_NAME)
      .findOne({ _id: new ObjectId(id) })

    return board
  } catch (error) {
    throw new Error(error)
  }
}

// Query tong hop (aggregate) de lay toan bo Columns va Cards thuoc ve Board
const getDetails = async (boardId) => {
  try {
    //   .collection(BOARD_COLLECTION_NAME)
    //   .findOne({ _id: new ObjectId(boardId) })
    const result = await getDatabaseInstance()
      .collection(BOARD_COLLECTION_NAME)
      .aggregate([
        {
          $match: {
            _id: new ObjectId(boardId),
            _destroy: false
          }
        },
        {
          $lookup: {
            from: columnModel.COLUMN_COLLECTION_NAME,
            localField: '_id',
            foreignField: 'boardId',
            as: 'columns'
          }
        },
        {
          $lookup: {
            from: cardModel.CARD_COLLECTION_NAME,
            localField: '_id',
            foreignField: 'boardId',
            as: 'cards'
          }
        }
      ]).toArray()
    return result[0] || null
  } catch (error) {
    throw new Error(error)
  }
}

// Push columnId vao cuoi mang columnOrderIds cua Board
const pushColumnOrderIds = async (column) => {
  try {
    const result = await getDatabaseInstance()
      .collection(BOARD_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(column.boardId) },
        { $push: { columnOrderIds: new ObjectId(column._id) } },
        { returnDocument: 'after' }
      )

    return result
  } catch (error) {
    throw new Error(error)
  }
}

const update = async (boardId, updateData) => {
  try {
    // Loc nhung fields khong cho phep update
    Object.keys(updateData).forEach(fieldName => {
      if (INVALID_UPDATE_FIELDS.includes(fieldName)) {
        delete updateData[fieldName]
      }
    })

    const result = await getDatabaseInstance()
      .collection(BOARD_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(boardId) },
        { $set: updateData },
        { returnDocument: 'after' }
      )

    return result
  } catch (error) {
    throw new Error(error)
  }
}

export const boardModel = {
  BOARD_COLLECTION_NAME,
  BOARD_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  getDetails,
  pushColumnOrderIds,
  update
}
