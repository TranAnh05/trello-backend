import JWT from 'jsonwebtoken'

/**
 * Can 3 tham so:
 * userInfo: thong tin nguoi dung can luu trong token
 * secretSignature: chuoi bi mat dung de ky token
 * tokenLife: Thoi gian song cua token
 */
const generateToken = async (userInfo, secretSignature, tokenLife) => {
  try {
    return JWT.sign(userInfo, secretSignature, { algorithm: 'HS256', expiresIn: tokenLife })
  } catch (error) {
    throw new Error(error)
  }
}

const verifyToken = async (token, secretSignature) => {
  try {
    return JWT.verify(token, secretSignature)
  } catch (error) {
    throw new Error(error)
  }
}

export const JwtProvider = {
  generateToken,
  verifyToken
}