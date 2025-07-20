import React, { useState } from 'react';
import { uploadAvatar, validateImageFile } from '../utils/cloudinaryUtils';

const CloudinaryTest = () => {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [uploadedImage, setUploadedImage] = useState(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setMessage({ type: 'error', text: validation.error });
      return;
    }

    setUploading(true);
    setMessage({ type: '', text: '' });

    try {
      const result = await uploadAvatar(file);
      
      if (result.success) {
        setMessage({ type: 'success', text: result.message || 'Image uploaded successfully!' });
        setUploadedImage(result.data.avatar);
      } else {
        setMessage({ type: 'error', text: result.error || 'Upload failed' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Upload failed: ' + error.message });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Cloudinary Upload Test
      </h2>
      
      {/* Upload Section */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Upload Avatar Image
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          disabled={uploading}
          className="block w-full text-sm text-gray-500
                     file:mr-4 file:py-2 file:px-4
                     file:rounded-lg file:border-0
                     file:text-sm file:font-medium
                     file:bg-amber-50 file:text-amber-700
                     hover:file:bg-amber-100
                     disabled:opacity-50"
        />
      </div>

      {/* Loading State */}
      {uploading && (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-amber-300 border-t-amber-600"></div>
          <span className="ml-2 text-amber-600">Uploading to Cloudinary...</span>
        </div>
      )}

      {/* Message Display */}
      {message.text && (
        <div className={`p-4 rounded-lg mb-4 ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          <div className="flex">
            {message.type === 'success' ? (
              <svg className="w-5 h-5 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <span>{message.text}</span>
          </div>
        </div>
      )}

      {/* Uploaded Image Preview */}
      {uploadedImage && (
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-800 mb-3">Uploaded Image</h3>
          <div className="relative inline-block">
            <img
              src={uploadedImage}
              alt="Uploaded to Cloudinary"
              className="w-32 h-32 rounded-full object-cover border-4 border-amber-200 shadow-lg"
            />
            <div className="absolute -bottom-2 -right-2 bg-green-500 text-white rounded-full p-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Hosted on Cloudinary CDN
          </p>
        </div>
      )}

      {/* Info Section */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="text-sm font-medium text-blue-800 mb-2">Test Information</h4>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>✅ Automatic image optimization</li>
          <li>✅ Global CDN delivery</li>
          <li>✅ Format conversion (WebP/AVIF)</li>
          <li>✅ Quality optimization</li>
          <li>✅ Resize to 300x300px</li>
        </ul>
      </div>
    </div>
  );
};

export default CloudinaryTest;
