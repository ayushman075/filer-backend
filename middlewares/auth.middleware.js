import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken"
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";



export const verifyJWT = AsyncHandler(async (req,res,next)=>{
try {
       const token = req.cookies?.accessToken ||
        req.header("Authorization")?.replace("Bearer ","")
        
        if(!token){
            throw new ApiError(401,"Unauthorized request")
        }
    
    const decodedToken = await jwt.verify(token,process.env.ACCESS_TOKEN);
    const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
    if(!user){
        throw new ApiError(401,"Invalid access token !!")
    }
    req.user=user;
    next();
    
} catch (error) {
    throw new ApiError(401,error?.message || "Invalid access token !!")
}

});