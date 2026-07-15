import { StatusCodes } from 'http-status-codes'
import { env } from '../config/environment.js'
import { JwtProvider } from '../providers/JwtProvider.js'
import ApiError from '../utils/ApiError.js'

/**
 * Middleware nay se xac thuc JWT acccess token
 */
const isAuthorized = async (req, res, next) => {
  // Lay access token tu request cookie
  const accessToken = req.cookies?.accessToken

  if (!accessToken) {
    next(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized! Token not found'))
    return
  }

  try {
    // Giai ma token
    const accessTokenDecoded = await JwtProvider.verifyToken(accessToken, env.ACCESS_TOKEN_SECRET_SIGNATURE)

    // Token hop le -> luu thong tin giai ma vao req.jwtDecoded de cac tang khac su dung
    req.jwtDecoded = accessTokenDecoded

    // Cho phep request di tiep
    next()
  } catch (error) {
    // Neu access token het han -> tra loi cho FE de goi api refresh token
    if (error?.message?.includes('jwt expired')) {
      next(new ApiError(StatusCodes.GONE, 'Need to refresh token!'))
      return
    }

    // Neu access token khong hop le -> tra loi 401 cho FE goi api sign out
    next(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized!'))
  }
}

export const authMiddleware = {
  isAuthorized
}