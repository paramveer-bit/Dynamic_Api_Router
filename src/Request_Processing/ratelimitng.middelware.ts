import asyncHandler from "../helpers/asynchandeler";
import ApiError from "../helpers/ApiError";
import ApiResponse from "../helpers/ApiResponse";
import { Request, Response, NextFunction } from "express";
import PrismaClient from "../prismaClient/index"
import RedisClient from "../Redis/redis.client"




const temp = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // check id ratelimitng is on
    const request = req.request
    if (request.rateLimit === false) {
        return next()
    }
    const user_code = req.user_code
    let limit = request.default

    // check if user has custom rate limit
    const per_user = await PrismaClient.rateLimiting.findFirst({
        where: {
            user_code: user_code,
            Request: {
                id: request.id
            }
        }
    })
    if (per_user != null && per_user.rate != null) {
        limit = per_user.rate
    }

    // Making key on basic of user_code and request id and request ownerId
    // key will expire in 60 seconds
    // Scenior : Each client have unique.Id and each client have uniquest request and those request have uniques const first = useRef(second)
    const key = `rate_limit:${request.ownerId}:${request.id}:${user_code}`
    if (!user_code) {
        throw new ApiError(400, "Invalid request")
    }
    // Increment the key pair if ratelimit excceded return error
    try {
        const replies: any = await new Promise((resolve, reject) => {
            RedisClient.multi()
                .incr(key)
                .expire(key, 60)
                .exec((err, replies) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(replies);
                });
        });

        if (!replies || replies[0] > limit) {
            await PrismaClient.requestLog.create({
                data: {
                    requestId: request.id,
                    requestUrl: req.originalUrl,
                    forwardUrl: request.forwardUrl,
                    statusCode: 429,
                    comment: "Rate Limit Exceeded",
                    response: "NIL",
                    duration: 0,
                    userId: user_code.toString(),
                    type: req.method
                }
            });
            throw new ApiError(429, "Rate Limit Exceeded");
        }
    } catch (err) {
        await PrismaClient.requestLog.create({
            data: {
                requestId: request.id,
                requestUrl: req.originalUrl,
                forwardUrl: request.forwardUrl,
                response: "NIL",
                comment: "Error in Redis RateLimiting. Reuqest is forwarded to the server. Redis is skipped",
                statusCode: 500,
                duration: 0,
                userId: user_code.toString(),
                type: req.method
            }
        });
        return next()
    }
    console.log("Rate limit passed")
    return next()

})


export default temp
