# Cloudinary Integration for Spicelore

This document describes the Cloudinary integration setup for the Spicelore spice e-commerce platform.

## 🔧 Setup

### 1. Environment Variables

Add the following variables to your `.env` file:

```env
# Cloudinary Configuration (Get these from https://cloudinary.com/console)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
CLOUDINARY_URL=cloudinary://your_api_key:your_api_secret@your_cloud_name
```

### 2. Dependencies

The following packages have been installed:

```bash
npm install cloudinary multer-storage-cloudinary
```

## 📁 File Structure

```
backend/
├── config/
│   └── cloudinary.js              # Cloudinary configuration
├── middleware/
│   └── cloudinaryUpload.js        # Multer + Cloudinary storage configuration
├── controllers/
│   ├── profileController.js       # Updated for Cloudinary avatar uploads
│   └── uploadController.js        # General image upload controller
├── routes/
│   └── uploadRoutes.js            # Upload API routes
├── utils/
│   └── cloudinaryHelpers.js       # Utility functions for Cloudinary
└── test/
    └── testCloudinary.js          # Connection test script
```

## 🚀 Features

### Avatar Upload
- **Endpoint**: `PUT /api/profile/avatar`
- **Folder**: `spicelore/avatars`
- **Transformations**: 300x300 crop-fill, auto quality, auto format
- **File Size Limit**: 5MB
- **Supported Formats**: JPEG, JPG, PNG, GIF

### Product Image Upload
- **Single Image**: `POST /api/upload/product`
- **Multiple Images**: `POST /api/upload/products` (max 5 images)
- **Folder**: `spicelore/products`
- **Transformations**: 800x600 fit, auto quality, auto format
- **File Size Limit**: 10MB per image
- **Access**: Admin/Manager only

### Image Deletion
- **Endpoint**: `DELETE /api/upload/:public_id`
- **Access**: Admin/Manager only

## 🎯 Usage Examples

### Frontend Avatar Upload

```javascript
const handleAvatarUpload = async (file) => {
  const formData = new FormData();
  formData.append('avatar', file);

  const response = await fetch('/api/profile/avatar', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  const data = await response.json();
  // data.data.avatar contains the Cloudinary URL
};
```

### Product Image Upload

```javascript
const uploadProductImages = async (files) => {
  const formData = new FormData();
  files.forEach(file => {
    formData.append('images', file);
  });

  const response = await fetch('/api/upload/products', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  const data = await response.json();
  // data.data contains array of uploaded image objects
};
```

## 🔗 Image URLs

Cloudinary automatically provides optimized URLs for your images:

- **Original**: `https://res.cloudinary.com/dzncoloro/image/upload/v1234567890/spicelore/avatars/abc123.jpg`
- **Optimized**: Automatic format and quality optimization
- **Responsive**: Use Cloudinary's transformation parameters for different sizes

## 🛠 Utility Functions

### Generate Thumbnail
```javascript
const { getThumbnailUrl } = require('./utils/cloudinaryHelpers');
const thumbnailUrl = getThumbnailUrl(publicId, 150, 150);
```

### Get Optimized URL
```javascript
const { getOptimizedImageUrl } = require('./utils/cloudinaryHelpers');
const optimizedUrl = getOptimizedImageUrl(publicId, {
  width: 500,
  height: 300,
  crop: 'fill'
});
```

### Delete Image
```javascript
const { deleteImageFromCloudinary } = require('./utils/cloudinaryHelpers');
const success = await deleteImageFromCloudinary(publicId);
```

## 🔒 Security Features

1. **File Type Validation**: Only image files (JPEG, JPG, PNG, GIF) are allowed
2. **File Size Limits**: 5MB for avatars, 10MB for products
3. **Authentication Required**: All upload endpoints require valid JWT token
4. **Role-Based Access**: Product uploads restricted to admin/manager roles
5. **Automatic Cleanup**: Old avatars are deleted when new ones are uploaded

## 📊 Monitoring

Test your Cloudinary connection:

```bash
cd backend
node test/testCloudinary.js
```

This will show:
- Connection status
- Account usage statistics
- Storage and transformation usage

## 🎨 Image Transformations

Cloudinary automatically applies optimizations:

### Avatars
- Resize to 300x300 pixels
- Crop to fill (maintains aspect ratio)
- Auto format (WebP, AVIF when supported)
- Auto quality optimization

### Products
- Resize to fit within 800x600 pixels
- Maintains original aspect ratio
- Auto format and quality optimization

## 🌟 Benefits

1. **Performance**: Automatic image optimization and CDN delivery
2. **Storage**: No local file storage needed
3. **Scalability**: Handles any number of images
4. **Transformations**: On-the-fly image resizing and optimization
5. **Global CDN**: Fast image delivery worldwide
6. **Backup**: Images stored securely in the cloud

## 🔧 Troubleshooting

### Common Issues

1. **Invalid API Credentials**
   - Check your `.env` file
   - Verify credentials in Cloudinary dashboard

2. **Upload Failures**
   - Check file size limits
   - Verify file type restrictions
   - Ensure proper authentication

3. **Image Not Displaying**
   - Verify the Cloudinary URL format
   - Check if image was uploaded successfully
   - Ensure proper public_id format

### Environment Variables Check

Make sure all required environment variables are set:
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

## 📝 Migration Notes

If you have existing local images, you'll need to:

1. Upload them to Cloudinary
2. Update database records with new URLs
3. Update frontend to use Cloudinary URLs instead of local paths

The system now automatically handles new uploads with Cloudinary integration.
