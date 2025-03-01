import asyncHandler from "../helpers/asynchandeler";
import ApiError from "../helpers/ApiError";
import { Request, Response, NextFunction } from "express";
import PrismaClient from "../prismaClient/index"
import RedisClient from "../Redis/redis.client"
interface CacheableResponse {
    status: number;
    headers: any;
    body: any;
    message: string;
}


const caching = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

    const request = req.request
    if (request.caching === false || req.method !== "GET") {
        console.log("cahching is false")
        return next()
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
                    requestId: request.id,
                    requestUrl: req.originalUrl,
                    forwardUrl: "NIL",
                    comment: "Error in Redis. Reuqest is forwarded to the server. Redis is skipped",
                    response: "NIL",
                    statusCode: 500,
                    duration: 0,
                    userId: user_code.toString(),
                    type: req.method
                }
            });
            return next()
        }
        if (data != null) {
            // console.log(data)

            const response: CacheableResponse = JSON.parse(data)
            // console.log(response)
            await PrismaClient.requestLog.create({
                data: {
                    requestId: request.id,
                    requestUrl: req.originalUrl,
                    forwardUrl: "NIL",
                    comment: "Cache Hit for the request. With specific secret:requestId:User_Code",
                    response: JSON.stringify(response.body),
                    statusCode: Number(response.status),
                    duration: 0,
                    userId: user_code.toString(),
                    type: "GET"
                }
            });
            return res.set(response.headers).status(response.status).send(response.body)
        }
        console.log("Cache Miss")
        return next()
    })

})


export default caching