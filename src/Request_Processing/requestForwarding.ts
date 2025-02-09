import asyncHandler from "../helpers/asynchandeler";
import ApiError from "../helpers/ApiError";
import ApiResponse from "../helpers/ApiResponse";
import { Request, Response, NextFunction, query } from "express";
import PrismaClient from "../prismaClient/index"
import { z } from "zod"
import RedisClient from "../Redis/redis.client"
import axios from "axios";

const request_forwarding = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

    const request = req.request
    const user_code = req.user_code
    if (!user_code) {
        throw new ApiError(400, "Invalid request")
    }

    // extract everything from request
    const options = {
        method: req.method,
        params: req.query,
        data: req.body,
        headers: req.headers,
        url: request.forwardUrl
    }

    const response_from_server = await axios(options)

    const response = new ApiResponse(response_from_server.status.toString(), response_from_server.data)

    // check if caching is enabled
    if (request.caching === true) {
        const key = `cache:${request.ownerId}:${req.url}:${user_code}`
        RedisClient.setex(key, request.cacheTime, JSON.stringify(response))
    }
    await PrismaClient.requestLog.create({
        data: {
            requestUrl: req.originalUrl,
            forwardUrl: request.forwardUrl,
            response: response_from_server.status.toString(),
            statusCode: response_from_server.status,
            duration: 0,
            userId: user_code.toString()
        }
    });


    return res.status(response_from_server.status).json(response_from_server.data)
})