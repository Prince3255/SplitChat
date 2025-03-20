import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import fs from "fs";
import { ApiError } from "./ApiError.js";
import { ApiResponse } from "./ApiResponse.js";

const isCloudinaryConfigured = () => {
  return (
    process.env.CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
};

dotenv.config({
  path: "./.env",
});
if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
    debug: true,
  });
} else {
  console.error("Cloudinary configuration is missing required parameters.");
}

export const uploadFile = async (req, res) => {
  try {
    if (!isCloudinaryConfigured()) {
      throw new ApiError(500, "Cloudinary not configured properly");
    }
    console.log("req.file", req.files);
    if (!req.files || Object.keys(req.files).length === 0) {
      throw new ApiError(400, "No files uploaded");
    }

    // const imageFile = req.files.imageFile[0].path || "";
    // const audioFile = req.files.audioFile[0].path || "";
    // const videoFile = req.files.videoFile[0].path || "";
    // if (!imageFile && !audioFile && !videoFile) return null;
    // // const uploadPromises = [
    // //     cloudinary.uploader.upload(imageFile, {
    // //         resource_type: 'image',
    // //         public_id: 'image',
    // //         overwrite: true,
    // //         }),
    // //         cloudinary.uploader.upload(audioFile, {
    // //             resource_type: 'video',
    // //             public_id: 'audio',
    // //             overwrite: true,
    // //             }),
    // //             cloudinary.uploader.upload(videoFile, {
    // //                 resource_type: 'video',
    // //                 public_id: 'video',
    // //                 overwrite: true,
    // //                 })
    // //                 ];
    // //                 const uploads = await Promise.all(uploadPromises);
    // //                 const image = uploads[0];
    // //                 const audio = uploads[1];
    // //                 const video = uploads[2];
    // let response = null;
    // if (imageFile) {
    //   response = await cloudinary.uploader.upload(imageFile, {
    //     resource_type: "image",
    //     max_file_size: "5MB",
    //   });
    // }
    // if (audioFile) {
    //   response = await cloudinary.uploader.upload(audioFile, {
    //     resource_type: "video",
    //     max_file_size: "5MB",
    //   });
    // }
    // if (videoFile) {
    //   response = await cloudinary.uploader.upload(videoFile, {
    //     resource_type: "video",
    //     max_file_size: "10MB",
    //   });
    // }



    const uploadedUrls = {};

    if (req.files.imageFile && req.files.imageFile[0]?.path) {
      const imageResponse = await cloudinary.uploader.upload(req.files.imageFile[0].path, {
        resource_type: "image",
        max_file_size: "5MB",
      });
      uploadedUrls.imageUrl = imageResponse.secure_url;
      fs.unlinkSync(req.files.imageFile[0].path);
    }

    if (req.files.audioFile && req.files.audioFile[0]?.path) {
      const audioResponse = await cloudinary.uploader.upload(req.files.audioFile[0].path, {
        resource_type: "video",
        format: "mp3",
        max_file_size: "5MB",
      });
      uploadedUrls.audioUrl = audioResponse.secure_url;
      fs.unlinkSync(req.files.audioFile[0].path);
    }

    if (req.files.videoFile && req.files.videoFile[0]?.path) {
      const videoResponse = await cloudinary.uploader.upload(req.files.videoFile[0].path, {
        resource_type: "video",
        max_file_size: "10MB",
      });
      uploadedUrls.videoUrl = videoResponse.secure_url;
      fs.unlinkSync(req.files.videoFile[0].path);
    }



    res
      .status(200)
      .json(new ApiResponse(200, uploadedUrls, "File uploaded successfully"));


  
    // if (imageFile) fs.unlinkSync(imageFile);
    // if (audioFile) fs.unlinkSync(audioFile);
    // if (videoFile) fs.unlinkSync(videoFile);
  } catch (error) {
    if (req?.file) {
      fs.unlinkSync(req?.files?.path);
    }
    return res.status(500).json(new ApiError(500, error.message));
  }
};
