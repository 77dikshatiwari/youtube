import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/userModel.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    // console.log(accessToken, refreshToken)
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Failed to generate tokens or Something went wrong while generating refresh and access tokens"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  // code to register user
  //    1 info of user,
  //   2.validate info, 3.0 check if user already exists or not 3.1 check for files (img and avatar) 3. encrypt, 4. save in db and tokens 5. sucess or failure response

  const { fullName, username, email, password } = req.body;
  //  console.log(fullName, email, username, password);
  //  console.log(req.body);
  //  if(fullName === "" ){
  //     res.status().json({})
  //  }
  if (
    [fullName, email, password, username].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "Please provide all the fields data");
  }
  if (password.length < 6) {
    throw new ApiError(401, "Password should be atleast 6 characters long");
  }
  if (email.includes("@") === false) {
    throw new ApiError(402, "Please provide a valid email");
  }
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }
  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  // if coverImage is not provided then check this way
  // if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0 ){
  //     coverImageLocalPath = req.files.coverImage[0].path
  // }

  // console.log(req.files)
  if (!avatarLocalPath || !coverImageLocalPath) {
    throw new ApiError(409, "Please provide both avatar and cover image");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  // console.log(avatar.url);

  if (!avatar || !coverImage) {
    throw new ApiError(409, "Failed to upload avatar");
  }
  const user = await User.create({
    fullName,
    email,
    username: username.toLowerCase(),
    password,
    avatar: avatar.url,
    coverImage: coverImage.url,
    // coverImage: coverImage?.url || "" if not checked before
  });
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Failed to register user");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  // todo: login User 1. email and password, validation if user exits or not 3. authentication get data from db, response
  const { email, username, password } = req.body;
  //   console.log(req.body)
  if (!username && !email) {
    throw new ApiError(400, "Please provide username or email");
  }
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  // not db from mongoose User but user from model Schema defined above
  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid password or Invalid password credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = { httpOnly: true, secure: true };
  //   console.log(accessToken, refreshToken)

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          accessToken,
          user: loggedInUser,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  User.findByIdAndUpdate(
    req.user._id,
    {
      $set: { refreshToken: undefined },
    },
    {
      new: true,
    }
  );
  const options = { httpOnly: true, secure: true };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  try {
    const incomingRefereshToken =
      req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefereshToken) {
      throw new ApiError(400, "Please provide refresh token");
    }
    const decodedToken = jwt.verify(
      incomingRefereshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(404, "User not found");
    }
    if (incomingRefereshToken !== user?.refreshToken) {
      throw new ApiError(
        401,
        "Invalid refresh token or Refresh token is expired or used"
      );
    }
    const options = { httpOnly: true, secure: true };
    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshToken(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            accessToken,
            refreshToken: newRefreshToken,
          },
          "Access token refreshed successfully"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword, confPassword } = req.body;

  if (newPassword !== confPassword) {
    throw new ApiError(400, "Passwords do not match");
  }
  const user = await User.findById(req.user?._id);
  const isPasswordCorrect = await User.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid password");
  }
  if (currentPassword === newPassword) {
    throw new ApiError(
      400,
      "New password should be different from current password"
    );
  }
  user.password = newPassword;

  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});
const getCurrentUser = asyncHandler(async (req, res) => {
  return res.status(200).json(200, req.user, "User found successfully");
  // from middleware req.user
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;
  if (!fullName || !email) {
    throw new ApiError(400, "Please provide full name and email");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName: fullName,
        email: email,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User details updated successfully"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Please provide avatar or file is missing");
  }
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if (!avatar) {
    throw new ApiError(400, "Failed to upload avatar");
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar updated successfully"));
});

const updateCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;
  if (!coverImageLocalPath) {
    throw new ApiError(400, "Please provide cover image or file is missing");
  }
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if (!coverImage) {
    throw new ApiError(400, "Failed to upload cover image");
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Cover image updated successfully"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateCoverImage,
};
