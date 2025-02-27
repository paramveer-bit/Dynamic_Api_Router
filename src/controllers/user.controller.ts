import asyncHandler from "../helpers/asynchandeler";
import ApiError from "../helpers/ApiError";
import ApiResponse from "../helpers/ApiResponse";
import { Request, Response } from "express";
import PrismaClient from "../prismaClient/index"
import { z } from "zod"
import bcrypt from "bcrypt"
import Mailer from "../mailSender/sendMail";
import jwt from "jsonwebtoken"

const signUpSchema = z.object({
    email: z.string().email({ message: "Invalid email" }).min(5).max(255),
    password: z.string().min(8, { message: "Password should be of at least 8 size" }).max(20, { message: "Password should be of at max 20 size" }),
})


const signup = asyncHandler(async (req: Request, res: Response) => {
    console.log(req.body)
    const { email, password } = req.body;

    // validated email and password
    const validatedData = signUpSchema.safeParse({ email, password })
    if (!validatedData.success) {
        throw new ApiError(400, validatedData.error.errors[0].message)
    }

    // check if email already exists
    const user = await PrismaClient.user.findUnique({
        where: {
            email
        }
    })

    if (user) {
        throw new ApiError(400, "Email already exists")
    }

    // create otp
    const otp = Math.floor(100000 + Math.random() * 900000)

    // bcrypt password
    const hashedPassword = await bcrypt.hash(password, 10)

    // create user
    const newUser = await PrismaClient.user.create({
        data: {
            email,
            password: hashedPassword,
            otp: otp.toString(),
            otpExpiry: new Date(Date.now() + 600000),
            lastResend: new Date(),
        }
    })

    // check error in creating user
    if (!newUser) {
        throw new ApiError(500, "Error in creating user")
    }

    // send otp to email
    const mailResponse = await Mailer(email, email, otp.toString())

    // check error in sending mail
    if (!mailResponse.success) {
        throw new ApiError(500, "Error in sending mail")
    }

    // send response
    const response = new ApiResponse("200", JSON.stringify({ message: "User created successfully, now verify it" }))

    res.status(200).json(response)

})

const signIn = asyncHandler(async (req: Request, res: Response) => {

    const { email, password } = req.body;

    //parser email and password
    const validatedData = signUpSchema.safeParse({ email, password })
    if (!validatedData.success) {
        throw new ApiError(400, validatedData.error.errors[0].message)
    }

    //find user with specific email
    const user = await PrismaClient.user.findUnique({
        where: {
            email
        }
    })

    //check if user exists
    if (!user) {
        throw new ApiError(400, "User not found")
    }

    // check is user is verified
    if (!user.verified) {
        throw new ApiError(400, "User not verified")
    }

    // check password
    const isPasswordCorrect = await bcrypt.compare(password, user.password)
    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid password")
    }

    // create jsonwebtoken
    if (!process.env.JWT_SECRET) {
        throw new ApiError(500, "JWT secret is not defined")
    }
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1d" })

    //store in cookieParser
    res.cookie("token", token, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
        expires: new Date(Date.now() + 86400000), // Expire in 1 day
    })


    const response = new ApiResponse("200", JSON.stringify({ message: "User Signed in Successfully" }))

    res.status(200).json(response)

})

const verifyUser = asyncHandler(async (req: Request, res: Response) => {

    const { otp, email } = req.body;

    if (!email) {
        throw new ApiError(400, "Invalid email")
    }

    // check if otp is valid
    if (!otp) {
        throw new ApiError(400, "Invalid otp")
    }

    // find user with otp
    const user = await PrismaClient.user.findFirst({
        where: {
            email
        }
    })

    // check if user exists
    if (!user || !user.otpExpiry) {
        throw new ApiError(400, "User not found")
    }

    // check if user is already verified
    if (user.verified) {
        throw new ApiError(400, "User already verified")
    }

    // check if otp is expired
    if (user.otpExpiry < new Date()) {
        throw new ApiError(400, "Otp expired")
    }

    // update user
    const updatedUser = await PrismaClient.user.update({
        where: {
            id: user.id
        },
        data: {
            verified: true
        }
    })

    // check if user is updated
    if (!updatedUser) {
        throw new ApiError(500, "Error in updating user")
    }

    // send response
    const response = new ApiResponse("200", JSON.stringify({ message: "User verified successfully" }))

    res.status(200).json(response)

})

