import asyncHandler from "../helpers/asynchandeler";
import ApiError from "../helpers/ApiError";
import ApiResponse from "../helpers/ApiResponse";
import { Request, Response } from "express";
import PrismaClient from "../prismaClient/index"
import { z } from "zod"


const newRequestSchema = z.object({
    requestUrl: z.string(),
    forwardUrl: z.string().url({ message: "Invalid URL" }),
    rateLimiting: z.boolean().optional(),
    defaultRate: z.number().optional(),
    caching: z.boolean().optional(),
    cacheTime: z.number().optional()
})

// Requests
const addNewRequest = asyncHandler(async (req: Request, res: Response) => {

    const { requestUrl, forwardUrl, rateLimiting, defaultRate, caching, cacheTime } = req.body
    const validatedData = newRequestSchema.safeParse({ requestUrl, forwardUrl, rateLimiting, defaultRate, caching, cacheTime })
    if (!validatedData.success) {
        throw new ApiError(400, validatedData.error.errors[0].message)
    }
    const user_id = req.user_id
    if (!user_id) throw new ApiError(400, "Invalid User")
    if (forwardUrl.includes("sendhere")) throw new ApiError(400, "Invalid Forward URL")

    const result = await PrismaClient.request.create({
        data: {
            ownerId: user_id,
            requestUrl,
            forwardUrl,
            defaultRate,
            rateLimiting,
            caching,
            cacheTime
        }
    })

    console.log(result)
    if (!result) throw new ApiError(500, "Internal Server Error")
    const response = new ApiResponse("200", result, "Request Added Successfully",)

    res.status(200).json(response)
})

//Required auth
const getAllRequests = asyncHandler(async (req: Request, res: Response) => {
    const user_id = req.user_id


    const result = await PrismaClient.request.findMany({
        where: {
            ownerId: user_id
        }
    })

    if (!result) throw new ApiError(404, "No Requests Found")

    const response = new ApiResponse("200", result, "Requests Found")

    res.status(200).json(response)
})

const deleteRequest = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params
    if (!id) throw new ApiError(400, "Invalid Request. Id of rquest needed to delete")
    const result = await PrismaClient.request.delete({
        where: {
            id
        }
    })

    if (!result) throw new ApiError(404, "Request not found")

    const response = new ApiResponse("200", result, "Request Deleted Successfully")

    res.status(200).json(response)
})

const findRequestById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params
    const user_id = req.user_id
    if (!id) {
        throw new ApiError(400, "Invalid Request. Id of rquest needed to find")
    }

    const result = await PrismaClient.request.findUnique({
        where: {
            id, ownerId: user_id
        }
    })

    if (!result) throw new ApiError(404, "Request not found")

    const response = new ApiResponse("200", result, "Request Found")

    res.status(200).json(response)
})

//To modify request like modify caching.cachatime, rateLimiting, defaultRate

const modifyCacheTime = asyncHandler(async (req: Request, res: Response) => {
    const { cacheTime } = req.body
    const { id } = req.params
    const user_id = req.user_id
    if (!id || !user_id || !cacheTime) throw new ApiError(400, "Invalid Request")

    const request = await PrismaClient.request.findUnique({
        where: {
            id, ownerId: user_id
        }
    })

    if (!request) throw new ApiError(404, "Request not found")

    const result = await PrismaClient.request.update({
        where: {
            id, ownerId: user_id
        },
        data: {
            cacheTime,
            caching: true
        }
    })

    if (!result) throw new ApiError(404, "Request not found")

    const response = new ApiResponse("200", result, "Request Modified Successfully")

    res.status(200).json(response)
})

const modifyDefaultRateLimit = asyncHandler(async (req: Request, res: Response) => {
    const { defaultRate } = req.body
    const { id } = req.params
    const user_id = req.user_id
    if (!id || !user_id || !defaultRate) throw new ApiError(400, "Invalid Request")

    const request = await PrismaClient.request.findUnique({
        where: {
            id, ownerId: user_id
        }
    })

    if (!request) throw new ApiError(404, "Request not found")

    const result = await PrismaClient.request.update({
        where: {
            id, ownerId: user_id
        },
        data: {
            rateLimiting: true,
            defaultRate
        }
    })

    if (!result) throw new ApiError(404, "Request not found")

    const response = new ApiResponse("200", result, "Request Modified Successfully")

    res.status(200).json(response)
})

