// src/controllers/upload.controller.js
const { uploadImage, deleteImage } = require('../utils/cloudinary');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Lazy load S3 utilities only when needed
let s3Utils = null;
const getS3Utils = () => {
  if (!s3Utils && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_BUCKET_NAME) {
    try {
      s3Utils = require('../utils/s3');
    } catch (e) {
      console.warn('AWS S3 SDK not installed, S3 upload disabled');
    }
  }
  return s3Utils;
};

// Configure multer for local storage
const localStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const localUpload = multer({
  storage: localStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Choose upload method based on configuration
const upload = (process.env.CLOUDINARY_CLOUD_NAME || process.env.AWS_BUCKET_NAME) ?
  multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed!'), false);
      }
    }
  }).single('image') :
  localUpload.single('image');

exports.upload = upload;

exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // UTILS: Chọn Storage Service (Ưu tiên AWS S3 > Cloudinary > Local)
    const s3 = getS3Utils();
    if (s3 && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_BUCKET_NAME) {
         // --- AWS S3 UPLOAD ---
         const result = await s3.uploadToS3(req.file.buffer, req.file.originalname, 'products');
         res.json({
            url: result.url,
            public_id: result.public_id,
            message: 'Image uploaded successfully to AWS S3'
         });

    } else if (process.env.CLOUDINARY_CLOUD_NAME) {
      // --- CLOUDINARY UPLOAD ---
      const result = await uploadImage(req.file.buffer, 'products');

      res.json({
        url: result.secure_url,
        public_id: result.public_id,
        message: 'Image uploaded successfully to Cloudinary'
      });
    } else {
      // --- LOCAL STORAGE ---
      const filename = req.file.filename;
      // Return full URL with backend domain
      const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';
      const url = `${backendUrl}/uploads/${filename}`;

      res.json({
        url: url,
        public_id: filename, 
        message: 'Image uploaded successfully to local storage'
      });
    }
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
};

exports.deleteImage = async (req, res) => {
  try {
    const { publicId } = req.body;
    if (!publicId) return res.status(400).json({ msg: 'publicId required' });

    const s3Delete = getS3Utils();
    if (s3Delete && process.env.AWS_BUCKET_NAME) {
        // Delete from AWS S3
        await s3Delete.deleteFromS3(publicId);
        res.json({ msg: 'Deleted from AWS S3' });
        
    } else if (process.env.CLOUDINARY_CLOUD_NAME) {
      // Delete from Cloudinary
      await deleteImage(publicId);
      res.json({ msg: 'Deleted from Cloudinary' });
      
    } else {
      // Delete from local storage
      const filePath = path.join(__dirname, '../../uploads', publicId);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    res.json({ msg: 'Image deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: 'Delete failed', error: error.message });
  }
};