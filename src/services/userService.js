import ApiError from '~/utils/ApiError.js'
import { StatusCodes } from 'http-status-codes'
import { userModel } from '../models/userModel.js'
import bcryptjs from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { pickUser } from '~/utils/formatters'
import { WEBSITE_DOMAIN } from '~/utils/constants.js'
import { ResendProvider } from '~/providers/ResendProvider.js'
import { env } from '~/config/environment.js'
import { JwtProvider } from '~/providers/JwtProvider.js'

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
    const verificationLink = `${WEBSITE_DOMAIN}/account/verification?email=${getUser.email}&token=${getUser.verifyToken}`
    const customSubject = 'Trello - Please verify your email address before using our services!'
    const htmlContent = `
      <h3>Here is your verification link:</h3>
      <h3>${verificationLink}</h3>
      <h3>Sincerely, <br/> - Vananhdev - a web developer</h3>
    `
    // Goi provider gui mail
    await ResendProvider.sendEmail(getUser.email, customSubject, htmlContent)

    return pickUser(getUser)
  } catch (error) {
    throw error
  }
}

const verifyAccount = async (request) => {
  try {
    const existingUser = await userModel.findOneByEmail(request.email)
    if (!existingUser) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found!')
    }

    if (existingUser.isActive) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Account has already been verified!')
    }

    if (request.token !== existingUser.verifyToken) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Invalid verification token!')
    }

    const updateData = {
      isActive: true,
      verifyToken: null
    }

    const updatedUser = await userModel.update(existingUser._id, updateData)
    return pickUser(updatedUser)
  } catch (error) {
    throw error
  }
}

const login = async (request) => {
  try {
    const existingUser = await userModel.findOneByEmail(request.email)
    if (!existingUser) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found!')
    }

    if (!existingUser.isActive) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Account has not been verified!')
    }

    if (!bcryptjs.compareSync(request.password, existingUser.password)) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Your email or password is incorrect!')
    }

    // Thong tin trong JWT token: _id, email
    const userInfo = {
      _id: existingUser._id,
      email: existingUser.email
    }

    // Tao access token va refresh token
    const accessToken = await JwtProvider.generateToken(userInfo, env.ACCESS_TOKEN_SECRET_SIGNATURE, env.ACCESS_TOKEN_LIFE)
    const refreshToken = await JwtProvider.generateToken(userInfo, env.REFRESH_TOKEN_SECRET_SIGNATURE, env.REFRESH_TOKEN_LIFE)

    return { accessToken, refreshToken, ...pickUser(existingUser) }
  } catch (error) {
    throw error
  }
}

export const userService = {
  createNew,
  verifyAccount,
  login
}
