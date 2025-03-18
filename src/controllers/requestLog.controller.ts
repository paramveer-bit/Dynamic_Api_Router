import asyncHandler from "../helpers/asynchandeler";
import ApiError from "../helpers/ApiError";
import ApiResponse from "../helpers/ApiResponse";
import { Request, response, Response } from "express";
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

    //-------------------------------Total users-----------------------------------------------------
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

    // -------------------------------Total Error ---------------------------------------------

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

// Api Anaytics Page Routes

const DataByDays = asyncHandler(async (req: Request, res: Response) => {
    const user_id = req.user_id

    const days = z.number().parse(Number(req.query.days))
    console.log(days)

    if (!user_id) throw new ApiError(400, "Invalid Request")

    let dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);
    // Start of the day
    let startOfDay = new Date(dateThreshold);
    startOfDay.setHours(0, 0, 0, 0);

    // End of the day
    let endOfDay = new Date(dateThreshold);
    endOfDay.setHours(23, 59, 59, 999);


    // -------------------------------------------------Current Period -------------------------------------------------------------------------------------

    //-------------------------------Total users-----------------------------------------------------
    const result = await PrismaClient.requestLog.groupBy({
        by: ['userId'],
        where: {
            Request: {
                ownerId: user_id
            },
            createdAt: {
                gte: startOfDay,
            }
        }
    });
    //-------------------------------------Total Errors--------------------------------------------
    const errors = await PrismaClient.requestLog.findMany({
        where: {
            Request: {
                ownerId: user_id
            },
            createdAt: {
                gte: startOfDay,
            },
            statusCode: {
                gt: 399
            }
        }
    })
    // ------------------------------Total Requests This Month-------------------------------------------
    const resuests = await PrismaClient.requestLog.findMany({
        where: {
            Request: {
                ownerId: user_id
            },
            createdAt: {
                gte: startOfDay, // Greater than or equal to the start of the day
            }
        }
    })
    // ------------------------------ Average Response Time -------------------------------------------
    const totalResponseTime = await PrismaClient.requestLog.aggregate({
        _avg: {
            duration: true
        },
        where: {
            Request: {
                ownerId: user_id
            },
            createdAt: {
                gte: startOfDay,
            }
        }
    })

    // -------------------------------------------------Previos  Period -------------------------------------------------------------------------------------

    dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - 2 * days);

    endOfDay = startOfDay;
    // Start of the day
    startOfDay = new Date(dateThreshold);
    startOfDay.setHours(0, 0, 0, 0);
    //-------------------------------Total users-----------------------------------------------------

    //-------------------------------Total users-----------------------------------------------------
    const result2 = await PrismaClient.requestLog.groupBy({
        by: ['userId'],
        where: {
            Request: {
                ownerId: user_id
            },
            createdAt: {
                gte: startOfDay,
                lt: endOfDay
            }
        }
    });
    //-------------------------------------Total Errors--------------------------------------------
    const errors2 = await PrismaClient.requestLog.findMany({
        where: {
            Request: {
                ownerId: user_id
            },
            createdAt: {
                gte: startOfDay,
                lt: endOfDay
            },
            statusCode: {
                gt: 399
            }
        }
    })
    // ------------------------------Total Requests This Month-------------------------------------------
    const resuests2 = await PrismaClient.requestLog.findMany({
        where: {
            Request: {
                ownerId: user_id
            },
            createdAt: {
                gte: startOfDay,
                lt: endOfDay // Greater than or equal to the start of the day
            }
        }
    })
    // ------------------------------ Average Response Time -------------------------------------------
    const totalResponseTime2 = await PrismaClient.requestLog.aggregate({
        _avg: {
            duration: true
        },
        where: {
            Request: {
                ownerId: user_id
            },
            createdAt: {
                gte: startOfDay,
                lt: endOfDay
            }
        }
    })


    const resul = {
        users: {
            total: result.length,
            change: result.length - result2.length
        },
        requests: {
            total: resuests.length,
            change: resuests.length - resuests2.length
        },
        errors: {
            total: errors.length,
            change: errors.length - errors2.length
        },
        average_response_time: {
            total: totalResponseTime._avg.duration || 0,
            change: (totalResponseTime._avg.duration || 0) - (totalResponseTime2._avg.duration || 0)
        }

    }

    const response = new ApiResponse("200", resul, "Requests Found")

    res.status(200).json(response)

})

