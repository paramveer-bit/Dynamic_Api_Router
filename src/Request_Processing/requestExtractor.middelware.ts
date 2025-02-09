import asyncHandler from "../helpers/asynchandeler";
import ApiError from "../helpers/ApiError";
import ApiResponse from "../helpers/ApiResponse";
import { Request, Response, NextFunction } from "express";
import PrismaClient from "../prismaClient/index"
import { z } from "zod"
import RedisClient from "../Redis/redis.client"




const temp = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    var requestedUrl = req.path
    const { user_code, secret } = req.headers
    if (!user_code || !secret) {
        throw new ApiError(400, "Invalid request")
    }

    // Find the reuquest stored in database
    const request = await PrismaClient.request.findFirst({
        where: {
            requestUrl: requestedUrl,
            User: {
                secret: secret.toString()
            }
        }
    })
    if (!request) {
        await PrismaClient.requestLog.create({
            data: {
                requestUrl: requestedUrl,
                forwardUrl: "Not forwarded",
                response: "Request not found",
                statusCode: 404,
                duration: 0,
                userId: user_code.toString()
            }
        })
        throw new ApiError(404, "Request not found")
    }
    req.request = request
    req.user_code = user_code.toString()
    next()

})


export default temp
