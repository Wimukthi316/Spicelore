// Cloudinary upload utilities for frontend

/**
 * Upload user avatar
 * @param {File} file - The image file to upload
 * @returns {Promise<Object>} - Upload result
 */
export const uploadAvatar = async (file) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const formData = new FormData();
    formData.append('avatar', file);

    const response = await fetch('http://localhost:5000/api/profile/avatar', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Upload failed');
    }

    return {
      success: true,
      data: data.data,
      message: data.message
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Upload product images (Admin/Manager only)
 * @param {FileList} files - The image files to upload
 * @returns {Promise<Object>} - Upload result
 */
export const uploadProductImages = async (files) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('images', file);
    });

    const response = await fetch('http://localhost:5000/api/upload/products', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Upload failed');
    }

    return {
      success: true,
      data: data.data,
      message: data.message
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Upload single product image (Admin/Manager only)
 * @param {File} file - The image file to upload
 * @returns {Promise<Object>} - Upload result
 */
export const uploadProductImage = async (file) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch('http://localhost:5000/api/upload/product', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Upload failed');
    }

    return {
      success: true,
      data: data.data,
      message: data.message
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Delete image from Cloudinary (Admin/Manager only)
 * @param {string} publicId - The public ID of the image to delete
 * @returns {Promise<Object>} - Delete result
 */
export const deleteImage = async (publicId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`http://localhost:5000/api/upload/${encodeURIComponent(publicId)}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Delete failed');
    }

    return {
      success: true,
      message: data.message
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Validate image file
 * @param {File} file - The file to validate
 * @param {number} maxSize - Maximum file size in bytes (default: 5MB)
 * @returns {Object} - Validation result
 */
export const validateImageFile = (file, maxSize = 5 * 1024 * 1024) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Only JPEG, JPG, PNG, and GIF files are allowed'
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size must be less than ${(maxSize / 1024 / 1024).toFixed(1)}MB`
    };
  }

  return {
    valid: true
  };
};

/**
 * Generate Cloudinary transformation URL
 * @param {string} url - Original Cloudinary URL
 * @param {Object} transformations - Transformation parameters
 * @returns {string} - Transformed URL
 */
export const getTransformedImageUrl = (url, transformations = {}) => {
  if (!url || !url.includes('cloudinary.com')) {
    return url;
  }

  const transformParams = [];
  
  if (transformations.width) transformParams.push(`w_${transformations.width}`);
  if (transformations.height) transformParams.push(`h_${transformations.height}`);
  if (transformations.crop) transformParams.push(`c_${transformations.crop}`);
  if (transformations.quality) transformParams.push(`q_${transformations.quality}`);
  if (transformations.format) transformParams.push(`f_${transformations.format}`);

  if (transformParams.length === 0) {
    return url;
  }

  // Insert transformations into the URL
  const transformString = transformParams.join(',');
  return url.replace('/upload/', `/upload/${transformString}/`);
};

/**
 * Get thumbnail URL from Cloudinary image
 * @param {string} url - Original Cloudinary URL
 * @param {number} size - Thumbnail size (default: 150px)
 * @returns {string} - Thumbnail URL
 */
export const getThumbnailUrl = (url, size = 150) => {
  return getTransformedImageUrl(url, {
    width: size,
    height: size,
    crop: 'fill',
    quality: 'auto',
    format: 'auto'
  });
};
