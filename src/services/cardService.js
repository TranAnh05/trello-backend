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

export const cardService = {
  createNew
}
