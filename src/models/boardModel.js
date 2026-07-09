import Joi from 'joi'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '../utils/validators.js'
import { getDatabaseInstance } from '../config/mongodb.js'
import { ObjectId } from 'mongodb'

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
    // Tam thoi dung giong findOneById, sau nay se dung aggregate de lay toan bo Columns va Cards thuoc ve Board
    const board = await getDatabaseInstance()
      .collection(BOARD_COLLECTION_NAME)
      .findOne({ _id: new ObjectId(boardId) })

    return board
  } catch (error) {
    throw new Error(error)
  }
}

export const boardModel = {
  BOARD_COLLECTION_NAME,
  BOARD_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  getDetails
}
