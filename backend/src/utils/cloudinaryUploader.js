const cloudinary = require('../config/cloudinary');
const fs = require('fs');

/**
 * Upload a local file to Cloudinary.
 * If Cloudinary is configured and succeeds, returns the secure HTTPS URL.
 * If it fails or is unconfigured, returns null so the app can fallback to local path.
 */
async function uploadToCloudinary(filePath, folder = 'bhrosacab') {
  if (!filePath || !fs.existsSync(filePath)) {
    return null;
  }
  
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return null;
  }

  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: 'auto',
    });
    return result.secure_url;
  } catch (error) {
    console.warn('Cloudinary upload warning:', error.message);
    return null;
  }
}

module.exports = { uploadToCloudinary };
