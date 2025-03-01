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

const getAllRequestsThisMonthByClientId = asyncHandler(async (req: Request, res: Response) => {
    const user_id = req.user_id

    if (!user_id) throw new ApiError(400, "Invalid Request")

    const result = await PrismaClient.requestLog.findMany({
        where: {
            Request: {
                ownerId: user_id
            },
            createdAt: {
                gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                lte: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
            }

        }
    })
    const response = new ApiResponse("200", result, "Requests Found")

    res.status(200).json(response)

})

const last24Hours = asyncHandler(async (req: Request, res: Response) => {
    const user_id = req.user_id

    if (!user_id) throw new ApiError(400, "Invalid Request")

    const result = await PrismaClient.requestLog.findMany({
        where: {
            Request: {
                ownerId: user_id
            },
            createdAt: {
                gte: new Date(new Date().getTime() - (24 * 60 * 60 * 1000))
            }
        }
    })
    const response = new ApiResponse("200", result, "Requests Found")

    res.status(200).json(response)

})

const totaluser = asyncHandler(async (req: Request, res: Response) => {
    const user_id = req.user_id

    if (!user_id) throw new ApiError(400, "Invalid Request")

    const result = await PrismaClient.requestLog.groupBy({
        by: ['userId'],
        where: {
            Request: {
                ownerId: user_id
            },

        }
    })

    const response = new ApiResponse("200", { total_user: result.length }, "Requests Found")

    res.status(200).json(response)

})

const totalroutes = asyncHandler(async (req: Request, res: Response) => {
    const user_id = req.user_id

    if (!user_id) throw new ApiError(400, "Invalid Request")

    const result = await PrismaClient.request.groupBy({
        by: ['id'],
        where: {
            ownerId: user_id
        }
    })

    const response = new ApiResponse("200", { total_routes: result.length }, "Requests Found")

    res.status(200).json(response)
})

const totalRequestsThisMonth = asyncHandler(async (req: Request, res: Response) => {
    const user_id = req.user_id

    if (!user_id) throw new ApiError(400, "Invalid Request")

    const result = await PrismaClient.requestLog.findMany({
        where: {
            Request: {
                ownerId: user_id
            },
            createdAt: {
                gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                lte: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
            }

        }
    })
    const response = new ApiResponse("200", { total: result.length }, "Requests Found")

    res.status(200).json(response)
})


export { getRequestLogByrequestId, totalRequestsThisMonth, totalroutes, getRequestLogByUserId, getAllRequestsThisMonthByClientId, last24Hours, totaluser }