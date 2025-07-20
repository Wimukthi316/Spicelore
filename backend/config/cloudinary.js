const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dzncoloro',
  api_key: process.env.CLOUDINARY_API_KEY || '889225549224889',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'dL7zTjMY39KNWdM3g8YfqYE0h0A',
});

module.exports = cloudinary;
