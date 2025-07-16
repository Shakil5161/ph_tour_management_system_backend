import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { UserServices } from "./user.service";



const createUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

        const user = await UserServices.createUser(req.body)
        sendResponse(res, {
            success: true,
            statusCode: httpStatus.CREATED,
            message: "User Created Successfully",
            data: user
        })
        // res.status(httpStatus.CREATED).json({
        //     message: "User Created Successfully",
        //     user
        // })

})


const updateUser = catchAsync( async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id;

    // const token = req.headers.authorization;
    // const verifiedToken = verifyToken(token as string, envVars.JWT_ACCESS_SECRET) as JwtPayload

    const verifiedToken = req.user
    const payload = req.body
    const user = await UserServices.updateUser(userId, payload, verifiedToken)

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "User Updated Successfully",
        data: user
    })
})

const getAllUsers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const users = await UserServices.getAllUsers()
    sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "All User Retrieved Successfully",
            data: users.data,
            meta: users.meta,
        })
})

// const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const users = await UserServices.getAllUsers()

//         return users;

//     } catch (error: any) {
//         console.log(error)
//         next(error);
//     }
// }

export const UserControllers = { createUser, getAllUsers, updateUser }

// route matching -> controller -> service -> model -> DB