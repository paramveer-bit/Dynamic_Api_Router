import asyncHandler from "../helpers/asynchandeler";
import ApiError from "../helpers/ApiError";
import ApiResponse from "../helpers/ApiResponse";
import { Request, Response } from "express";
import PrismaClient from "../prismaClient/index"
import { z } from "zod"


const addUserRateLimiting = asyncHandler(async (req: Request, res: Response) => {

    const { requestId, rateLimiting, user_code } = req.body
    if (!requestId || !rateLimiting || !user_code) throw new ApiError(400, "Bad Request")

    const result = PrismaClient.rateLimiting.create({
        data: {
            requestId,
            rate: rateLimiting,
            user_code
        }
    })

    if (!result) throw new ApiError(500, "Internal Server Error")

    const response = new ApiResponse("200", "Rate Limiting Added Successfully", JSON.stringify(result))

    res.status(200).json(response)
})

const getUserRateLimiting = asyncHandler(async (req: Request, res: Response) => {

    const { user_code } = req.body
    if (!user_code) throw new ApiError(400, "Bad Request")

    const result = PrismaClient.rateLimiting.findMany({
        where: {
            user_code
        }
    })

    if (!result) throw new ApiError(500, "Internal Server Error")

    const response = new ApiResponse("200", "Rate Limiting Added Successfully", JSON.stringify(result))

    res.status(200).json(response)
})

const modifyUserRateLimiting = asyncHandler(async (req: Request, res: Response) => {

    const { id, newRate } = req.body
    if (!id || !newRate) throw new ApiError(400, "Bad Request")

    const result = PrismaClient.rateLimiting.update({
        where: {
            id
        },
        data: {
            rate: newRate
        }
    })

    if (!result) throw new ApiError(500, "Internal Server Error")

    const response = new ApiResponse("200", "Rate Limiting Modified Successfully", JSON.stringify(result))

    res.status(200).json(response)
})

const deleteUserRateLimiting = asyncHandler(async (req: Request, res: Response) => {

    const { id } = req.body
    if (!id) throw new ApiError(400, "Bad Request")

    const result = PrismaClient.rateLimiting.delete({
        where: {
            id
        }
    })

    if (!result) throw new ApiError(500, "Internal Server Error")

    const response = new ApiResponse("200", "Rate Limiting Deleted Successfully", JSON.stringify(result))

    res.status(200).json(response)
})


export {
    addUserRateLimiting,
    getUserRateLimiting,
    modifyUserRateLimiting,
    deleteUserRateLimiting
}