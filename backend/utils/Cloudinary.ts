import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const isCloudinaryConfigured = !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_CLOUD_NAME.trim() !== "" &&
    process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name' &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_KEY.trim() !== "" &&
    process.env.CLOUDINARY_API_KEY !== 'your_api_key' &&
    process.env.CLOUDINARY_API_SECRET &&
    process.env.CLOUDINARY_API_SECRET.trim() !== "" &&
    process.env.CLOUDINARY_API_SECRET !== 'your_api_secret'
);

const saveLocally = (localFilePath: string) => {
    try {
        if (!localFilePath || !fs.existsSync(localFilePath)) {
            console.error("[UPLOAD] Local file does not exist:", localFilePath);
            return null;
        }

        const filename = path.basename(localFilePath);
        const targetDir = path.resolve('public/uploads');

        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }

        const targetPath = path.join(targetDir, filename);
        fs.renameSync(localFilePath, targetPath);

        console.log(`[UPLOAD] File stored locally: ${targetPath}`);
        return {
            url: `/api/uploads/${filename}`
        };
    } catch (error) {
        console.error("[UPLOAD] Failed to store file locally:", error);
        // Clean up the temp file if renaming failed but it still exists
        try {
            if (localFilePath && fs.existsSync(localFilePath)) {
                fs.unlinkSync(localFilePath);
            }
        } catch (unlinkError) {
            console.error("[UPLOAD] Failed to delete temp file:", unlinkError);
        }
        return null;
    }
};

const uploadOnCloudinary = async (localFilePath: string) => {
    try {
        if (!localFilePath) return null;

        if (!isCloudinaryConfigured) {
            console.log("[UPLOAD] Cloudinary is not configured. Falling back to local storage.");
            return saveLocally(localFilePath);
        }
        
        // upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        });
        
        // file has been uploaded successfully
        fs.unlinkSync(localFilePath); // remove the locally saved temporary file
        return response;

    } catch (error) {
        console.error("[UPLOAD] Cloudinary upload failed:", error);
        console.log("[UPLOAD] Falling back to local storage.");
        return saveLocally(localFilePath);
    }
};

export { uploadOnCloudinary };