const toggelRateLimiting = asyncHandler(async (req: Request, res: Response) => {
    const user_id = req.user_id
    const { id } = req.params
    if (!id || !user_id) throw new ApiError(400, "Invalid Request")

    const request = await PrismaClient.request.findUnique({
        where: {
            id, ownerId: user_id
        }
    })

    if (!request) throw new ApiError(404, "Request not found")

    const result = await PrismaClient.request.update({
        where: {
            id, ownerId: user_id
        },
        data: {
            rateLimiting: !request.rateLimiting
        }
    })

    if (!result) throw new ApiError(404, "Request not found")

    const response = new ApiResponse("200", result, "Request Modified Successfully")

    res.status(200).json(response)
})

const toggelCaching = asyncHandler(async (req: Request, res: Response) => {
    const user_id = req.user_id
    const { id } = req.params
    if (!id || !user_id) throw new ApiError(400, "Invalid Request")

    const request = await PrismaClient.request.findUnique({
        where: {
            id, ownerId: user_id
        }
    })

    if (!request) throw new ApiError(404, "Request not found")

    const result = await PrismaClient.request.update({
        where: {
            id, ownerId: user_id
        },
        data: {
            caching: !request.caching
        }
    })

    if (!result) throw new ApiError(404, "Request not found")

    const response = new ApiResponse("200", result, "Request Modified Successfully")

    res.status(200).json(response)
})

//Modify banned user
const AddBanUser = asyncHandler(async (req: Request, res: Response) => {
    const { bannedUser } = req.body
    const { id } = req.params

    const user_id = req.user_id
    if (!id || !user_id || !bannedUser) throw new ApiError(400, "Invalid Request")

    const request = await PrismaClient.request.findUnique({
        where: {
            id, ownerId: user_id
        }
    })

    if (!request) throw new ApiError(404, "Request not found")

    if (request.bannedUser.includes(bannedUser)) throw new ApiError(400, "User already banned")

    const result = await PrismaClient.request.update({
        where: {
            id, ownerId: user_id
        },
        data: {
            bannedUser: {
                push: bannedUser
            }
        }
    })

    if (!result) throw new ApiError(404, "Request not found")

    const response = new ApiResponse("200", result, "Request Modified Successfully")

    res.status(200).json(response)
})

const RemoveBanUser = asyncHandler(async (req: Request, res: Response) => {
    const { bannedUser } = req.body
    const { id } = req.params

    const user_id = req.user_id
    if (!id || !user_id || !bannedUser) throw new ApiError(400, "Invalid Request")

    const request = await PrismaClient.request.findUnique({
        where: {
            id, ownerId: user_id
        }
    })

    if (!request) throw new ApiError(404, "Request not found")

    if (!request.bannedUser.includes(bannedUser)) throw new ApiError(400, "User is not in banned list")

    const result = await PrismaClient.request.update({
        where: {
            id, ownerId: user_id
        },
        data: {
            bannedUser: {
                set: request.bannedUser.filter((user) => user !== bannedUser)
            }
        }
    })

    if (!result) throw new ApiError(404, "Request not found")

    const response = new ApiResponse("200", result, "Request Modified Successfully")

    res.status(200).json(response)
})

const getListOfBannedUsers = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params
    const user_id = req.user_id
    if (!id || !user_id) throw new ApiError(400, "Invalid Request")

    const request = await PrismaClient.request.findUnique({
        where: {
            id, ownerId: user_id
        }
    })

    if (!request) throw new ApiError(404, "Request not found")

    const response = new ApiResponse("200", request.bannedUser, "Request Found")

    res.status(200).json(response)
})



export { addNewRequest, getAllRequests, deleteRequest, findRequestById, modifyCacheTime, modifyDefaultRateLimit, toggelRateLimiting, toggelCaching, AddBanUser, RemoveBanUser, getListOfBannedUsers }