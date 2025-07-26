import bcrypt from "bcryptjs";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import { envVars } from "../../config/env";
import AppError from "../../errorHelpers/AppError";
import { createNewAccessTokenWithRefreshToken } from "../../utils/userTokens";
import { User } from "../user/user.model";

// const loginUser = async (payload: Partial<IUser>) => {
//     const { email, password } = payload;

//     const isUserExist = await User.findOne({ email })

    
//     if(!isUserExist){
//         throw new AppError(httpStatus.BAD_GATEWAY, "Email does not exist")
//     }
    
//     const hashedPassword = await bcrypt.compare(password as string, isUserExist.password as string )
    
//     if(!hashedPassword){
//         throw new AppError(httpStatus.BAD_GATEWAY, "Incorrect password")
//     }
    
//     const userTokens = createUserTokens(isUserExist);


//     const {password: pass, ...rest} = isUserExist.toObject() 

//     return {
//         accessToken: userTokens.accessToken,
//         refreshToken: userTokens.refreshToken,
//         user: rest
        
//     } 
// }


const getNewAccessToken = async (refreshToken: string) => {
    const newAccessToken = await createNewAccessTokenWithRefreshToken(refreshToken)

    return {
        accessToken: newAccessToken
    }
}

const resetPassword = async ( oldPassword: string, newPassword: string, decodedToken: JwtPayload) => {
    const user = await User.findById(decodedToken.userId);

    const isOldPasswordMatch = await bcrypt.compare(oldPassword, user!.password as string)

    if(!isOldPasswordMatch){
        throw new AppError(httpStatus.UNAUTHORIZED, "Old Password doesn't match");
    }

    user!.password = await bcrypt.hash(newPassword, Number(envVars.BCRYPT_SALT_ROUND))

    user!.save()
}

export const AuthServices = {
    // loginUser,
    getNewAccessToken,
    resetPassword
}