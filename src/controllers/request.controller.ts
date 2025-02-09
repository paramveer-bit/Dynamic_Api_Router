import asyncHandler from "../helpers/asynchandeler";
import ApiError from "../helpers/ApiError";
import ApiResponse from "../helpers/ApiResponse";
import { Request, Response } from "express";
import PrismaClient from "../prismaClient/index"
import { z } from "zod"


const newRequestSchema = z.object({
    requestUrl: z.string().url({ message: "Invalid URL" }),
    forwardUrl: z.string().url({ message: "Invalid URL" }),
    rateLimiting: z.boolean().optional(),
    defaultRate: z.number().optional(),
    user_id: z.string(),
    caching: z.boolean().optional(),
    cacheTime: z.number().optional()
})

// Requests
const addNewRequest = asyncHandler(async (req: Request, res: Response) => {

    const { requestUrl, forwardUrl, rateLimiting, defaultRate, user_id, caching, cacheTime } = newRequestSchema.parse(req.body)

    if (forwardUrl.includes("sendhere")) throw new ApiError(400, "Invalid Forward URL")

    const result = PrismaClient.request.create({
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


    if (!result) throw new ApiError(500, "Internal Server Error")

    const response = new ApiResponse("200", "Request Added Successfully", JSON.stringify(result))

    res.status(200).json(response)
})

//Required auth
const getAllRequests = asyncHandler(async (req: Request, res: Response) => {
    const { user_id } = req.body


    const result = await PrismaClient.request.findMany({
        where: {
            ownerId: user_id
        }
    })

    if (!result) throw new ApiError(404, "No Requests Found")

    const response = new ApiResponse("200", "Requests Found", JSON.stringify(result))

    res.status(200).json(response)
})

const deleteRequest = asyncHandler(async (req: Request, res: Response) => {
    const { id, user_id } = req.params

    const result = await PrismaClient.request.delete({
        where: {
            id
        }
    })

    if (!result) throw new ApiError(404, "Request not found")

    const response = new ApiResponse("200", "Request Deleted Successfully", JSON.stringify(result))

    res.status(200).json(response)
})

const findRequestById = asyncHandler(async (req: Request, res: Response) => {
    const { id, user_id } = req.params

    const result = await PrismaClient.request.findUnique({
        where: {
            id, ownerId: user_id
        }
    })

    if (!result) throw new ApiError(404, "Request not found")

    const response = new ApiResponse("200", "Request Found", JSON.stringify(result))

    res.status(200).json(response)
})

//To modify request like modify caching.cachatime, rateLimiting, defaultRate

const modifyCacheTime = asyncHandler(async (req: Request, res: Response) => {
    const { id, user_id, cacheTime } = req.body
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

    const response = new ApiResponse("200", "Request Modified Successfully", JSON.stringify(result))

    res.status(200).json(response)
})

const modifyDefaultRateLimit = asyncHandler(async (req: Request, res: Response) => {
    const { id, user_id, defaultRate } = req.body
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

    const response = new ApiResponse("200", "Request Modified Successfully", JSON.stringify(result))

    res.status(200).json(response)
})

const toggelRateLimiting = asyncHandler(async (req: Request, res: Response) => {
    const { id, user_id } = req.body
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

    const response = new ApiResponse("200", "Request Modified Successfully", JSON.stringify(result))

    res.status(200).json(response)
})

const toggelCaching = asyncHandler(async (req: Request, res: Response) => {
    const { id, user_id } = req.body
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

    const response = new ApiResponse("200", "Request Modified Successfully", JSON.stringify(result))

    res.status(200).json(response)
})

//Modify banned user
const AddBanUser = asyncHandler(async (req: Request, res: Response) => {
    const { id, user_id, bannedUser } = req.body
    if (!id || !user_id || !bannedUser) throw new ApiError(400, "Invalid Request")

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
            bannedUser: {
                push: bannedUser
            }
        }
    })

    if (!result) throw new ApiError(404, "Request not found")

    const response = new ApiResponse("200", "Request Modified Successfully", JSON.stringify(result))

    res.status(200).json(response)
})

const RemoveBanUser = asyncHandler(async (req: Request, res: Response) => {
    const { id, user_id, bannedUser } = req.body
    if (!id || !user_id || !bannedUser) throw new ApiError(400, "Invalid Request")

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
            bannedUser: {
                set: request.bannedUser.filter((user) => user !== bannedUser)
            }
        }
    })

    if (!result) throw new ApiError(404, "Request not found")

    const response = new ApiResponse("200", "Request Modified Successfully", JSON.stringify(result))

    res.status(200).json(response)
})

const getListOfBannedUsers = asyncHandler(async (req: Request, res: Response) => {
    const { id, user_id } = req.body
    if (!id || !user_id) throw new ApiError(400, "Invalid Request")

    const request = await PrismaClient.request.findUnique({
        where: {
            id, ownerId: user_id
        }
    })

    if (!request) throw new ApiError(404, "Request not found")

    const response = new ApiResponse("200", "Request Found", JSON.stringify(request.bannedUser))

    res.status(200).json(response)
})



export { addNewRequest, getAllRequests, deleteRequest, findRequestById, modifyCacheTime, modifyDefaultRateLimit, toggelRateLimiting, toggelCaching, AddBanUser, RemoveBanUser, getListOfBannedUsers }