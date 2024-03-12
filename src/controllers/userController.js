import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/userModel.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
  // code to register user
//    1 info of user, 
//   2.validate info, 3.0 check if user already exists or not 3.1 check for files (img and avatar) 3. encrypt, 4. save in db and tokens 5. sucess or failure response

 const {fullName, username, email, password} = req.body
//  console.log(fullName, email, username, password);
//  console.log(req.body);
//  if(fullName === "" ){
//     res.status().json({})
//  }
if(
    [fullName, email, password, username].some((field)=> field?.trim() === "")
    ){
    throw new ApiError(400, "Please provide all the fields data")
}
if(password.length <6){
    throw new ApiError(401, "Password should be atleast 6 characters long")
}
if(email.includes("@") === false){
    throw new ApiError(402, "Please provide a valid email")
}
const existedUser = await User.findOne({
    $or: [{username} , {email}]
})
if(existedUser){
    throw new ApiError(409, "User with email or username already exists")
}
const avatarLocalPath = req.files?.avatar[0]?.path;
const coverImageLocalPath = req.files?.coverImage[0]?.path;

// if coverImage is not provided then check this way
// if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0 ){
//     coverImageLocalPath = req.files.coverImage[0].path
// }


// console.log(req.files)
if(!avatarLocalPath || !coverImageLocalPath){
    throw new ApiError(409, "Please provide both avatar and cover image")
}   

const avatar = await uploadOnCloudinary(avatarLocalPath)
const coverImage = await uploadOnCloudinary(coverImageLocalPath)
// console.log(avatar.url);

if(!avatar || !coverImage){
    throw new ApiError(409, "Failed to upload avatar")
}
 const user = await User.create({
    fullName, email, username: username.toLowerCase(), password, avatar: avatar.url, 
    coverImage: coverImage.url
    // coverImage: coverImage?.url || "" if not checked before
})
const createdUser = await User.findById(user._id).select(
    "-password -refreshToken")
    
if(!createdUser){
        throw new ApiError(500, "Failed to register user")
    }

  return res.status(201).json(
    new ApiResponse(201, createdUser, "User registered successfully"))  
});

export { registerUser };
