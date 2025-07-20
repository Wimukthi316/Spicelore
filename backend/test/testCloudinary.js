const cloudinary = require('../config/cloudinary');

// Test Cloudinary connection
async function testCloudinaryConnection() {
  try {
    console.log('Testing Cloudinary connection...');
    
    // Test the connection by getting account details
    const result = await cloudinary.api.ping();
    
    if (result.status === 'ok') {
      console.log('✅ Cloudinary connection successful!');
      console.log('Cloud name:', cloudinary.config().cloud_name);
      
      // Get account usage info
      const usage = await cloudinary.api.usage();
      console.log('📊 Account Usage:');
      console.log(`- Storage used: ${(usage.storage.used_bytes / 1024 / 1024).toFixed(2)} MB`);
      console.log(`- Credits used: ${usage.credits.used_percent}%`);
      console.log(`- Transformations this month: ${usage.transformations.used}`);
      
    } else {
      console.log('❌ Cloudinary connection failed');
    }
  } catch (error) {
    console.error('❌ Error testing Cloudinary connection:', error.message);
    
    if (error.message.includes('Invalid API key')) {
      console.log('💡 Check your CLOUDINARY_API_KEY in .env file');
    } else if (error.message.includes('Invalid API secret')) {
      console.log('💡 Check your CLOUDINARY_API_SECRET in .env file');
    } else if (error.message.includes('Invalid cloud name')) {
      console.log('💡 Check your CLOUDINARY_CLOUD_NAME in .env file');
    }
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  require('dotenv').config();
  testCloudinaryConnection();
}

module.exports = testCloudinaryConnection;
