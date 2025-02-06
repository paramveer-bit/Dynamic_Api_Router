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

// Roueters
app.use("/api/v1/user", userRouter)



export default app