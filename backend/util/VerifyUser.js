import jwt from 'jsonwebtoken'
import { ApiError } from './ApiError.js'

export const VerifyUser = (req, res, next) => {
    const token = req.cookies.token
    
    if (!token) {
        throw new ApiError(401, 'Unautorized')
    }

    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
        if (err) {
            return new ApiError(401, 'Unauthorized')
        }
        req.user = user
        next()
    })
}