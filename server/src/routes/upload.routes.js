import express from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { uploadSingle } from '../middleware/upload.js';
import rateLimiters from '../middleware/rateLimiter.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = express.Router();

/**
 * Upload Routes
 * File upload endpoints
 */

// All upload routes require authentication and rate limiting
router.use(authenticate);
router.use(rateLimiters.upload);

// POST /api/v1/upload/profile-picture - Upload profile picture
router.post(
  '/profile-picture',
  uploadSingle('profilePicture'),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_FILE',
          message: 'No file uploaded',
        },
      });
    }

    // TODO: Update user profile with file path
    const fileUrl = `/uploads/profiles/${req.file.filename}`;

    res.status(200).json({
      success: true,
      message: 'Profile picture uploaded successfully',
      data: {
        fileUrl,
        filename: req.file.filename,
      },
    });
  })
);

// POST /api/v1/upload/document - Upload verification document
router.post(
  '/document',
  uploadSingle('document'),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_FILE',
          message: 'No file uploaded',
        },
      });
    }

    const fileUrl = `/uploads/documents/${req.file.filename}`;

    res.status(200).json({
      success: true,
      message: 'Document uploaded successfully',
      data: {
        fileUrl,
        filename: req.file.filename,
      },
    });
  })
);

export default router;
