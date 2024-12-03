import cloudinary from "../config/cloudinary";

// upload endpoint
export const uploadToCloudinary = async (file) => {

  if (!file) {
    return 'No file uploaded.'
  }

  const result = await cloudinary.v2.uploader.upload(file.path, {
    folder: 'your_folder_name',
    resource_type: "auto", // Handles any file type
  });
  return result
}