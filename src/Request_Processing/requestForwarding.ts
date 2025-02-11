import { Request, Response, NextFunction } from "express";
import { createProxyMiddleware, Options } from 'http-proxy-middleware';
import ApiError from "../helpers/ApiError";
import PrismaClient from "../prismaClient/index";
import RedisClient from "../Redis/redis.client";
import { ClientRequest, IncomingMessage, ServerResponse } from "http";
import { Socket } from "net";
import exp from "constants";

const request_forwarding = (requ: Request, resu: Response, next: NextFunction) => {
    const user_code = requ.user_code;
    const request = requ.request;

    if (!user_code) {
        return next(new ApiError(400, "Invalid request: User code missing"));
    }

    if (!request || !request.forwardUrl) {
        return next(new ApiError(400, "Invalid request configuration"));
    }

    const proxyOptions: Options = {
        target: request.forwardUrl,
        changeOrigin: true,
        secure: false,// logLevel: 'debug', // For debugging, remove in production
        pathRewrite: function (path, requ) {
            console.log(path)
            return path.replace('/api/send-message', '')
        },
        ws: false,
        timeout: 10000, // 10 seconds
        selfHandleResponse: true,

        on: {
            proxyReq: (proxyReq: ClientRequest, req: IncomingMessage, res: ServerResponse) => {
                const expressReq = req as Request; // Cast to Express Request type

                proxyReq.setHeader('user_code', user_code);
                if (req.headers.authorization) {
                    proxyReq.setHeader('authorization', req.headers.authorization);
                }
                proxyReq.setHeader('connection', 'close');
                proxyReq.removeHeader('postman-token');
                proxyReq.setHeader('user-agent', 'api-router');

                if (requ.body) {
                    const bodyData = JSON.stringify(requ.body);
                    proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyData));
                    proxyReq.write(bodyData);
                }
            },

            proxyRes: async (proxyRes: IncomingMessage, req: IncomingMessage, res: ServerResponse) => {
                let responseBody = '';
                proxyRes.on('data', (chunk) => {
                    responseBody += chunk;
                });

                proxyRes.on('end', async () => {
                    try {
                        let parsedResponseBody;
                        try {
                            parsedResponseBody = JSON.parse(responseBody);
                        } catch {
                            parsedResponseBody = responseBody;
                        }

                        // Caching logic
                        if (request.caching === true) {
                            const cacheTime = isNaN(parseInt(request.cacheTime, 10)) ? 60 : parseInt(request.cacheTime, 10);
                            const cacheKey = `cache:${request.ownerId}:${req.url}:${user_code}`;

                            try {
                                await RedisClient.setex(cacheKey, cacheTime, JSON.stringify(parsedResponseBody));
                                console.log(`Cached response for ${req.url} with key ${cacheKey}`);
                            } catch (redisError) {
                                console.error("Redis caching error:", redisError);
                            }
                        }

                        // Prisma logging
                        try {
                            await PrismaClient.requestLog.create({
                                data: {
                                    requestUrl: req.url || "error in extracting url",
                                    forwardUrl: request.forwardUrl,
                                    response: proxyRes.statusMessage ?? "OK",
                                    statusCode: proxyRes.statusCode ?? 500,
                                    duration: 0,
                                    userId: user_code.toString()
                                }
                            });
                            console.log(`Logged request to Prisma`);
                        } catch (prismaError) {
                            console.error("Prisma logging error:", prismaError);
                        }

                        // ✅ Ensure response is sent only once
                        if (!res.writableEnded) {
                            res.writeHead(proxyRes.statusCode || 500, proxyRes.headers);
                            res.end(parsedResponseBody);
                        }
                    } catch (error) {
                        console.error("Error in onProxyRes:", error);
                        if (!res.writableEnded) {
                            res.writeHead(500, { "Content-Type": "application/json" });
                            res.end(JSON.stringify({ error: "Internal Server Error" }));
                        }
                    }
                });
            },

            error: (err: Error, req: IncomingMessage, res: ServerResponse | Socket) => {
                console.error("Proxy error:", err);
                if (res instanceof ServerResponse) {
                    if (!res.writableEnded) {
                        res.writeHead(500, { "Content-Type": "application/json" });
                        res.end(JSON.stringify({ error: "Proxy error" }));
                    }
                } else {
                    res.end("Proxy error");
                }
            }
        }
    };

    const proxy = createProxyMiddleware(proxyOptions);
    proxy(requ, resu, next);
};

export default request_forwarding;