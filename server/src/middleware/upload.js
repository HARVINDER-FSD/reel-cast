import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { FileUploadError } from '../utils/AppError.js';
import fs from 'fs';

/**
 * File Upload Middleware
 * Secure file upload handling with validation
 */

// Ensure upload directory exists
const uploadDir = process.env.UPLOAD_DIR || 'uploads';
const profileDir = path.join(uploadDir, 'profiles');
const documentDir = path.join(uploadDir, 'documents');

[uploadDir, profileDir, documentDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let dest = uploadDir;
    
    if (file.fieldname === 'profilePicture' || file.fieldname === 'avatar') {
      dest = profileDir;
    } else if (file.fieldname === 'document' || file.fieldname === 'verification') {
      dest = documentDir;
    }
    
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: uuid-timestamp-originalname
    const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// File filter - validate file types
const fileFilter = (req, file, cb) => {
  // Allowed image types
  const imageTypes = /jpeg|jpg|png|gif|webp/;
  // Allowed document types
  const documentTypes = /pdf|doc|docx/;

  const extname = path.extname(file.originalname).toLowerCase().replace('.', '');
  const mimetype = file.mimetype;

  // Check based on field name
  if (file.fieldname === 'profilePicture' || file.fieldname === 'avatar') {
    // Must be an image
    if (imageTypes.test(extname) && mimetype.startsWith('image/')) {
      return cb(null, true);
    }
    return cb(new FileUploadError('Only image files are allowed for profile pictures (jpeg, jpg, png, gif, webp)'));
  }

  if (file.fieldname === 'document' || file.fieldname === 'verification') {
    // Can be image or document
    if (imageTypes.test(extname) || documentTypes.test(extname)) {
      return cb(null, true);
    }
    return cb(new FileUploadError('Only image or document files are allowed (jpeg, jpg, png, pdf, doc, docx)'));
  }

  // Default: allow images
  if (imageTypes.test(extname) && mimetype.startsWith('image/')) {
    return cb(null, true);
  }

  cb(new FileUploadError('Invalid file type'));
};

// Multer configuration
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
    files: 5, // Maximum 5 files per request
  },
});

// Middleware for single file upload
export const uploadSingle = (fieldName) => {
  return (req, res, next) => {
    const singleUpload = upload.single(fieldName);
    
    singleUpload(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return next(new FileUploadError('File size exceeds maximum allowed size (5MB)'));
          }
          return next(new FileUploadError(err.message));
        }
        return next(err);
      }
      next();
    });
  };
};

// Middleware for multiple file upload
export const uploadMultiple = (fieldName, maxCount = 5) => {
  return (req, res, next) => {
    const multipleUpload = upload.array(fieldName, maxCount);
    
    multipleUpload(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return next(new FileUploadError('One or more files exceed maximum allowed size (5MB)'));
          }
          if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return next(new FileUploadError(`Maximum ${maxCount} files allowed`));
          }
          return next(new FileUploadError(err.message));
        }
        return next(err);
      }
      next();
    });
  };
};

// Middleware for multiple fields
export const uploadFields = (fields) => {
  return (req, res, next) => {
    const fieldsUpload = upload.fields(fields);
    
    fieldsUpload(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return next(new FileUploadError('One or more files exceed maximum allowed size (5MB)'));
          }
          return next(new FileUploadError(err.message));
        }
        return next(err);
      }
      next();
    });
  };
};

export default {
  uploadSingle,
  uploadMultiple,
  uploadFields,
};
