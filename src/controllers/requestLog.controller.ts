import asyncHandler from "../helpers/asynchandeler";
import ApiError from "../helpers/ApiError";
import ApiResponse from "../helpers/ApiResponse";
import { Request, Response } from "express";
import PrismaClient from "../prismaClient/index"
import { z } from "zod"


const getRequestLogByrequestId = asyncHandler(async (req: Request, res: Response) => {
    const { requestId } = req.body

    if (!requestId) throw new ApiError(400, "Invalid Request")

    const result = await PrismaClient.requestLog.findMany({
        where: {
            requestId
        }
    })

    if (!result) throw new ApiError(404, "No Requests Found")

    const response = new ApiResponse("200", "Requests Found", JSON.stringify(result))

    res.status(200).json(response)
})


const getRequestLogByUserId = asyncHandler(async (req: Request, res: Response) => {
    const { userId, requestId } = req.body

    if (!userId) throw new ApiError(400, "Invalid Request")

    const result = await PrismaClient.requestLog.findMany({
        where: {
            Request: {
                id: requestId
            },
            userId
        }
    })

    if (!result) throw new ApiError(404, "No Requests Found")

    const response = new ApiResponse("200", "Requests Found", JSON.stringify(result))

    res.status(200).json(response)
})

export { getRequestLogByrequestId, getRequestLogByUserId }