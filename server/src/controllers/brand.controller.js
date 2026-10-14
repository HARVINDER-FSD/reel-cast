import asyncHandler from '../utils/asyncHandler.js';
import { NotFoundError } from '../utils/AppError.js';
import { sanitizeUser } from '../utils/sanitize.js';
import Brand from '../models/Brand.model.js';
import Booking from '../models/Booking.model.js';
import logger from '../utils/logger.js';

/**
 * Brand Controller
 * Manage brand profiles and subscriptions
 */

/**
 * @route   GET /api/v1/brands/me
 * @desc    Get brand profile
 * @access  Private (brand only)
 */
export const getBrandProfile = asyncHandler(async (req, res) => {
  const brand = await Brand.findById(req.user._id).select('-password -refreshToken');

  if (!brand) {
    throw new NotFoundError('Brand profile not found');
  }

  // Add subscription status
  const profile = brand.toObject();
  profile.subscriptionStatus = {
    isPlanActive: brand.isPlanActive(),
    requestsRemaining: brand.getRequestsRemaining(),
    requestsUsed: brand.requestsUsed,
    requestsLimit: brand.requestsLimit,
    planEndDate: brand.planEndDate,
    daysRemaining: Math.ceil((brand.planEndDate - Date.now()) / (1000 * 60 * 60 * 24)),
  };

  res.status(200).json({
    success: true,
    data: { brand: profile },
  });
});

/**
 * @route   PUT /api/v1/brands/me
 * @desc    Update brand profile
 * @access  Private (brand only)
 */
export const updateBrandProfile = asyncHandler(async (req, res) => {
  const brand = await Brand.findById(req.user._id);

  if (!brand) {
    throw new NotFoundError('Brand profile not found');
  }

  // Fields that can be updated
  const allowedUpdates = [
    'name',
    'phone',
    'brandName',
    'companyType',
    'industry',
    'website',
    'description',
    'billingAddress',
    'gstNumber',
    'profilePicture',
  ];

  // Update allowed fields
  allowedUpdates.forEach((field) => {
    if (req.body[field] !== undefined) {
      brand[field] = req.body[field];
    }
  });

  await brand.save();

  logger.info('Brand profile updated', { brandId: brand._id });

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: { brand: sanitizeUser(brand) },
  });
});

/**
 * @route   GET /api/v1/brands/subscription
 * @desc    Get subscription details
 * @access  Private (brand only)
 */
export const getSubscription = asyncHandler(async (req, res) => {
  const brand = await Brand.findById(req.user._id);

  if (!brand) {
    throw new NotFoundError('Brand profile not found');
  }

  // Get booking stats
  const bookingStats = await Booking.aggregate([
    { $match: { brand: brand._id } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  const stats = bookingStats.reduce((acc, stat) => {
    acc[stat._id] = stat.count;
    return acc;
  }, {});

  const subscription = {
    plan: brand.plan,
    planStartDate: brand.planStartDate,
    planEndDate: brand.planEndDate,
    isPlanActive: brand.isPlanActive(),
    requestsLimit: brand.requestsLimit,
    requestsUsed: brand.requestsUsed,
    requestsRemaining: brand.getRequestsRemaining(),
    daysRemaining: Math.ceil((brand.planEndDate - Date.now()) / (1000 * 60 * 60 * 24)),
    bookingStats: {
      total: brand.totalBookings,
      pending: stats.pending || 0,
      approved: stats.approved || 0,
      rejected: stats.rejected || 0,
      completed: stats.completed || 0,
    },
    totalSpent: brand.totalSpent,
  };

  // Plan features
  const planFeatures = {
    starter: {
      price: 2999,
      requests: 5,
      features: [
        '50 talent + page profiles',
        '5 booking/promo requests',
        'All 12 categories + IG pages',
        'Email support',
      ],
    },
    growth: {
      price: 5999,
      requests: 20,
      features: [
        'Unlimited browsing',
        '20 requests/month',
        'Priority admin processing',
        'Account manager',
        'Instagram page analytics',
      ],
    },
    pro: {
      price: 9999,
      requests: -1, // unlimited
      features: [
        'Everything in Growth',
        'Unlimited requests',
        'WhatsApp support',
        'Early access to new pages',
        'Custom sourcing',
      ],
    },
  };

  subscription.currentPlanFeatures = planFeatures[brand.plan];

  res.status(200).json({
    success: true,
    data: { subscription },
  });
});

/**
 * @route   GET /api/v1/brands/dashboard
 * @desc    Get brand dashboard data
 * @access  Private (brand only)
 */
export const getBrandDashboard = asyncHandler(async (req, res) => {
  const brand = await Brand.findById(req.user._id);

  if (!brand) {
    throw new NotFoundError('Brand profile not found');
  }

  // Get recent bookings
  const recentBookings = await Booking.find({ brand: brand._id })
    .populate('talent', 'name category city rate')
    .populate('instagramPage', 'handle niche followers postRate')
    .sort({ createdAt: -1 })
    .limit(10);

  // Stats
  const stats = {
    requestsUsed: brand.requestsUsed,
    requestsRemaining: brand.getRequestsRemaining(),
    totalBookings: brand.totalBookings,
    approvedBookings: brand.approvedBookings,
    pendingBookings: brand.pendingBookings,
    rejectedBookings: brand.rejectedBookings,
    planExpiring: brand.isPlanActive(),
    daysRemaining: Math.ceil((brand.planEndDate - Date.now()) / (1000 * 60 * 60 * 24)),
  };

  res.status(200).json({
    success: true,
    data: {
      stats,
      recentBookings,
    },
  });
});

export default {
  getBrandProfile,
  updateBrandProfile,
  getSubscription,
  getBrandDashboard,
};