const apiUsageChart = asyncHandler(async (req: Request, res: Response) => {
    const user_id = req.user_id

    const days = z.number().parse(Number(req.query.days))

    if (!user_id) throw new ApiError(400, "Invalid Request")

    let dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);
    // Start of the day
    let startOfDay = new Date(dateThreshold);
    startOfDay.setHours(0, 0, 0, 0);

    const result = await PrismaClient.requestLog.groupBy({
        by: ['createdAt'],
        _count: {
            id: true
        },
        where: {
            Request: {
                ownerId: user_id
            },
            createdAt: {
                gte: startOfDay,
            }
        },
        orderBy: {
            createdAt: 'asc'
        }

    })

    const groupedLogs = result.reduce((acc: { [key: string]: number }, log) => {
        const date = log.createdAt.toISOString().split('T')[0]; // Extract YYYY-MM-DD
        acc[date] = (acc[date] || 0) + 1;
        return acc;
    }, {});

    const formatted = Object.entries(groupedLogs).map(([timestamp, requests]) => ({ timestamp, requests }));


    const response = new ApiResponse("200", formatted, "Requests Found")

    res.status(200).json(response)

})

const ApiEndPointsUtilization = asyncHandler(async (req: Request, res: Response) => {
    const user_id = req.user_id

    const days = z.number().parse(Number(req.query.days))

    if (!user_id) throw new ApiError(400, "Invalid Request")

    let dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);
    // Start of the day
    let startOfDay = new Date(dateThreshold);
    startOfDay.setHours(0, 0, 0, 0);

    const result = await PrismaClient.requestLog.groupBy({
        by: ['requestId'],
        _count: { id: true },
        where: {
            Request: { ownerId: user_id },
            createdAt: { gte: startOfDay },
        }
    });

    const requests = await PrismaClient.request.findMany({
        where: {
            ownerId: user_id
        }
    })

    const formatted = requests.map((request) => {
        const temp = result.find((log) => request.id === log.requestId);
        return {
            endpoint: request?.requestUrl,
            requests: temp?._count?.id || 0
        };
    });

    const response = new ApiResponse("200", formatted, "Requests Found")

    res.status(200).json(response)

})

const EndPointsResponseTime = asyncHandler(async (req: Request, res: Response) => {
    const user_id = req.user_id

    const days = z.number().parse(Number(req.query.days))

    if (!user_id) throw new ApiError(400, "Invalid Request")

    let dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);
    // Start of the day
    let startOfDay = new Date(dateThreshold);
    startOfDay.setHours(0, 0, 0, 0);

    const result = await PrismaClient.requestLog.groupBy({
        by: ['requestId'],
        _avg: { duration: true },
        where: {
            Request: { ownerId: user_id },
            createdAt: { gte: startOfDay },
        }
    });

    const requests = await PrismaClient.request.findMany({
        where: {
            ownerId: user_id
        }
    })

    const formatted = requests.map((request) => {
        const temp = result.find((log) => request.id === log.requestId);
        return {
            endpoint: request?.requestUrl,
            responseTime: temp?._avg?.duration || 0
        };
    });

    const response = new ApiResponse("200", formatted, "Requests Found")

    res.status(200).json(response)

})

