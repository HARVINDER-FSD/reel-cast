import asyncHandler from '../utils/asyncHandler.js';
import { NotFoundError, AuthorizationError } from '../utils/AppError.js';
import { sanitizeUser, hideContactDetails } from '../utils/sanitize.js';
import Talent from '../models/Talent.model.js';
import logger from '../utils/logger.js';

/**
 * Talent Controller
 * Manage talent profiles and browsing
 */

/**
 * @route   GET /api/v1/talent
 * @desc    Get all talent with filters and pagination
 * @access  Public (contacts hidden unless authorized)
 */
export const getTalent = asyncHandler(async (req, res) => {
  const {
    search,
    category,
    city,
    minRate,
    maxRate,
    availability,
    verified,
    gender,
    experience,
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = req.query;

  // Build query
  const query = { role: 'talent', isActive: true };

  // Search in name or bio
  if (search) {
    query.$or = [
      { name: new RegExp(search, 'i') },
      { bio: new RegExp(search, 'i') },
      { skills: new RegExp(search, 'i') },
    ];
  }

  if (category) query.category = category;
  if (city) query.city = new RegExp(city, 'i');
  if (availability) query.availability = availability;
  if (verified !== undefined) query.isVerified = verified === 'true';
  if (gender) query.gender = gender;
  if (experience) query.experience = experience;

  // Rate range
  if (minRate || maxRate) {
    query.rate = {};
    if (minRate) query.rate.$gte = parseInt(minRate);
    if (maxRate) query.rate.$lte = parseInt(maxRate);
  }

  // Sort
  const sort = {};
  sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

  // Execute query with pagination
  const talents = await Talent.find(query)
    .select('-password -refreshToken')
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit))
    .sort(sort)
    .lean();

  const total = await Talent.countDocuments(query);

  // Hide contact details unless user is brand or admin
  const sanitizedTalents = talents.map((talent) => {
    // Increment profile views (async, don't wait)
    Talent.findByIdAndUpdate(talent._id, { $inc: { profileViews: 1 } }).exec();

    // Hide contacts if not authorized
    if (!req.user || (req.user.role !== 'brand' && req.user.role !== 'admin')) {
      return hideContactDetails(talent);
    }
    return talent;
  });

  res.status(200).json({
    success: true,
    data: {
      talents: sanitizedTalents,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    },
  });
});

/**
 * @route   GET /api/v1/talent/:id
 * @desc    Get talent by ID
 * @access  Public (contacts hidden unless authorized)
 */
export const getTalentById = asyncHandler(async (req, res) => {
  const talent = await Talent.findOne({
    _id: req.params.id,
    role: 'talent',
    isActive: true,
  })
    .select('-password -refreshToken')
    .lean();

  if (!talent) {
    throw new NotFoundError('Talent not found');
  }

  // Increment profile views
  Talent.findByIdAndUpdate(req.params.id, { $inc: { profileViews: 1 } }).exec();

  // Hide contacts if not authorized
  let sanitizedTalent = talent;
  if (!req.user || (req.user.role !== 'brand' && req.user.role !== 'admin')) {
    sanitizedTalent = hideContactDetails(talent);
  }

  res.status(200).json({
    success: true,
    data: {
      talent: sanitizedTalent,
    },
  });
});

/**
 * @route   PUT /api/v1/talent/:id
 * @desc    Update talent profile
 * @access  Private (talent owner or admin)
 */
export const updateTalent = asyncHandler(async (req, res) => {
  const talent = await Talent.findOne({ _id: req.params.id, role: 'talent' });

  if (!talent) {
    throw new NotFoundError('Talent not found');
  }

  // Check authorization - own profile or admin
  if (req.user.role !== 'admin' && talent._id.toString() !== req.user._id.toString()) {
    throw new AuthorizationError('You can only update your own profile');
  }

  // Fields that can be updated
  const allowedUpdates = [
    'name',
    'phone',
    'city',
    'gender',
    'category',
    'rate',
    'experience',
    'bio',
    'portfolio',
    'skills',
    'languages',
    'availability',
    'socialMedia',
    'profilePicture',
  ];

  // Update only allowed fields
  allowedUpdates.forEach((field) => {
    if (req.body[field] !== undefined) {
      talent[field] = req.body[field];
    }
  });

  await talent.save();

  logger.info('Talent profile updated', {
    talentId: talent._id,
    updatedBy: req.user._id,
  });

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      talent: sanitizeUser(talent),
    },
  });
});

/**
 * @route   DELETE /api/v1/talent/:id
 * @desc    Delete talent (soft delete - deactivate)
 * @access  Private (admin only)
 */
export const deleteTalent = asyncHandler(async (req, res) => {
  const talent = await Talent.findOne({ _id: req.params.id, role: 'talent' });

  if (!talent) {
    throw new NotFoundError('Talent not found');
  }

  // Soft delete - deactivate account
  talent.isActive = false;
  await talent.save();

  logger.warn('Talent account deactivated', {
    talentId: talent._id,
    deactivatedBy: req.user._id,
  });

  res.status(200).json({
    success: true,
    message: 'Talent account deactivated successfully',
  });
});

/**
 * @route   GET /api/v1/talent/stats/overview
 * @desc    Get talent statistics (own profile)
 * @access  Private (talent only)
 */
export const getTalentStats = asyncHandler(async (req, res) => {
  const talent = await Talent.findById(req.user._id);

  if (!talent) {
    throw new NotFoundError('Talent profile not found');
  }

  const stats = {
    profileViews: talent.profileViews || 0,
    totalBookings: talent.totalBookings || 0,
    completedBookings: talent.completedBookings || 0,
    rating: talent.rating || 0,
    reviewCount: talent.reviewCount || 0,
    availability: talent.availability,
  };

  res.status(200).json({
    success: true,
    data: { stats },
  });
});

export default {
  getTalent,
  getTalentById,
  updateTalent,
  deleteTalent,
  getTalentStats,
};
