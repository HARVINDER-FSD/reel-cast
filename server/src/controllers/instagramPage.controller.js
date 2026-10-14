import asyncHandler from '../utils/asyncHandler.js';
import { NotFoundError, AuthorizationError } from '../utils/AppError.js';
import { sanitizeUser, hideContactDetails } from '../utils/sanitize.js';
import InstagramPage from '../models/InstagramPage.model.js';
import logger from '../utils/logger.js';

/**
 * Instagram Page Controller
 * Manage Instagram page profiles and browsing
 */

/**
 * @route   GET /api/v1/instagram-pages
 * @desc    Get all Instagram pages with filters and pagination
 * @access  Public (contacts hidden unless authorized)
 */
export const getInstagramPages = asyncHandler(async (req, res) => {
  const {
    search,
    niche,
    city,
    minFollowers,
    maxFollowers,
    followerCategory,
    minPostRate,
    maxPostRate,
    availability,
    verified,
    page = 1,
    limit = 20,
    sortBy = 'followerCount',
    sortOrder = 'desc',
  } = req.query;

  // Build query
  const query = { role: 'igpage', isActive: true };

  // Search in handle, niche, or about
  if (search) {
    query.$or = [
      { handle: new RegExp(search, 'i') },
      { niche: new RegExp(search, 'i') },
      { about: new RegExp(search, 'i') },
    ];
  }

  if (niche) query.niche = niche;
  if (city) query.city = new RegExp(city, 'i');
  if (availability) query.availability = availability;
  if (verified !== undefined) query.isVerified = verified === 'true';

  // Follower range
  if (minFollowers || maxFollowers || followerCategory) {
    query.followerCount = {};
    
    if (followerCategory) {
      // Follower categories
      const categories = {
        Nano: { min: 1000, max: 10000 },
        Micro: { min: 10000, max: 50000 },
        'Mid-tier': { min: 50000, max: 200000 },
        Macro: { min: 200000, max: 1000000 },
        Mega: { min: 1000000, max: Infinity },
      };
      
      if (categories[followerCategory]) {
        query.followerCount.$gte = categories[followerCategory].min;
        if (categories[followerCategory].max !== Infinity) {
          query.followerCount.$lte = categories[followerCategory].max;
        }
      }
    } else {
      if (minFollowers) query.followerCount.$gte = parseInt(minFollowers);
      if (maxFollowers) query.followerCount.$lte = parseInt(maxFollowers);
    }
  }

  // Post rate range
  if (minPostRate || maxPostRate) {
    query.postRate = {};
    if (minPostRate) query.postRate.$gte = parseInt(minPostRate);
    if (maxPostRate) query.postRate.$lte = parseInt(maxPostRate);
  }

  // Sort
  const sort = {};
  sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

  // Execute query with pagination
  const pages = await InstagramPage.find(query)
    .select('-password -refreshToken')
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit))
    .sort(sort)
    .lean();

  const total = await InstagramPage.countDocuments(query);

  // Hide contact details unless user is brand or admin
  const sanitizedPages = pages.map((igPage) => {
    // Increment profile views
    InstagramPage.findByIdAndUpdate(igPage._id, { $inc: { profileViews: 1 } }).exec();

    // Hide contacts if not authorized
    if (!req.user || (req.user.role !== 'brand' && req.user.role !== 'admin')) {
      return hideContactDetails(igPage);
    }
    return igPage;
  });

  res.status(200).json({
    success: true,
    data: {
      instagramPages: sanitizedPages,
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
 * @route   GET /api/v1/instagram-pages/:id
 * @desc    Get Instagram page by ID
 * @access  Public (contacts hidden unless authorized)
 */
export const getInstagramPageById = asyncHandler(async (req, res) => {
  const igPage = await InstagramPage.findOne({
    _id: req.params.id,
    role: 'igpage',
    isActive: true,
  })
    .select('-password -refreshToken')
    .lean();

  if (!igPage) {
    throw new NotFoundError('Instagram page not found');
  }

  // Increment profile views
  InstagramPage.findByIdAndUpdate(req.params.id, { $inc: { profileViews: 1 } }).exec();

  // Hide contacts if not authorized
  let sanitizedPage = igPage;
  if (!req.user || (req.user.role !== 'brand' && req.user.role !== 'admin')) {
    sanitizedPage = hideContactDetails(igPage);
  }

  res.status(200).json({
    success: true,
    data: {
      instagramPage: sanitizedPage,
    },
  });
});

/**
 * @route   PUT /api/v1/instagram-pages/:id
 * @desc    Update Instagram page profile
 * @access  Private (page owner or admin)
 */
export const updateInstagramPage = asyncHandler(async (req, res) => {
  const igPage = await InstagramPage.findOne({ _id: req.params.id, role: 'igpage' });

  if (!igPage) {
    throw new NotFoundError('Instagram page not found');
  }

  // Check authorization
  if (req.user.role !== 'admin' && igPage._id.toString() !== req.user._id.toString()) {
    throw new AuthorizationError('You can only update your own profile');
  }

  // Fields that can be updated
  const allowedUpdates = [
    'name',
    'phone',
    'handle',
    'niche',
    'followers',
    'followerCount',
    'engagementRate',
    'city',
    'about',
    'postRate',
    'storyRate',
    'reelRate',
    'averageLikes',
    'averageComments',
    'averageReach',
    'audienceGender',
    'audienceAge',
    'topCountries',
    'topCities',
    'availability',
    'profilePicture',
  ];

  // Update only allowed fields
  allowedUpdates.forEach((field) => {
    if (req.body[field] !== undefined) {
      igPage[field] = req.body[field];
    }
  });

  await igPage.save();

  logger.info('Instagram page profile updated', {
    pageId: igPage._id,
    updatedBy: req.user._id,
  });

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      instagramPage: sanitizeUser(igPage),
    },
  });
});

/**
 * @route   DELETE /api/v1/instagram-pages/:id
 * @desc    Delete Instagram page (soft delete)
 * @access  Private (admin only)
 */
export const deleteInstagramPage = asyncHandler(async (req, res) => {
  const igPage = await InstagramPage.findOne({ _id: req.params.id, role: 'igpage' });

  if (!igPage) {
    throw new NotFoundError('Instagram page not found');
  }

  // Soft delete
  igPage.isActive = false;
  await igPage.save();

  logger.warn('Instagram page deactivated', {
    pageId: igPage._id,
    deactivatedBy: req.user._id,
  });

  res.status(200).json({
    success: true,
    message: 'Instagram page deactivated successfully',
  });
});

/**
 * @route   GET /api/v1/instagram-pages/stats/overview
 * @desc    Get Instagram page statistics (own profile)
 * @access  Private (igpage only)
 */
export const getInstagramPageStats = asyncHandler(async (req, res) => {
  const igPage = await InstagramPage.findById(req.user._id);

  if (!igPage) {
    throw new NotFoundError('Instagram page not found');
  }

  const stats = {
    profileViews: igPage.profileViews || 0,
    totalPromos: igPage.totalPromos || 0,
    completedPromos: igPage.completedPromos || 0,
    rating: igPage.rating || 0,
    reviewCount: igPage.reviewCount || 0,
    followerCount: igPage.followerCount,
    followerCategory: igPage.getFollowerCategory(),
    availability: igPage.availability,
  };

  res.status(200).json({
    success: true,
    data: { stats },
  });
});

export default {
  getInstagramPages,
  getInstagramPageById,
  updateInstagramPage,
  deleteInstagramPage,
  getInstagramPageStats,
};
