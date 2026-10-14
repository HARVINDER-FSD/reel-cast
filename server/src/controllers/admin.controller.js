import asyncHandler from '../utils/asyncHandler.js';
import { NotFoundError } from '../utils/AppError.js';
import User from '../models/User.model.js';
import Talent from '../models/Talent.model.js';
import InstagramPage from '../models/InstagramPage.model.js';
import Brand from '../models/Brand.model.js';
import Booking from '../models/Booking.model.js';
import logger from '../utils/logger.js';

/**
 * Admin Controller
 * Platform administration and management
 */

/**
 * @route   GET /api/v1/admin/stats
 * @desc    Get platform statistics
 * @access  Private (admin only)
 */
export const getStats = asyncHandler(async (req, res) => {
  // User counts by role
  const userStats = await User.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: '$role',
        count: { $sum: 1 },
        verified: { $sum: { $cond: ['$isVerified', 1, 0] } },
      },
    },
  ]);

  const stats = userStats.reduce((acc, stat) => {
    acc[stat._id] = {
      total: stat.count,
      verified: stat.verified,
      unverified: stat.count - stat.verified,
    };
    return acc;
  }, {});

  // Booking stats
  const bookingStats = await Booking.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  const bookings = bookingStats.reduce((acc, stat) => {
    acc[stat._id] = stat.count;
    return acc;
  }, {});

  // Revenue estimate (sum of completed booking budgets)
  const revenueData = await Booking.aggregate([
    { $match: { status: 'completed' } },
    { $group: { _id: null, total: { $sum: '$budget' } } },
  ]);

  // Recent activity
  const recentUsers = await User.find({ isActive: true })
    .select('name email role createdAt')
    .sort({ createdAt: -1 })
    .limit(10);

  const recentBookings = await Booking.find()
    .populate('brand', 'name brandName')
    .populate('talent', 'name category')
    .populate('instagramPage', 'handle niche')
    .sort({ createdAt: -1 })
    .limit(10);

  // Weekly growth
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const newUsersThisWeek = await User.countDocuments({
    createdAt: { $gte: oneWeekAgo },
    isActive: true,
  });

  const newBookingsThisWeek = await Booking.countDocuments({
    createdAt: { $gte: oneWeekAgo },
  });

  res.status(200).json({
    success: true,
    data: {
      overview: {
        totalUsers: Object.values(stats).reduce((sum, s) => sum + s.total, 0),
        totalTalent: stats.talent?.total || 0,
        totalInstagramPages: stats.igpage?.total || 0,
        totalBrands: stats.brand?.total || 0,
        totalBookings: Object.values(bookings).reduce((sum, count) => sum + count, 0),
        pendingBookings: bookings.pending || 0,
        completedBookings: bookings.completed || 0,
        estimatedRevenue: revenueData[0]?.total || 0,
      },
      users: stats,
      bookings,
      growth: {
        newUsersThisWeek,
        newBookingsThisWeek,
      },
      recentActivity: {
        users: recentUsers,
        bookings: recentBookings,
      },
    },
  });
});

/**
 * @route   GET /api/v1/admin/users
 * @desc    Get all users with filters
 * @access  Private (admin only)
 */
export const getAllUsers = asyncHandler(async (req, res) => {
  const {
    role,
    verified,
    active,
    search,
    page = 1,
    limit = 50,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = req.query;

  // Build query
  const query = {};
  if (role) query.role = role;
  if (verified !== undefined) query.isVerified = verified === 'true';
  if (active !== undefined) query.isActive = active === 'true';

  if (search) {
    query.$or = [
      { name: new RegExp(search, 'i') },
      { email: new RegExp(search, 'i') },
    ];
  }

  // Sort
  const sort = {};
  sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

  // Execute query
  const users = await User.find(query)
    .select('-password -refreshToken')
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit))
    .sort(sort);

  const total = await User.countDocuments(query);

  res.status(200).json({
    success: true,
    data: {
      users,
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
 * @route   PUT /api/v1/admin/users/:id/verify
 * @desc    Verify user (talent or Instagram page)
 * @access  Private (admin only)
 */
export const verifyUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new NotFoundError('User not found');
  }

  if (user.role !== 'talent' && user.role !== 'igpage') {
    return res.status(400).json({
      success: false,
      message: 'Only talent and Instagram pages can be verified',
    });
  }

  user.isVerified = true;
  await user.save();

  logger.info('User verified', {
    userId: user._id,
    userRole: user.role,
    verifiedBy: req.user._id,
  });

  res.status(200).json({
    success: true,
    message: `${user.role === 'talent' ? 'Talent' : 'Instagram page'} verified successfully`,
    data: { user },
  });
});

/**
 * @route   PUT /api/v1/admin/users/:id/deactivate
 * @desc    Deactivate user account
 * @access  Private (admin or super-admin)
 * @note    Only Super Admin can deactivate other admins
 */
export const deactivateUser = asyncHandler(async (req, res) => {
  const isSuperAdmin = req.user.role === 'super-admin' && req.user.isSuperAdmin;
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Only Super Admin can deactivate admin accounts
  if (user.role === 'admin' && !isSuperAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Only Super Admin can deactivate admin accounts',
    });
  }

  // Super Admin cannot deactivate themselves
  if (isSuperAdmin && user._id.toString() === req.user._id.toString()) {
    return res.status(400).json({
      success: false,
      message: 'You cannot deactivate your own account',
    });
  }

  user.isActive = false;
  await user.save();

  logger.warn('User deactivated', {
    userId: user._id,
    userRole: user.role,
    deactivatedBy: req.user._id,
    deactivatedByRole: req.user.role,
  });

  res.status(200).json({
    success: true,
    message: 'User account deactivated successfully',
  });
});

