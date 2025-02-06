import { ApiError } from "../utils/ApiError.js"
import { AsyncHandler } from "../utils/AsyncHandler.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { User } from "../models/user.model.js"


const generateAccessAndRefreshToken = async  (userId) => {
    try {
     const user =  await User.findById(userId)
    const accessToken = await user.generateAccessToken()
    const refreshToken = await user.generateRefreshToken()
  
    user.refreshToken=refreshToken
    await user.save({validateBeforeSave:false})
  
    return {accessToken,refreshToken}
    } catch (error) {
      throw new ApiError(500,"Something went wrong while generating access and refresh token !!")
    }
  }

  const registerUser = AsyncHandler(
    async (req,res)=>{
        
       const {userData} =req.body


      if(!userData){
       res.status(400).json(new ApiResponse(400,{},"Some fields are empty!!",false))
        throw new ApiError(400,"Some fields are empty!!")
      }

      
    

     const existedUser = await User.findOne({email:userData.email})
      if(existedUser){
       res.status(409).json(new ApiResponse(409,{},"User with email already exists !!",false))
        throw new ApiError(409, "User with email already exists !!")
      }


    const user = await User.create(
      userData
    )

    const checkUser = await User.findById(user._id).select("-password -refreshToken");

    if(!checkUser){
       res.status(500).json(new ApiResponse(500,{},"Something went wrong while registring user !!",false))
        throw new ApiError(500, "Something went wrong while registring user !!")
    }

    return res.status(201).json(new ApiResponse(200,checkUser,"User created sucessfully",true))

    }
)



const loginUser = AsyncHandler(async (req,res)=>{
   
    
    const {email,password}=req.body;
    if(email=="" || email==undefined || !email){
        res.status(400,{},"Email is required",false)
          throw new ApiError(400,"Email is required !!")
    }
    else if(password=="" || password==undefined || !password){
        res.status(400).json(new ApiResponse(400,{},"Password is required !!",false))
       
          throw new ApiError(400,"Password is required !!")
    }
    
    const user = await User.findOne({"email":email.trim()})
    
    if(!user){
        res.status(404).json(new ApiResponse(404,{},"User doesn't exist !!",false))
      throw new ApiError(404,"User doesn't exist !!")
    }
    const isPasswordValid = await user.isPasswordCorrect(password.trim())
    
    if(!isPasswordValid){
        res.status(400).json(new ApiResponse(400,{},"Invalid user credentials !!",false))
      throw new ApiResponse(401,"Invalid user credentials !!")
    }
    const {accessToken,refreshToken}= await generateAccessAndRefreshToken(user._id)
    
    const loggedInUser = await User.findById(user._id).
                          select("-password -refreshToken")
    
                          const options = {
                            httpOnly: true,
                            secure: process.env.NODE_ENV === "production", // Only secure in production
                            sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax"
                          };
    
                          return res
                          .status(200)
                          .cookie("accessToken",accessToken,options)
                          .cookie("refreshToken",refreshToken,options)
                          .json(
                            new ApiResponse(
                              200,
                              {
                                user:loggedInUser,accessToken,refreshToken
                              },
                              "User logged in sucessfully !!",
                              true
                            )
                          )
    
    })



    const logoutUser=AsyncHandler(async(req,res)=>{
      const loggedOutUser= await User.findByIdAndUpdate(
          req.user._id,
          {
            $set:{
              refreshToken:undefined
            },
            
          },
          {
            new : true
          }
        ) 
      
        const options = {
          httpOnly: true,
          secure: true, // Only secure in production
          sameSite:"None"
        };
      
      
        return res
        .status(200)
        .clearCookie("accessToken",options)
        .clearCookie("refreshToken",options)
        .json(new ApiResponse(200,{},"User logged out successfully !!"))
      })


      const getCurrentUser = AsyncHandler(async(req,res)=>{
        console.log(req.user)
        return res.status(200)
        .json(new ApiResponse(200,req.user,"Current user fetched successfully !!"))
      })


export {registerUser,loginUser,logoutUser,getCurrentUser}