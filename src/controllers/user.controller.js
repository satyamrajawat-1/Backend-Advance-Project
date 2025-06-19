import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/Apiresponse.js";
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

export {registerUser}