const statusCodes = asyncHandler(async (req: Request, res: Response) => {
    const user_id = req.user_id

    const days = z.number().parse(Number(req.query.days))

    if (!user_id) throw new ApiError(400, "Invalid Request")

    let dateThreshold = new Date()
    dateThreshold.setDate(dateThreshold.getDate() - days)
    // Start of the day
    let startOfDay = new Date(dateThreshold)
    startOfDay.setHours(0, 0, 0, 0)

    const result = await PrismaClient.requestLog.groupBy({
        by: ['statusCode'],
        _count: { id: true },
        where: {
            Request: { ownerId: user_id },
            createdAt: { gte: startOfDay },
        }
    })

    // Grouppoin Status codes
    const grouping = result.reduce((acc: { [key: string]: number }, log) => {
        const temp = ((log.statusCode - log.statusCode % 100) / 100);
        acc[temp] = (acc[temp] || 0) + log._count.id;
        return acc;
    }, {});

    const formatted = Object.entries(grouping).map(([statusCode, count]) => ({ statusCode: statusCode.toString() + "xx", count }));

    const response = new ApiResponse("200", formatted, "Requests Found")

    res.status(200).json(response)
})

const last5Min = asyncHandler(async (req: Request, res: Response) => {
    const user_id = req.user_id

    if (!user_id) throw new ApiError(400, "Invalid Request")

    const result = await PrismaClient.requestLog.findMany({
        where: {
            Request: {
                ownerId: user_id
            },
            createdAt: {
                gte: new Date(new Date().getTime() - (5 * 60 * 1000))
            }
        }
    })
    const response = new ApiResponse("200", result, "Requests Found")

    res.status(200).json(response)

})
const routeSpecificData = asyncHandler(async (req: Request, res: Response) => {
    console.log("Requets recieved")
    const user_id = req.user_id

    const route_id = req.query.routeId
    const days = z.number().parse(Number(req.query.days))

    if (!user_id) throw new ApiError(400, "Invalid Request")

    let dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);
    // Start of the day
    let startOfDay = new Date(dateThreshold);
    startOfDay.setHours(0, 0, 0, 0);

    if (!route_id) throw new ApiError(400, "Invalid Request")

    const route = await PrismaClient.request.findFirst({
        where: {
            id: route_id.toString(),
            ownerId: user_id,
        }
    })

    if (!route) throw new ApiError(404, "No Route Found with this Route id")

    // Requests
    const requests = await PrismaClient.requestLog.groupBy({
        by: ['createdAt'],
        _count: { id: true },
        where: {
            requestId: route_id.toString(),
            createdAt: { gte: startOfDay },
        }
    })

    // Errors
    const errors = await PrismaClient.requestLog.groupBy({
        by: ['createdAt'],
        _count: { id: true },
        where: {
            requestId: route_id.toString(),
            createdAt: { gte: startOfDay },
            statusCode: { gt: 399 }
        },
        orderBy: {
            createdAt: 'asc'
        }
    })

    // Average Response Time
    const avgResponseTime = await PrismaClient.requestLog.groupBy({
        by: ['createdAt'],
        _avg: { duration: true },
        where: {
            requestId: route_id.toString(),
            createdAt: { gte: startOfDay },
        }
    })

    // console.log(requests, errors, avgResponseTime)

    const groupedErrors = errors.reduce((acc: { [key: string]: number }, log) => {
        const date = log.createdAt.toISOString().split('T')[0]; // Extract YYYY-MM-DD
        acc[date] = acc[date] || 0 + log._count.id;
        return acc;
    }, {});


    const averageResponse = avgResponseTime.reduce((acc: { [key: string]: any }, log) => {
        const date = log.createdAt.toISOString().split('T')[0]; // Extract YYYY-MM-DD
        acc[date] = {
            responseTime: log._avg.duration,
            count: 1 + (acc[date]?.count || 0)
        }
        return acc;
    }, {});

    const groupedRequests = requests.reduce((acc: { [key: string]: number }, log) => {
        const date = log.createdAt.toISOString().split('T')[0]; // Extract YYYY-MM-DD
        acc[date] = acc[date] || 0 + log._count.id;
        return acc;
    }, {});

    // console.log(errors)

    interface data {
        requests: number,
        errors: number,
        avgResponseTime: number,
        count: number
    }
    // console.log(errors)


    const formatted = Object.entries(groupedRequests).map(([timestamp, data]) => {
        return {
            timestamp,
            requests: data,
            errors: groupedErrors[timestamp] || 0,
            responseTime: Math.round(averageResponse[timestamp]?.responseTime / averageResponse[timestamp].count) || 0,
        }
    })


    const response = new ApiResponse("200", formatted, "Requests Founded")

    res.status(200).json(response)


})


