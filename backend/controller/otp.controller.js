import OTP from "../model/otp.model";
import User from "../model/user.model";
import { ApiError } from "../util/ApiError";
import { ApiResponse } from "../util/ApiResponse";
import { asyncHandler } from "../util/AsyncHandler";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";

export const sendOtp = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  try {
    if ([username, email, password].some((field) => field.trim() === "")) {
        throw new ApiError(400, "All fields are required")
    }

    const existingUser = await User.findOne({
        $or: [
            { username: username },
            { email: email }
        ]
    });

    if (existingUser) {
        throw new ApiError(409, "Username with this email or username already exists")
    }

    const otp = crypto.randomInt(100000, 999999).toString();

    const hashedOTP = await bcrypt.hash(otp, 10);

    await OTP.findOneAndUpdate(
      { email },
      { otp: hashedOTP },
      { upsert: true, new: true }
    );

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOption = {
      from: {
        name: "Split Chat",
        address: process.env.EMAIL_USER,
      },
      to: email,
      subject: "OTP for Split Chat",
      text: `Your OTP is ${otp}\nThis OTP is valid for 5 minute`,
    };

    await transporter.sendMail(mailOption);

    return res
      .status(201)
      .json(new ApiResponse(201, createdUser, "OTP sent successfully"));
  } catch (error) {
    console.log("Error while sending OTP", error.message);
    return res.status(400).json(new ApiError(400, error.message));
  }
});

export const verifyOtp = asyncHandler(async (req, res) => {
  const { otp, email } = req.body;

  try {
    if ([otp, email].some((field) => field.trim() === "")) {
      throw new ApiError(400, "Please enter valid OTP");
    }

    const existingOtp = await OTP.findOne({
      email: email,
    });

    if (!existingOtp) {
      throw new ApiError(409, "OTP expired or invalid");
    }

    const isValidOtp = bcrypt.compare(otp, existingOtp);
    if (!isValidOtp) {
      throw new ApiError(409, "Invalid OTP");
    }

    if (isValidOtp) {
        await OTP.deleteOne({ email: email });
        return res.status(200).json(new ApiResponse(200, "OTP verified successfully"));
    }
  } catch (error) {
    console.log("Error while comparing OTP", error.message);
    return res.status(400).json(new ApiError(400, error.message));
  }
});
