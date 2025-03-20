import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connect_DB from "./db/index.js";
import authRoute from "./route/auth.route.js";
import userRoute from "./route/user.route.js";
import expenseRoute from "./route/expense.route.js";
import groupRoute from "./route/group.route.js";
import settleupRoute from "./route/settleup.route.js";
import commentRoute from "./route/comment.route.js";
import chatRoute from "./route/chat.route.js";
import searchRoute from "./route/search.route.js";
import { uploadFile } from "./util/cloudinary.js";
import { upload } from "./middleware/multer.middleware.js";
import dotenv from "dotenv";
import { ApiError } from "./util/ApiError.js";
import { app, server } from "./util/socket.js";

dotenv.config();

connect_DB();

app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  next();
});

app.use(express.json());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    // origin: 'http://localhost:5173',
    credentials: true,
  })
);
app.use(cookieParser());

const PORT = 3000;

app.use("/api/v1/auth", authRoute);
app.use("/api/v1/user", userRoute);
app.use("/api/v1/expense", expenseRoute);
app.use("/api/v1/group", groupRoute);
app.use("/api/v1/settleup", settleupRoute);
app.use("/api/v1/comment", commentRoute);
app.use("/api/v1/chat", chatRoute);
app.use("/api/v1/search", searchRoute);
app.post("/api/v1/upload", upload.fields([
  { name: "imageFile", maxCount: 1 },
  { name: "audioFile", maxCount: 1 },
  { name: "videoFile", maxCount: 1 },
]), uploadFile);

// Error-handling middleware
app.use((err, req, res, next) => {
  if (err instanceof ApiError) {
    // Send ApiError response
    return res.status(err.statusCode).json(err.toJSON());
  }

  // Handle unexpected errors
  console.error("Unhandled Error:", err);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: err.message,
  });
});