// User Analytics Page Routes
const userDetailsByDays = asyncHandler(async (req: Request, res: Response) => {
    const user_id = req.user_id

    const user_code = req.query.user_code
    const days = z.number().parse(Number(req.query.days))

    if (!user_id) throw new ApiError(400, "Invalid Request")

    if (!user_code) throw new ApiError(400, "Invalid Request")

    let dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);
    // Start of the day
    let startOfDay = new Date(dateThreshold);
    startOfDay.setHours(0, 0, 0, 0);

    // -----------------------------------------UserDeatils------------------------------------------
    const userDeatils = await PrismaClient.requestLog.findFirst({
        where: {
            Request: {
                ownerId: user_id
            },
            userId: user_code.toString()
        }
    })
    if (!userDeatils) throw new ApiError(404, "No User Found with this UserCode")
    //-------------------------------------------------Current Period ------------------------------------------------------------------------------------- 

    // -----------------------------------------Total Requests------------------------------------------
    const totalRequests = await PrismaClient.requestLog.findMany({
        where: {
            Request: {
                ownerId: user_id
            },
            createdAt: {
                gte: startOfDay
            },
            userId: user_code.toString()
        }
    })

    // -----------------------------------------Total Errors------------------------------------------
    const totalErrors = await PrismaClient.requestLog.findMany({
        where: {
            Request: {
                ownerId: user_id
            },
            createdAt: {
                gte: startOfDay
            },
            userId: user_code.toString(),
            statusCode: {
                gt: 399
            }
        }
    })

    // -----------------------------------------Average Response Time------------------------------------------
    const averageResponseTime = await PrismaClient.requestLog.aggregate({
        _avg: {
            duration: true
        },
        where: {
            Request: {
                ownerId: user_id
            },
            createdAt: {
                gte: startOfDay
            },
            userId: user_code.toString()
        }
    })

    // -------------------------------Active Days -------------------------------------------------
    const activeDays = await PrismaClient.requestLog.groupBy({
        by: ['createdAt'],
        where: {
            Request: {
                ownerId: user_id
            },
            userId: user_code.toString()
        }
    })

    //-------------------------------------------Previous Period -------------------------------------------------------------------------------------
    const endOfDay = startOfDay;
    dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - 2 * days);
    // Start of the day
    startOfDay = new Date(dateThreshold);
    startOfDay.setHours(0, 0, 0, 0);

    // -----------------------------------------Total Requests------------------------------------------
    const totalRequests2 = await PrismaClient.requestLog.findMany({
        where: {
            Request: {
                ownerId: user_id
            },
            createdAt: {
                gte: startOfDay,
                lt: endOfDay
            },
            userId: user_code.toString()
        }
    })

    // -----------------------------------------Total Errors------------------------------------------
    const totalErrors2 = await PrismaClient.requestLog.findMany({
        where: {
            Request: {
                ownerId: user_id
            },
            createdAt: {
                gte: startOfDay,
                lt: endOfDay
            },
            userId: user_code.toString(),
            statusCode: {
                gt: 399
            }
        }
    })

    // -----------------------------------------Average Response Time------------------------------------------
    const averageResponseTime2 = await PrismaClient.requestLog.aggregate({
        _avg: {
            duration: true
        },
        where: {
            Request: {
                ownerId: user_id
            },
            createdAt: {
                gte: startOfDay,
                lt: endOfDay
            },
            userId: user_code.toString()
        }
    })

    // -------------------------------Active Days -------------------------------------------------
    const activeDays2 = await PrismaClient.requestLog.groupBy({
        by: ['createdAt'],
        where: {
            Request: {
                ownerId: user_id
            },
            userId: user_code.toString()
        }
    })

    const resul = {
        userDetails: userDeatils,
        average_response_time: {
            total: averageResponseTime._avg.duration || 0,
            change: (averageResponseTime._avg.duration || 0) - (averageResponseTime2._avg.duration || 0)
        },
        requests: {
            total: totalRequests.length,
            change: totalRequests.length - totalRequests2.length
        },
        errors: {
            total: totalErrors.length,
            change: totalErrors.length - totalErrors2.length
        },
        active_days: {
            total: activeDays.length,
            change: activeDays.length - activeDays2.length
        }
    }

    const response = new ApiResponse("200", resul, "Requests Found")

    res.status(200).json(response)

})

