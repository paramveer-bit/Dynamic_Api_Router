import asyncHandler from "../helpers/asynchandeler";
import ApiError from "../helpers/ApiError";
import ApiResponse from "../helpers/ApiResponse";
import { Request, Response, NextFunction } from "express";
import PrismaClient from "../prismaClient/index"
import ReuestExtractor from "../helpers/routeMatcher"
const UAParser = require("ua-parser-js");




const temp = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // Extractin device details

    const userAgent = req.headers["user-agent"];
    const parser = new UAParser(userAgent);
    const result = parser.getResult();

    req.device = {
        browser: result.browser.name,
        os: result.os.name,
        device: result.device.type
    }
    var requestedUrl = req.path
    const { user_code, secret } = req.headers
    console.log(requestedUrl)
    console.log(req.url)
    if (!user_code || !secret) {
        throw new ApiError(400, "Invalid request")
    }
    console.log(secret)
    // Find user with this secret
    const user = await PrismaClient.user.findFirst({
        where: {
            secret: secret.toString()
        }
    })

    if (!user) {
        throw new ApiError(404, "User not found")
    }

    // Find the reuquest stored in database
    const requests = await PrismaClient.request.findMany({
        where: {
            User: {
                secret: secret.toString()
            }
        }
    })
    const request = ReuestExtractor(requestedUrl, requests)
    if (!request) {
        await PrismaClient.requestLog.create({
            data: {
                requestUrl: requestedUrl,
                forwardUrl: "NIL",
                response: "Request not found",
                comment: "No request found in the database with given secret and requested url",
                statusCode: 404,
                duration: 0,
                userId: user_code.toString(),
                type: req.method,
                browser: req.device.browser,
                os: req.device.os,
            }
        })
        throw new ApiError(404, "Request not found")
    }

    if (request.bannedUser.includes(user_code.toString())) {
        await PrismaClient.requestLog.create({
            data: {
                requestId: request.id,
                requestUrl: requestedUrl,
                forwardUrl: "NIL",
                response: "User is banned",
                comment: "Request is not forwared. User is banned",
                statusCode: 403,
                duration: 0,
                userId: user_code.toString(),
                type: req.method,
                browser: req.device.browser,
                os: req.device.os,
            }
        })
        throw new ApiError(403, "User is banned")
    }

    req.request = request
    req.user_code = user_code.toString()
    console.log("Request extracted")
    return next()

})


export default temp
