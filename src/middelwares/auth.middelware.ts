import ApiError from "../helpers/ApiError"
import asyncHandler from "../helpers/asynchandeler"
import jwt from "jsonwebtoken"
import { Request, Response, NextFunction } from "express"
import PrismaClient from "../prismaClient/index"


const verifyJwt = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const accessToken = req.cookies?.token


        if (!accessToken) {
            throw new ApiError(401, "Unauthorized Access")
        }

        if (!process.env.JWT_SECRET) {
            throw new ApiError(500, "JWT secret is not defined")
        }

        const decodedToken: any = jwt.verify(accessToken, process.env.JWT_SECRET)

        const user_id = decodedToken.id

        const user = await PrismaClient.user.findFirst({
            where: {
                id: user_id
            }
        })

        if (!user) {
            throw new ApiError(401, "Unauthorized Access. Login First")
        }

        req.user_id = user_id
        next()

    } catch (error) {
        console.log(error)
        throw new ApiError(400, "No login token found. Login First To continue")
    }

})

export default verifyJwt