const userApiEndpoints = asyncHandler(async (req: Request, res: Response) => {

    const user_id = req.user_id

    const user_code = req.query.user_code
    const days = z.number().parse(Number(req.query.days))

    if (!user_id) throw new ApiError(400, "Invalid Request")

    if (!user_code) throw new ApiError(400, "Invalid Request")

    let dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);
    // Start of the day
    let startOfDay = new Date(dateThreshold);
    startOfDay.setHours(0, 0, 0, 0);

    const user = await PrismaClient.requestLog.findFirst({
        where: {
            Request: {
                ownerId: user_id
            },
            userId: user_code.toString()
        }
    })

    if (!user) throw new ApiError(404, "No User Found with this UserCode")

    const result = await PrismaClient.requestLog.groupBy({
        by: ['requestId'],
        _count: { id: true },
        _avg: { duration: true },
        where: {
            Request: { ownerId: user_id },
            createdAt: { gte: startOfDay },
            userId: user_code.toString()
        }

    })
    const requests = await PrismaClient.request.findMany({
        where: {
            ownerId: user_id
        }
    })

    const formatted = requests.map((request) => {
        const temp = result.find((log) => request.id === log.requestId);
        return {
            endpoint: request?.requestUrl,
            requests: temp?._count?.id || 0,
            avgResponseTime: temp?._avg?.duration || 0
        };
    }
    );

    const response = new ApiResponse("200", formatted, "Requests Found")

    res.status(200).json(response)

})

const deviceDetails = asyncHandler(async (req: Request, res: Response) => {
    const user_id = req.user_id

    const user_code = req.query.user_code
    const days = z.number().parse(Number(req.query.days))

    if (!user_id) throw new ApiError(400, "Invalid Request")
    if (!user_code) throw new ApiError(400, "Invalid Request")

    let dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);
    // Start of the day
    let startOfDay = new Date(dateThreshold);
    startOfDay.setHours(0, 0, 0, 0);

    const user = await PrismaClient.requestLog.findFirst({
        where: {
            Request: {
                ownerId: user_id
            },
            userId: user_code.toString()
        }
    })

    if (!user) throw new ApiError(404, "No User Found with this UserCode")

    const browser = await PrismaClient.requestLog.groupBy({
        by: ['browser'],
        _count: { id: true },
        where: {
            Request: { ownerId: user_id },
            createdAt: { gte: startOfDay },
            userId: user_code.toString()
        }
    })


    const modifiedBrowserData = browser.map((data) => {
        return {
            name: data.browser == null ? "Unknown" : data.browser,
            value: data._count.id
        }
    })

    const device = await PrismaClient.requestLog.groupBy({
        by: ['os'],
        _count: { id: true },
        where: {
            Request: { ownerId: user_id },
            createdAt: { gte: startOfDay },
            userId: user_code.toString()
        }
    })
    const modifiedDeviceData = device.map((data) => {
        return {
            name: data.os == null ? "Unknown" : data.os,
            value: data._count.id
        }
    })

    const formatted = {
        browser: modifiedBrowserData,
        device: modifiedDeviceData
    }

    const response = new ApiResponse("200", formatted, "Requests Found")

    res.status(200).json(response)

})

