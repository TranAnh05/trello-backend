import ApiError from '~/utils/ApiError.js'
import { pickUser } from '~/utils/formatters'
import { userModel } from '~/models/userModel'
import { boardModel } from '~/models/boardModel'
import { invitationModel } from '~/models/invitationModel'
import { INVITATION_TYPES, BOARD_INVITATION_STATUS } from '~/utils/constants.js'
import { StatusCodes } from 'http-status-codes'

const createNewBoardInvitation = async (request, inviterId) => {
  try {
    // query data
    const inviter = await userModel.findOneById(inviterId)
    const invitee = await userModel.findOneByEmail(request.inviteeEmail)
    const board = await boardModel.findOneById(request.boardId)

    // check data
    if (!inviter || !invitee || !board) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Inviter, invitee or board not found')
    }

    // create new invitation
    const newInvitationData = {
      inviterId,
      inviteeId: invitee._id.toString(),
      type: INVITATION_TYPES.BOARD_INVITATION,
      boardInvitation: {
        boardId: board._id.toString(),
        status: BOARD_INVITATION_STATUS.PENDING
      }
    }

    // save to database
    const createdInvitation = await invitationModel.createNewBoardInvitation(newInvitationData)
    const getCreatedInvitation = await invitationModel.findOneById(createdInvitation.insertedId)

    // return result
    const resInvitation = {
      ...getCreatedInvitation,
      board,
      inviter: pickUser(inviter),
      invitee: pickUser(invitee)
    }
    return resInvitation
  } catch (error) {
    throw error
  }
}

export const invitationService = {
  createNewBoardInvitation
}
