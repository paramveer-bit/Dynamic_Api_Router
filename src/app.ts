import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import exp from "constants"
import PrismaClient from "./prismaClient/index"



const app = express()

app.use(cookieParser())

app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}))

app.get("/", (req, res) => {
    res.status(200).send("Hello, Server is running")
}
)


app.use(express.json())
app.use(express.urlencoded({ extended: true, limit: "10mb" }))
app.use(express.static("public"))

// Router import
import userRouter from "./routers/user.router"
import requestProccessorRouter from "./routers/requestProcessor.router"
import requestLogRouter from "./routers/requestLog.router"
import rateLimitingRouter from "./routers/ratelimiting.router"
import requestRouter from "./routers/request.router"


// Roueters
app.use("/api/v1/user", userRouter)
app.use("/api/v1/request", requestRouter)
app.use("/sendHere", requestProccessorRouter)
app.use("/api/v1/requestLog", requestLogRouter)
app.use("/api/v1/rateLimiting", rateLimitingRouter)

// const data1 = [...Array(100)].map(() => ({
//     requestId: "no-request-id",
//     requestUrl: "https://example.com/api/data",
//     forwardUrl: "https://backend.com/process",
//     response: { message: "Success", data: { id: Math.floor(Math.random() * 1000), value: "A" } },
//     statusCode: [200, 201, 400, 401, 402, 403, 404, 500][Math.floor(Math.random() * 7)],
//     type: ["GET", "POST", "PUT", "DELETE", "PATCH"][Math.floor(Math.random() * 5)],
//     comment: Math.random() > 0.5 ? "Processed successfully" : null,
//     duration: Math.floor(Math.random() * 300),
//     userId: `user-${Math.floor(Math.random() * 1000)}`,
//     createdAt: new Date(Date.now() - Math.floor(Math.random() * 1000000000)).toISOString(),
//     updatedAt: new Date(Date.now() - Math.floor(Math.random() * 500000000)).toISOString(),
// }));

// const requestIds = [
//     "cm806h6cp0002umforap3xz96",
//     "cm806h9280004umfotb6nun9a",
//     "cm80d4cni0001um2873k5xsia"
// ];

// const add = async (data: any) => {
//     for (let i = 0; i < Math.floor(Math.random() * 10); i++) {
//         try {
//             data.requestId = requestIds[Math.floor(Math.random() * requestIds.length)];
//             data = JSON.parse(JSON.stringify(data));
//             console.log(data);

//             const res = await PrismaClient.requestLog.create({ data });
//             console.log(res);
//         } catch (error) {
//             console.error(error);
//         }
//     }
// };

// (async () => {
//     for (let i = 0; i < data1.length; i++) {
//         await add(data1[i]);
//     }
// })();

export default app