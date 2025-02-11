import asyncHandler from "../helpers/asynchandeler";
import ApiError from "../helpers/ApiError";
import ApiResponse from "../helpers/ApiResponse";
import { Request, Response, NextFunction } from "express";
import PrismaClient from "../prismaClient/index"
import { z } from "zod"
import RedisClient from "../Redis/redis.client"


const caching = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

    const request = req.request
    if (request.caching === false) {
        next()
    }
    const user_code = req.user_code
    if (!user_code) {
        throw new ApiError(400, "Invalid request")
    }
    const time = request.cacheTime
    const key = `cache:${request.ownerId}:${req.url}:${user_code}`
    RedisClient.get(key, async (err, data) => {
        if (err) {
            await PrismaClient.requestLog.create({
                data: {
                    requestUrl: req.originalUrl,
                    forwardUrl: "Not forwarded",
                    response: "Internal Server Error",
                    statusCode: 500,
                    duration: 0,
                    userId: user_code.toString()
                }
            });
            throw new ApiError(500, "Internal Server Error")
        }
        if (data != null) {
            console.log(data)

            const response = JSON.parse(data)
            console.log(response)
            await PrismaClient.requestLog.create({
                data: {
                    requestUrl: req.originalUrl,
                    forwardUrl: "Cache Hit",
                    response: response.statusCode.toString(),
                    statusCode: Number(response.statusCode),
                    duration: 0,
                    userId: user_code.toString()
                }
            });
            return res.status(response.statusCode).send(response.data)
        }
        next()
    })

})


export default caching