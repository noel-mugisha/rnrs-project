// Quick test to verify Cloudinary signature generation
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const timestamp = Math.round(Date.now() / 1000);
const publicId = `job-portal/resumes/test-${timestamp}`;

// Only include parameters that are validated in the signature
const paramsToSign = {
  public_id: publicId,
  timestamp: timestamp,
};

const signature = cloudinary.utils.api_sign_request(
  paramsToSign,
  process.env.CLOUDINARY_API_SECRET
);

console.log('=== Cloudinary Upload Test ===');
console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('API Key:', process.env.CLOUDINARY_API_KEY ? '✓ Set' : '✗ Missing');
console.log('API Secret:', process.env.CLOUDINARY_API_SECRET ? '✓ Set' : '✗ Missing');
console.log('\n=== Upload Parameters ===');
console.log('Timestamp:', timestamp);
console.log('Public ID:', publicId);
console.log('Signature:', signature);
console.log('\n=== FormData to send ===');
console.log('file: [your file]');
console.log('timestamp:', timestamp);
console.log('public_id:', publicId);
console.log('signature:', signature);
console.log('api_key:', process.env.CLOUDINARY_API_KEY);
console.log('\n=== Upload URL ===');
console.log(`https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload`);
console.log('\n✅ If you see all values above, your configuration is correct!');