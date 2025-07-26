import { NextFunction, Request, Response } from "express"
import httpStatus from "http-status-codes"
import { JwtPayload } from "jsonwebtoken"
import passport from "passport"
import { envVars } from "../../config/env"
import AppError from "../../errorHelpers/AppError"
import { catchAsync } from "../../utils/catchAsync"
import sendResponse from "../../utils/sendResponse"
import { setAuthCookie } from "../../utils/setCookie"
import { createUserTokens } from "../../utils/userTokens"
import { AuthServices } from "./auth.service"

const CredentialsLogin = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

        // const loginInfo = await AuthServices.loginUser(req.body)
console.log("CredentialsLogin")
        passport.authenticate("local", async (err: any, user: any, info: any) => {
            console.log("CredentialsLogin inside passport")
            if(err){
                // return next(err)
                return next(new AppError(401, err))
            }

            if(!user){
                // return new AppError(401, info.message)
                return next(new AppError(401, info.message))
            }

            const userTokens = await createUserTokens(user)

            const { password: pass, ...rest} = user.toObject()

            setAuthCookie(res, userTokens)

            sendResponse(res, {
                success: true,
                statusCode: httpStatus.OK,
                message: "User Logged In Successfully",
                data: {
                    accessToken: userTokens.accessToken,
                    refreshToken: userTokens.refreshToken,
                    user: rest
                }
            })
        })(req, res, next)

        // setAuthCookie(res, loginInfo);

        // sendResponse(res, {
        //     success: true,
        //     statusCode: httpStatus.OK,
        //     message: "User Login Successfully",
        //     data: loginInfo
        // })
        

})


// const loginUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

//         const loginInfo = await AuthServices.loginUser(req.body)

//         setAuthCookie(res, loginInfo);

//         sendResponse(res, {
//             success: true,
//             statusCode: httpStatus.OK,
//             message: "User Login Successfully",
//             data: loginInfo
//         })
        

// })

const getNewAccessToken = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        throw new AppError(httpStatus.BAD_REQUEST, "No refresh token received from cookies")
    }

    const tokenInfo = await AuthServices.getNewAccessToken(refreshToken as string)

    // res.cookie("accessToken", tokenInfo.accessToken, {
    //     httpOnly: true,
    //     secure: false
    // })

    // setAuthCookie(res, tokenInfo);

    setAuthCookie(res, tokenInfo)

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "New Access Token Retrived Successfully",
        data: tokenInfo,
    })
})

const logout = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    
    res.clearCookie("accessToken", {
        httpOnly: true,
        secure: false,
        sameSite: "lax"
    })

    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: false,
        sameSite: "lax"
    })

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User is logged out",
        data: null,
    })
})

const resetPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    
    const oldPassword = req.body.oldPassword;
    const newPassword = req.body.newPassword;
    const decodedUser = req.user;

    await AuthServices.resetPassword(oldPassword, newPassword, decodedUser as JwtPayload )

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Password reset successfully",
        data: null,
    })
})


const googleCallbackController = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    
    let redirectTo = req.query.state ? req.query.state as string : ""

    if(redirectTo.startsWith("/")){
        redirectTo = redirectTo.slice(1)
    }

    // /booking => booking , => "/" => ""
    const user = req.user

    console.log(user, "User");

    if(!user){
        throw new AppError(httpStatus.NOT_FOUND, "User not found")
    }

    const tokenInfo = createUserTokens(user)

    setAuthCookie(res, tokenInfo)

    // sendResponse(res, {
    //     success: true,
    //     statusCode: httpStatus.OK,
    //     message: "Password reset successfully",
    //     data: null,
    // })
    res.redirect(`${envVars.FRONTEND_URL}/${redirectTo}`)
})

export const AuthControllers = { CredentialsLogin, getNewAccessToken, logout, resetPassword, googleCallbackController }