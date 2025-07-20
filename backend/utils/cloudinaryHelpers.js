const cloudinary = require('../config/cloudinary');

/**
 * Delete image from Cloudinary
 * @param {string} publicId - The public ID of the image to delete
 * @returns {Promise<boolean>} - Success status
 */
const deleteImageFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === 'ok';
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    return false;
  }
};

/**
 * Upload image to Cloudinary
 * @param {string} imagePath - Local path or base64 string of the image
 * @param {string} folder - Cloudinary folder to upload to
 * @param {object} options - Additional Cloudinary options
 * @returns {Promise<object>} - Upload result
 */
const uploadImageToCloudinary = async (imagePath, folder = 'spicelore', options = {}) => {
  try {
    const result = await cloudinary.uploader.upload(imagePath, {
      folder,
      ...options
    });
    return {
      success: true,
      url: result.secure_url,
      public_id: result.public_id
    };
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get optimized image URL from Cloudinary
 * @param {string} publicId - The public ID of the image
 * @param {object} transformations - Cloudinary transformation options
 * @returns {string} - Optimized image URL
 */
const getOptimizedImageUrl = (publicId, transformations = {}) => {
  return cloudinary.url(publicId, {
    fetch_format: 'auto',
    quality: 'auto',
    ...transformations
  });
};

/**
 * Generate thumbnail URL
 * @param {string} publicId - The public ID of the image
 * @param {number} width - Thumbnail width
 * @param {number} height - Thumbnail height
 * @returns {string} - Thumbnail URL
 */
const getThumbnailUrl = (publicId, width = 150, height = 150) => {
  return cloudinary.url(publicId, {
    width,
    height,
    crop: 'fill',
    fetch_format: 'auto',
    quality: 'auto'
  });
};

module.exports = {
  deleteImageFromCloudinary,
  uploadImageToCloudinary,
  getOptimizedImageUrl,
  getThumbnailUrl
};
