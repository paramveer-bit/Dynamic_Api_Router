import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import exp from "constants"



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


export default app