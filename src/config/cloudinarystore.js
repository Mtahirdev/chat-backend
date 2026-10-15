import { Readable } from "stream";
import cloudinary from "../utils/cloudinary.js";

const uploadToCloudinary = (file, resourceType, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: resourceType,
        folder,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      },
    );

    Readable.from(file.buffer).pipe(stream);
  });
};

export default uploadToCloudinary;