const userActivityData = asyncHandler(async (req: Request, res: Response) => {
    console.log("Requets recieved")
    const user_id = req.user_id

    const user_code = req.query.user_code
    const days = z.number().parse(Number(req.query.days))

    if (!user_id) throw new ApiError(400, "Invalid Request")
    if (!user_code) throw new ApiError(400, "Invalid Request")

    let dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);
    // Start of the day
    let startOfDay = new Date(dateThreshold);
    startOfDay.setHours(0, 0, 0, 0);


    const user = await PrismaClient.requestLog.findFirst({
        where: {
            Request: {
                ownerId: user_id
            },
            userId: user_code.toString()
        }
    })

    if (!user) throw new ApiError(404, "No User Found with this UserCode")

    // Requests
    const requests = await PrismaClient.requestLog.groupBy({
        by: ['createdAt'],
        _count: { id: true },
        where: {
            Request: { ownerId: user_id },
            createdAt: { gte: startOfDay },
            userId: user_code.toString()
        }
    })

    // Errors
    const errors = await PrismaClient.requestLog.groupBy({
        by: ['createdAt'],
        _count: { id: true },
        where: {
            Request: { ownerId: user_id },
            createdAt: { gte: startOfDay },
            userId: user_code.toString(),
            statusCode: { gt: 399 }
        },
        orderBy: {
            createdAt: 'asc'
        }
    })

    // Average Response Time
    const avgResponseTime = await PrismaClient.requestLog.groupBy({
        by: ['createdAt'],
        _avg: { duration: true },
        where: {
            Request: { ownerId: user_id },
            createdAt: { gte: startOfDay },
            userId: user_code.toString(),
        }
    })

    // console.log(requests, errors, avgResponseTime)

    const groupedErrors = errors.reduce((acc: { [key: string]: number }, log) => {
        const date = log.createdAt.toISOString().split('T')[0]; // Extract YYYY-MM-DD
        acc[date] = acc[date] || 0 + log._count.id;
        return acc;
    }, {});


    const averageResponse = avgResponseTime.reduce((acc: { [key: string]: any }, log) => {
        const date = log.createdAt.toISOString().split('T')[0]; // Extract YYYY-MM-DD
        acc[date] = {
            responseTime: log._avg.duration,
            count: 1 + (acc[date]?.count || 0)
        }
        return acc;
    }, {});

    const groupedRequests = requests.reduce((acc: { [key: string]: number }, log) => {
        const date = log.createdAt.toISOString().split('T')[0]; // Extract YYYY-MM-DD
        acc[date] = acc[date] || 0 + log._count.id;
        return acc;
    }, {});

    // console.log(errors)

    interface data {
        requests: number,
        errors: number,
        avgResponseTime: number,
        count: number
    }
    // console.log(errors)


    const formatted = Object.entries(groupedRequests).map(([timestamp, data]) => {
        return {
            timestamp,
            requests: data,
            errors: groupedErrors[timestamp] || 0,
            responseTime: Math.round(averageResponse[timestamp]?.responseTime / averageResponse[timestamp].count) || 0,
        }
    })


    const response = new ApiResponse("200", formatted, "Requests Founded")

    res.status(200).json(response)


})

const userLast5Min = asyncHandler(async (req: Request, res: Response) => {
    const user_id = req.user_id

    if (!user_id) throw new ApiError(400, "Invalid Request")
    const user_code = req.query.user_code

    if (!user_code) throw new ApiError(400, "Invalid Request")

    const result = await PrismaClient.requestLog.findMany({
        where: {
            Request: {
                ownerId: user_id
            },
            userId: user_code.toString(),
            createdAt: {
                gte: new Date(new Date().getTime() - (5 * 60 * 1000))
            }
        }
    })
    const response = new ApiResponse("200", result, "Requests Found")

    res.status(200).json(response)

})





export { routeSpecificData, statusCodes, userLast5Min, userActivityData, deviceDetails, userApiEndpoints, userDetailsByDays, last5Min, ApiEndPointsUtilization, EndPointsResponseTime, getRequestLogByrequestId, allData, apiUsageChart, getRequestLogByUserId, getAllRequestsThisMonthByClientId, last24Hours, DataByDays }