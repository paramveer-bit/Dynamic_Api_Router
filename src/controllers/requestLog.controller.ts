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



const allData = asyncHandler(async (req: Request, res: Response) => {
    const user_id = req.user_id

    if (!user_id) throw new ApiError(400, "Invalid Request")

    //-------------------------------Total users
    const result = await PrismaClient.requestLog.groupBy({
        by: ['userId'],
        where: {
            Request: {
                ownerId: user_id
            },

        }
    })

    //-------------------------------------users in last 24hr--------------------------------------------
    const active_user = await PrismaClient.requestLog.groupBy({
        by: ['userId'],
        where: {
            Request: {
                ownerId: user_id
            },
            createdAt: {
                gte: new Date(new Date().getTime() - (24 * 60 * 60 * 1000))
            }
        }
    })

    //-------------------------------Total total_routes----------------------------------------
    const total_routes = await PrismaClient.request.groupBy({
        by: ['id'],
        where: {
            ownerId: user_id
        }
    })

    const new_routes_this_month = await PrismaClient.request.groupBy({
        by: ['id'],
        where: {
            ownerId: user_id,
            createdAt: {
                gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                lte: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
            }
        }
    })




    // ------------------------------Total Requests This Month-------------------------------------------
    const month_reuests = await PrismaClient.requestLog.findMany({
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
    const previous_month_reuests = await PrismaClient.requestLog.findMany({
        where: {
            Request: {
                ownerId: user_id
            },
            createdAt: {
                gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
                lte: new Date(new Date().getFullYear(), new Date().getMonth(), 0)
            }
        }
    })

    const resul = {
        total_users: {
            total_user: result.length
        },
        routes: {
            total_routes: total_routes.length,
            increase: new_routes_this_month.length
        },
        active_user: {
            total_active_user: active_user.length
        },
        requests: {
            this_month: month_reuests.length,
            prev_month: previous_month_reuests.length
        }
    }

    const response = new ApiResponse("200", resul, "Requests Found")

    res.status(200).json(response)

})


export { getRequestLogByrequestId, allData, getRequestLogByUserId, getAllRequestsThisMonthByClientId, last24Hours }