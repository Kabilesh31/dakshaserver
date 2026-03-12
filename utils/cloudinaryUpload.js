const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

const uploadToCloudinary2 = (
  fileBuffer,
  folder = "files",
  resourceType = "raw",
  publicId = null,
) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        ...(publicId && { public_id: publicId }),
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      },
    );

    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

module.exports = uploadToCloudinary2;
