import ApiError from '~/utils/ApiError.js'
import { StatusCodes } from 'http-status-codes'
import { userModel } from '../models/userModel.js'
import bcryptjs from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { pickUser } from '~/utils/formatters'

const createNew = async (request) => {
  try {
    // Kiem tra email da ton tai chua
    const existingUser = await userModel.findOneByEmail(request.email)
    if (existingUser) {
      throw new ApiError(StatusCodes.CONFLICT, 'Email already exists!')
    }

    // Tao data luu vao database
    const nameFromEmail = request.email.split('@')[0]
    const newUser = {
      email: request.email,
      password: bcryptjs.hashSync(request.password, 8), // Tham so thu hai cang cao thi bam cang lau
      username: nameFromEmail,
      displayName: nameFromEmail,
      verifyToken: uuidv4()
    }

    // Thuc hien luu vao database
    const createdUser = await userModel.createNew(newUser)
    const getUser = await userModel.findOneById(createdUser.insertedId)

    // Gui email cho nguoi dung xac thuc

    return pickUser(getUser)
  } catch (error) {
    throw error
  }
}

export const userService = {
  createNew
}
