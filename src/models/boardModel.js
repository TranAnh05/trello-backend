import Joi from 'joi'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '../utils/validators.js'
import { getDatabaseInstance } from '../config/mongodb.js'
import { ObjectId } from 'mongodb'
import { BOARD_TYPES } from '~/utils/constants.js'
import { columnModel } from './columnModel.js'
import { cardModel } from './cardModel.js'
import { pagingSkipValue } from '~/utils/algorithms.js'
import { userModel } from './userModel.js'

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

  ownerIds: Joi.array()
    .items(
      Joi.string()
        .pattern(OBJECT_ID_RULE)
        .message(OBJECT_ID_RULE_MESSAGE)
    )
    .default([]),

  memberIds: Joi.array()
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

const createNew = async (userId, data) => {
  try {
    const validData = await validateBeforeCreate(data)
    const newBoardToAdd = {
      ...validData,
      ownerIds: [new ObjectId(userId)]
    }

    return await getDatabaseInstance()
      .collection(BOARD_COLLECTION_NAME)
      .insertOne(newBoardToAdd)
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
const getDetails = async (userId, boardId) => {
  try {
    const queryConditions = [
      { _id: new ObjectId(boardId) },
      { _destroy: false },
      { $or: [
        { ownerIds: { $all: [new ObjectId(userId)] } },
        { memberIds: { $all: [new ObjectId(userId)] } }
      ] }
    ]

    const result = await getDatabaseInstance()
      .collection(BOARD_COLLECTION_NAME)
      .aggregate([
        { $match: { $and: queryConditions } },
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
        },
        {
          $lookup: {
            from: userModel.USER_COLLECTION_NAME,
            localField: 'ownerIds',
            foreignField: '_id',
            as: 'owners',
            // pipeline trong lookup la de xu ly 1 hoac nhieu luong can thiet
            // project: de chi dinh vai field khong muon lay ve bang cach gan no gia tri 0
            pipeline: [{ $project: { 'password': 0, 'verifyToken': 0 } }]
          }
        },
        {
          $lookup: {
            from: userModel.USER_COLLECTION_NAME,
            localField: 'memberIds',
            foreignField: '_id',
            as: 'members',
            pipeline: [{ $project: { 'password': 0, 'verifyToken': 0 } }]
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

// $pull: Xoa columnId khoi mang columnOrderIds cua Board
const pullColumnOrderIds = async (column) => {
  try {
    const result = await getDatabaseInstance()
      .collection(BOARD_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(column.boardId) },
        { $pull: { columnOrderIds: new ObjectId(column._id) } },
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

    if (updateData.columnOrderIds) {
      updateData.columnOrderIds = updateData.columnOrderIds.map(_id => new ObjectId(_id))
    }

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

const getBoards = async (userId, page, itemsPerPage) => {
  try {
    const queryConditions = [
      // Dieu kien 1: Board chua bi xoa
      { _destroy: false },
      // Dieu kien 2: UserId thuoc 1 trong 2 mang memberIds hoac ownerIds
      { $or: [
        { ownerIds: { $all: [new ObjectId(userId)] } },
        { memberIds: { $all: [new ObjectId(userId)] } }
      ] }
    ]

    const query = await getDatabaseInstance()
      .collection(BOARD_COLLECTION_NAME)
      .aggregate(
        [
          { $match: { $and: queryConditions } },
          // sort title: sap xep title tu A -> Z
          { $sort: { title: 1 } },
          // $facet: De xu ly nhieu luong du lieu trong 1 query
          { $facet: {
            // Luong 1: Query boards
            'queryBoards': [
              { $skip: pagingSkipValue(page, itemsPerPage) },
              { $limit: itemsPerPage }
            ],

            // Luong 2: Query tong so luong ban ghi boards trong db va gan vao bien countedAllBoards
            'queryTotalBoards': [{ $count: 'countedAllBoards' }]
          } }
        ],
        // Fix bug: B hoa va a thuong o tren
        { collation: { locale: 'en' } }
      ).toArray()

    const res = query[0]

    return {
      boards: res.queryBoards || [],
      totalBoards: res.queryTotalBoards[0]?.countedAllBoards || 0
    }
  } catch (error) {
    throw new Error(error)
  }
}

const pushMemberIds = async (boardId, userId) => {
  try {
    const result = await getDatabaseInstance()
      .collection(BOARD_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(boardId) },
        { $push: { memberIds: new ObjectId(userId) } },
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
  pullColumnOrderIds,
  update,
  getBoards,
  pushMemberIds
}
