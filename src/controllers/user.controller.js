import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt, { decode } from "jsonwebtoken";

const generateAccessTokenAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const refreshToken = user.generateRefreshToken();
    const accessToken = user.generateAccessToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { refreshToken, accessToken };
  } catch (error) {
    throw new ApiError(400, "Can't generate the refresh or access Token");
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, username, email, password } = req.body;

  if (
    [fullName, username, email, password].some(
      (f) => f?.trim() === "" || f?.trim() === undefined
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existingUser = await User.findOne({
    $or: [{ username: username }, { email: email }],
  });
  if (existingUser) {
    throw new ApiError(409, "User already existing");
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files.coverImage
    ? req.files.coverImage[0].path
    : undefined;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  const avatar_response = await uploadOnCloudinary(avatarLocalPath);
  const coverImage_response = await uploadOnCloudinary(coverImageLocalPath);

  // if the returned object of the below method is null then is it sufficient to prove that user is not created
  const user = await User.create({
    fullName,
    username: username.toLowerCase(),
    email,
    password,
    avatar: avatar_response.url,
    coverImage: coverImage_response ? coverImage_response.url : "",
  });

  const created_user = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!created_user) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, created_user, "User Created Successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  // todos:
  // take username and password or email and password
  // fetch the user using username from the database
  // compare the password of the database and the user
  // if same then authentication is success and generate the access token and refresh token
  // send the tokens to the user and also save it to the database

  const { username, email, password } = req.body;

  if (!username && !email) {
    throw ApiError(400, "Username or email or password required");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(
      404,
      "Invalid Credentials: please enter valid credentials"
    );
  }

  const isCorrect = await user.isPasswordCorrect(password);

  if (!isCorrect) {
    throw new ApiError(400, "incorrect Password");
  }

  // generate tokens for this user
  const { refreshToken, accessToken } =
    await generateAccessTokenAndRefreshToken(user._id);

  const options = {
    httpOnly: true,
    secure: true, // so that only server will be able to modify the cookies it will be visible to everyone
  };

  const loggedUser = await User.findById(user._id).select(
    "-password -refreshToken -__v -_id -createdAt -updatedAt"
  );

  res
    .status(201)
    .cookie("refreshToken", refreshToken, options)
    .cookie("accessToken", accessToken, options)
    .json(
      new ApiResponse(
        201,
        {
          refreshToken,
          accessToken,
          loggedUser,
        },
        "User logged In successfull"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: "",
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken ||
    req.body.refreshToken ||
    req.header("Authorization").replace("Bearer ", "");

  if (!incomingRefreshToken) {
    throw new ApiError(400, "No token found, invalid request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken._id);

    if (!user) {
      throw new ApiError(400, "Invalid Token or Expired Token");
    }

    if (incomingRefreshToken !== user.refreshToken) {
      throw new ApiError(400, "Invalid Token or Expired Token");
    }

    const { accessToken, refreshToken } =
      await generateAccessTokenAndRefreshToken(decodedToken._id);

    const options = {
      httpOnly: true,
      secure: true,
    };

    res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            accessToken,
            refreshToken,
          },
          "Access Token Refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(400, "Invalid Refresh Token or expired refresh Token");
  }
});

export { registerUser, loginUser, logoutUser, refreshAccessToken };