/**
 * @route   PUT /api/v1/admin/users/:id/activate
 * @desc    Reactivate user account
 * @access  Private (admin only)
 */
export const activateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new NotFoundError('User not found');
  }

  user.isActive = true;
  await user.save();

  logger.info('User reactivated', {
    userId: user._id,
    reactivatedBy: req.user._id,
  });

  res.status(200).json({
    success: true,
    message: 'User account reactivated successfully',
  });
});

/**
 * @route   GET /api/v1/admin/bookings
 * @desc    Get all bookings (admin oversight)
 * @access  Private (admin only)
 */
export const getAllBookings = asyncHandler(async (req, res) => {
  const {
    status,
    bookingType,
    page = 1,
    limit = 50,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = req.query;

  // Build query
  const query = {};
  if (status) query.status = status;
  if (bookingType) query.bookingType = bookingType;

  // Sort
  const sort = {};
  sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

  // Execute query
  const bookings = await Booking.find(query)
    .populate('brand', 'name email brandName')
    .populate('talent', 'name email category city')
    .populate('instagramPage', 'name email handle niche')
    .populate('reviewedBy', 'name email')
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit))
    .sort(sort);

  const total = await Booking.countDocuments(query);

  res.status(200).json({
    success: true,
    data: {
      bookings,
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
 * @route   GET /api/v1/admin/dashboard
 * @desc    Get admin dashboard data
 * @access  Private (admin or super-admin)
 * @role    Super Admin gets additional system info
 */
export const getAdminDashboard = asyncHandler(async (req, res) => {
  const isSuperAdmin = req.user.role === 'super-admin' && req.user.isSuperAdmin;

  // Pending actions
  const pendingBookings = await Booking.countDocuments({ status: 'pending' });
  const unverifiedTalent = await Talent.countDocuments({ isVerified: false, isActive: true });
  const unverifiedPages = await InstagramPage.countDocuments({
    isVerified: false,
    isActive: true,
  });

  // Quick stats
  const totalUsers = await User.countDocuments({ isActive: true });
  const totalBookings = await Booking.countDocuments();
  const totalRevenue = await Booking.aggregate([
    { $match: { status: 'completed' } },
    { $group: { _id: null, total: { $sum: '$budget' } } },
  ]);

  // Recent pending bookings
  const recentPendingBookings = await Booking.find({ status: 'pending' })
    .populate('brand', 'name brandName')
    .populate('talent', 'name category')
    .populate('instagramPage', 'handle niche')
    .sort({ createdAt: -1 })
    .limit(10);

  // Additional data for Super Admin
  let superAdminData = null;
  if (isSuperAdmin) {
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const inactiveUsers = await User.countDocuments({ isActive: false });
    const adminAccounts = await User.find({ role: 'admin' })
      .select('name email isActive createdAt')
      .sort({ createdAt: -1 });

    superAdminData = {
      systemInfo: {
        totalAdmins,
        inactiveUsers,
        adminAccounts,
      },
      access: 'SUPER_ADMIN_FULL_ACCESS',
    };
  }

  res.status(200).json({
    success: true,
    userRole: req.user.role,
    isSuperAdmin,
    data: {
      pendingActions: {
        pendingBookings,
        unverifiedTalent,
        unverifiedPages,
        total: pendingBookings + unverifiedTalent + unverifiedPages,
      },
      quickStats: {
        totalUsers,
        totalBookings,
        totalRevenue: totalRevenue[0]?.total || 0,
      },
      recentPendingBookings,
      ...(superAdminData && { superAdminInfo: superAdminData }),
    },
  });
});

export default {
  getStats,
  getAllUsers,
  verifyUser,
  deactivateUser,
  activateUser,
  getAllBookings,
  getAdminDashboard,
};
