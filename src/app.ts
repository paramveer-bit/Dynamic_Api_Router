import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import exp from "constants"



const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.get("/", (req, res) => {
    res.status(200).send("Hello, Server is running")
}
)


app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static("public"))
app.use(cookieParser())

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


export default app