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

const getInvitations = async (userId) => {
  try {
    const invitations = await invitationModel.findByUser(userId)

    const resInvitations = invitations.map(i => ({
      ...i,
      inviter: i.inviter[0] || {},
      invitee: i.invitee[0] || {},
      board: i.board[0] || {}
    }))

    return resInvitations
  } catch (error) {
    throw error
  }
}

const updateBoardInvitation = async (userId, invitationId, status) => {
  try {
    // find invitation
    const invitation = await invitationModel.findOneById(invitationId)
    if (!invitation) throw new ApiError(StatusCodes.NOT_FOUND, 'Invitation not found')

    // find board from invitation
    const boardId = invitation.boardInvitation.boardId
    const board = await boardModel.findOneById(boardId)
    if (!board) throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found')

    // check if status is accepted and user was owner or member of board, then throw error
    const boardOwnerAndMemberIds = [...board.ownerIds, ...board.memberIds]
    if (status === BOARD_INVITATION_STATUS.ACCEPTED && boardOwnerAndMemberIds.includes(userId)) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'You are already a member of the board')
    }

    // create data to update invitation
    const updateData = {
      boardInvitation: {
        ...invitation.boardInvitation,
        status
      }
    }

    // update invitation
    const updatedInvitation = await invitationModel.update(invitationId, updateData)

    // if status is accepted, add user to memberIds of the board
    if (updatedInvitation.boardInvitation.status === BOARD_INVITATION_STATUS.ACCEPTED) {
      await boardModel.pushMemberIds(boardId, userId)
    }

    return updatedInvitation
  } catch (error) {
    throw error
  }
}

export const invitationService = {
  createNewBoardInvitation,
  getInvitations,
  updateBoardInvitation
}
