import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/Apiresponse.js";
import jwt from "jsonwebtoken";


const generateAccessAndRefreshToken = async(userId)=>
{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        user.refreshToken = refreshToken
       await user.save({ validateBeforeSave : false })
       return {accessToken , refreshToken}
    } catch (error) {
        throw new ApiError(500,"SOMETHING WENT WRONG WHILE GENERATING TOKEN")
    }
}


const registerUser = asyncHandler(async (req,res) => {
   // get user details from frontend
   const {fullName, email, username, password}=req.body
//    console.log(req.body)
//    console.log("email:",email)

// validation

//    if(fullName === ""){
//     throw new ApiError(400,"FULL NAME IS REQUIRED!!")
//    }

//     or 


if(
    [fullName, email, username, password].some((field)=> field?.trim()==="")
){
    throw new ApiError(400,"ALL FIELDS ARE REQUIRED!!! ")
}
   
   // check if user is already exists

const ExistedUser = await User.findOne({
    $or:[{username} , {email}]
})
if(ExistedUser) {
    throw new ApiError(409,"USER WITH USERNAME OR EMAIL ALREADY EXIST!!")
}
   // check for images, check for avatar


const avatarLocalPath = req.files?.avatar[0]?.path
console.log( req.files)
const coverImageLocalPath = req.files?.coverImage[0]?.path
if(!avatarLocalPath){
    throw new ApiError(400,"Avatar file is required")
}

   // upload them on cloudinary


 const avatar = await uploadOnCloudinary(avatarLocalPath)
 const coverImage = await uploadOnCloudinary(coverImageLocalPath)

if(!avatar){
    throw new ApiError(400,"Avatar file is required")
}

   // creat user object - create entry in db


  const user = await User.create(
    {
        fullName,
        avatar : avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
       username: username.toLowerCase()
    }
   )

 // remove passoward and refresh token field from response



 const userCreated =  await User.findById(user._id).select(
    "-password -refreshToken"
 )


// check for user creation 

 if(!userCreated){
    throw new ApiError(500 , "SOMETHING WENT WRONG WHILE REGISTERING USER")
 }
  
   
   // return res


return res.status(201).json(
    new ApiResponse(200, userCreated ,"USER REGISTERED SUCCESSFULLY")
)



})


const loginUser = asyncHandler(async(req,res)=>{

    // req body -> data

   // username or email


    const {email, username, password} = req.body
    
    if (!(username || !email)){
        throw new  ApiError(400,"USER NAME OR EMAIL REQUIRED")
    }

    
    // find user


   const user = await User.findOne({
        $or:[{username},{email}]
    })
    

    if(!user){
        throw new ApiError(404,"USER DOES NOT EXIST")
    }


    // passwod check


   const validPassword = await user.isPasswordCorrect(password)
   

   if(!validPassword){
    throw new ApiError(404,"PASSWORD IS INCORRECT")
   }


    
    // access and refresh token


  const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)



    // send cookies


    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")


    const options = {
        httpOnly : true,
        secure : true
    }

    return res.status(200).cookie("accessToken",accessToken,options).cookie("refreshToken",refreshToken,options).json(
        new ApiResponse(200,{
            user :loggedInUser,accessToken,refreshToken
        },
        "USER LOGGED IN SUCCESSFULLY"
    )
)

})



const logOutUser = asyncHandler(async(req,res)=>{
   await User.findByIdAndUpdate(
        req.user._id,
        {
            $set : {
                refreshToken : undefined
            },
        },
        {
                new : true
            }
    )
    const options = {
        httpOnly : true,
        secure : true
    }
    return res.status(200).clearCookie("accessToken",options).clearCookie("refreshToken",options).json(new ApiResponse(200,{},"USER LOGGED OUT"))
})



try {
    const refreshAccessToken = asyncHandler(async(req,res)=>{
        const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    
        if(!incomingRefreshToken){
            throw new ApiError(401 , "unauthorized request")
        }
    
        const decodedRefreshToken = jwt.verify(incomingRefreshToken.process.env.REFRESH_TOKEN_SECRET)
    
       const user = await User.findById(decodedRefreshToken?._id)
    
       if(!user){
        throw new ApiError(401,"INVALID REFRESH TOKEN")
       }
    
       if(incomingRefreshToken !== user?.refreshToken){
        throw new ApiError(401,"REFRESH TOKEN IS EXPIRED OR USED")
       }
    
       const options = {
        httpOnly : true,
        secure : true
       }
     const {accessToken, newrefreshToken} =  await generateAccessAndRefreshToken(user._id)
       return res.status(200).clearCookie("accessToken",accessToken,options).clearCookie("refreshToken",newrefreshToken,options).json(new ApiResponse(200,
        {accessToken, refreshToken:newrefreshToken}
        ,"ACCESS TOKEN REFRESHED"))
    })
} catch (error) {
    throw new ApiError(401,error?.message||"INVALID REFRESH TOKEN")
    
}



export {
    registerUser,
    loginUser,
    logOutUser,
    refreshAccessToken
}