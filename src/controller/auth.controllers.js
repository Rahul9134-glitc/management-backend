import User from "../model/auth.models.js";
import { generateToken } from "../config/generate-token.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const cookieOptions = {
  httpOnly: true,
  secure: true,          
  sameSite: "None",     
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, phone, password } = req.body;

  if (!name || !email || !phone || !password) {
    throw new ApiError(400, "All fields are required!");
  }

  const existUser = await User.findOne({ $or: [{ email }, { phone }] });
  if (existUser) {
    throw new ApiError(409, "User already exists!");
  }

  const user = await User.create({ name, email, phone, password });
  const createdUser = await User.findById(user._id).select("-password");

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong during registration!");
  }

  const token = generateToken(createdUser._id);

  return res
    .status(201)
    .cookie("accessToken", token, cookieOptions)
    .json(
      new ApiResponse(
        201,
        { user: createdUser, token },
        "User created successfully!",
      ),
    );
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required!");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "User not found, please register!");
  }

  const isPasswordValid = await user.matchPassword(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password!");
  }

  const loggedInUser = await User.findById(user._id).select("-password");
  const token = generateToken(user._id);

  return res
    .status(200)
    .cookie("accessToken", token, cookieOptions)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, token },
        "User logged in successfully!",
      ),
    );
});

export const logoutUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .clearCookie("accessToken", {
       httpOnly: true,
       secure: true,
       sameSite: "None"
})
    .json(new ApiResponse(200, {}, "User logged out successfully!"));
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate("currentGroup");

  if (!user) {
    throw new ApiError(404, "User nahi mila!");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      user,
      "Current user fetched successfully!"
    )
  );
});
