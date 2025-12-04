const cloudinary = require("../config/cloudinaryConfig");

exports.uploadToCloudinary = (buffer, folder = "users") => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder }, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      })
      .end(buffer);
  });
};
