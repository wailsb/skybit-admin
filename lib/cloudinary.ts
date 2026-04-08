import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary using user's environment variables
// It binds to CLOUDINARY_CLOUD_NAME first, falling back to CLOUDINARY_PRODUCT_ENV as requested.
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_PRODUCT_ENV,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export default cloudinary;
