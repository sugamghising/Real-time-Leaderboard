import cloudinary from "../config/cloudinary";

export async function uploadToCloudinary(buffer: Buffer): Promise<string> {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            {
                folder: "games",
                resource_type: "image"
            },
            (error, result) => {
                if (error) return reject(error);
                resolve(result!.secure_url);
            }
        ).end(buffer);
    });
}