const resendOtp = asyncHandler(async (req: Request, res: Response) => {

    const { email } = req.body;

    // check if email is valid
    if (!email || !z.string().email().safeParse(email).success) {
        throw new ApiError(400, "Invalid email")
    }

    // find user with email
    const user = await PrismaClient.user.findFirst({
        where: {
            email
        }
    })

    // check if user exists
    if (!user) {
        throw new ApiError(400, "User not found")
    }

    // check if user is already verified
    if (user.verified) {
        throw new ApiError(400, "User already verified")
    }

    //check otp resend limit
    if (!user.lastResend) {
        user.lastResend = new Date()
    }

    if (user.resendCount >= 3 && new Date(user.lastResend).getDate() > new Date().getDate()) {
        throw new ApiError(400, "Resend limit reached for today")
    }

    var lastResend = new Date(user.lastResend)
    var resendCount = user.resendCount
    if (lastResend > new Date()) {
        lastResend = new Date(Date.now() + 24 * 60 * 60 * 1000)
        resendCount = 0
    }

    // create otp
    const otp = Math.floor(100000 + Math.random() * 900000)

    // update user with otp,resendCount and lastResend
    const updatedUser = await PrismaClient.user.update({
        where: {
            id: user.id
        },
        data: {
            otp: otp.toString(),
            otpExpiry: new Date(Date.now() + 600000),
            resendCount: resendCount + 1,
            lastResend: lastResend
        }
    })

    // check if user is updated
    if (!updatedUser) {
        throw new ApiError(500, "Error in updating user")
    }

    // send otp to email
    const mailResponse = await Mailer(email, email, otp.toString())

    // check error in sending mail
    if (!mailResponse.success) {
        throw new ApiError(500, "Error in sending mail")
    }

    // send response
    const response = new ApiResponse("200", "Otp sent successfully")

    res.status(200).json(response)

})

const signOut = asyncHandler(async (req: Request, res: Response) => {

    res.clearCookie("token")

    const response = new ApiResponse("200", "User signed out successfully")

    res.status(200).json(response)

})

const isSignedIn = asyncHandler(async (req: Request, res: Response) => {
    const user_id = req.user_id
    if (!user_id) {
        throw new ApiError(400, "Invalid user")
    }

    const user = await PrismaClient.user.findFirst({
        where: {
            id: user_id
        }
    })

    const response = new ApiResponse("200", user, JSON.stringify({ "message": "User is signed in" }))

    res.status(200).json(response)

})

const resetPasswordWhileLoggin = asyncHandler(async (req: Request, res: Response) => {
    const { oldPassword, newPassword } = req.body;
    const user_id = req.user_id
    // parser new password
    const validatedData = z.object({
        newPassword: z.string().min(8, { message: "Password should be of at least 8 size" }).max(20, { message: "Password should be of at max 20 size" }),
    }).safeParse({ newPassword })

    if (!validatedData.success) {
        throw new ApiError(400, validatedData.error.errors[0].message)
    }

    // find user with user_id

    const user = await PrismaClient.user.findFirst({
        where: {
            id: user_id
        }
    })

    // check if user exists
    if (!user) {
        throw new ApiError(400, "User not found")
    }

    // check if old password is correct
    const isPasswordCorrect = await bcrypt.compare(oldPassword, user.password)
    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid password")
    }

    // bcrypt new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // update user with new password
    const updatedUser = await PrismaClient.user.update({
        where: {
            id: user_id
        },
        data: {
            password: hashedPassword
        }
    })
    // check if user is updated
    if (!updatedUser) {
        throw new ApiError(500, "Error in updating user")
    }

    // send response
    const response = new ApiResponse("200", JSON.stringify({ message: "Password reset successfully. Login again" }))

    res.clearCookie("token")

    res.status(200).json(response)

})


export { signup, signIn, verifyUser, resendOtp, signOut, isSignedIn, resetPasswordWhileLoggin }