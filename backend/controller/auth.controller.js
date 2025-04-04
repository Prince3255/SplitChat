import User from "../model/user.model.js";
import { ApiError } from "../util/ApiError.js";
import { ApiResponse } from "../util/ApiResponse.js";
import { asyncHandler } from "../util/AsyncHandler.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const sendWelcomeMessage = async (email, username) => {
  try {
    if (email) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .logo-container {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              max-width: 150px;
            }
            .message {
              text-align: center;
              margin-bottom: 20px;
            }
            .footer {
              font-size: 12px;
              text-align: center;
              margin-top: 30px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="logo-container">
            <img src="https://res.cloudinary.com/dpqfajndi/image/upload/v1743762540/fnndrnwx9pszx3d3z3ba.png" alt="Split Chat Logo" class="logo">
          </div>
          <div class="message">
            <h2>Welcome to Split Chat, ${username}!</h2>
            <p>Thank you for joining our community. We're excited to have you on board!</p>
            <p>With Split Chat, you can connect with friends, split your expenses, and much more.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Split Chat. All rights reserved.</p>
            <p>If you didn't sign up for Split Chat, please ignore this email.</p>
          </div>
        </body>
        </html>
      `;

      const mailOption = {
        from: {
          name: "Split Chat",
          address: process.env.EMAIL_USER,
        },
        to: email,
        subject: "Welcome to Split Chat!",
        text: `Welcome to Split Chat, ${username}!`,
        html: htmlContent,
      };

      await transporter.sendMail(mailOption);
    }
  } catch (error) {
    console.log(error.message);
    // return res.status(500).json(new ApiError(500, "Something went wrong while sending welcome message"))
  }
};

export const signup = asyncHandler(async (req, res, next) => {
  const { username, email, password } = req.body;

  try {
    // if ([username, email, password].some((field) => field.trim() === "")) {
    //     throw new ApiError(400, "All fields are required")
    // }

    // const existingUser = await User.findOne({
    //     $or: [
    //         { username: username },
    //         { email: email }
    //     ]
    // });

    // if (existingUser) {
    //     throw new ApiError(409, "Username with this email or username already exists")
    // }

    const user = new User({
      username,
      email,
      password,
    });

    await user.save();

    const createdUser = await User.findById(user._id).select("-password");

    if (!createdUser) {
      throw new ApiError(500, "Something went wrong while registering user");
    }

    await sendWelcomeMessage(email, username);

    return res
      .status(201)
      .json(new ApiResponse(201, createdUser, "User registered successfully"));
  } catch (error) {
    console.log("Error in signup", error.message);
    return res.status(400).json(new ApiError(400, error.message));
  }
});

const generateAccess1Token = async (userId) => {
  try {
    const user = await User.findById(userId);
    const access_token = await user.generateAccessToken();

    await user.save({ validateBeforeSave: false });

    return access_token;
  } catch (error) {
    console.log(error.message);
    return res
      .status(500)
      .json(new ApiError(500, "Something went wrong while generating token"));
  }
};

export const login = asyncHandler(async (req, res, next) => {
  const { username, email, password } = req.body;

  try {
    if (!password || (!username && !email)) {
      throw new ApiError(
        400,
        "Either email or username and password are required"
      );
    }

    const user = await User.findOne({
      $or: [
        email ? { email: email } : null,
        username ? { username: username } : null,
      ].filter(Boolean),
    });

    if (!user) {
      throw new ApiError(401, "Invalid credentials");
    }

    const isPasswordCorrect = await user.isPasswordCorrect(password);

    if (!isPasswordCorrect) {
      throw new ApiError(401, "Invalid credentials");
    }

    const token = await generateAccess1Token(user._id);

    const loggedInUser = await User.findById(user._id).select("-password");

    const cookieOption = {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    };

    return res
      .status(201)
      .cookie("token", token, cookieOption)
      .json(new ApiResponse(200, loggedInUser, "User logged in successfully"));
  } catch (error) {
    console.log("Error in login", error.message);
    return res.status(401).json(new ApiError(401, error.message));
  }
});

export const logout = asyncHandler(async (req, res) => {
  const cookieOption = {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    maxAge: 0,
    path: "/",
  };

  return res
    .status(200)
    .clearCookie("token", cookieOption)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

export const google = asyncHandler(async (req, res, next) => {
  const { name, email, googlePhotoUrl } = req.body;

  if (!name || !email) {
    throw new ApiError(400, "All fields are required");
  }

  try {
    const user = await User.findOne({ email }).select("-password");

    if (user) {
      const token = await generateAccess1Token(user?._id);

      if (!user) {
        throw new ApiError(401, "Google auth fail");
      }

      const cookieOption = {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: "/",
      };

      return res
        .status(201)
        .cookie("token", token, cookieOption)
        .json(new ApiResponse(201, user, "Google auth successfull"));
    } else {
      const existingUser = await User.findOne({ email: email });

      if (existingUser) {
        throw new ApiError(
          409,
          "Username with this email or username already exists"
        );
      }

      const generatePassword =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8);

      const newUser = new User({
        username:
          name.toLowerCase().split(" ").join("") +
          Math.random().toString(9).slice(-4),
        email: email,
        password: generatePassword,
        profilePicture: googlePhotoUrl,
      });

      await newUser.save();

      const token = await generateAccess1Token(newUser?._id);

      const loggedInUser = await User.findById(newUser._id).select("-password");

      if (!loggedInUser) {
        throw new ApiError(500, "Something went wrong while registering user");
      }

      await sendWelcomeMessage(email, name);

      const cookieOption = {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: "/",
      };

      return res
        .status(201)
        .cookie("token", token, cookieOption)
        .json(new ApiResponse(201, loggedInUser, "Google auth successfull"));
    }
  } catch (error) {
    console.log("Error in google auth", error.message);
    return res.status(401).json(new ApiError(401, error.message));
  }
});
