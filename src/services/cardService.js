import { cloudinaryProvider } from '~/providers/cloudinaryProvider.js'
import { cardModel } from '../models/cardModel.js'
import { columnModel } from '../models/columnModel.js'

const createNew = async (request) => {
  try {
    const newCard = {
      ...request
    }

    const cardCreated = await cardModel.createNew(newCard)

    const getNewCard = await cardModel.findOneById(
      cardCreated.insertedId
    )

    if (getNewCard) {
      await columnModel.pushCardOrderIds(getNewCard)
    }
    return getNewCard
  } catch (error) {
    throw error
  }
}

const update = async (cardId, request, cardCoverFile, userInfo) => {
  try {
    const updateData = {
      ...request,
      updatedAt: Date.now()
    }

    let updatedCard = {}

    if (cardCoverFile) {
      const uploadResult = await cloudinaryProvider.streamUpload(cardCoverFile.buffer, 'card-covers')
      updatedCard = await cardModel.update(cardId, {
        cover: uploadResult.secure_url
      })
    } else if (updateData.commentToAdd) {
      const commentData = {
        ...updateData.commentToAdd,
        commentedAt: Date.now(),
        userId: userInfo._id,
        userEmail: userInfo.email
      }

      updatedCard = await cardModel.unShiftNewComment(cardId, commentData)
    } else if (updateData.incomingMemberInfo) {
      updatedCard = await cardModel.updateMembers(cardId, updateData.incomingMemberInfo)
    } else {
      updatedCard = await cardModel.update(cardId, updateData)
    }

    return updatedCard
  } catch (error) {
    throw error
  }
}

export const cardService = {
  createNew,
  update
}
