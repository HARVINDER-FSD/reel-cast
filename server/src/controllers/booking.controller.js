import asyncHandler from '../utils/asyncHandler.js';
import {
  NotFoundError,
  AuthorizationError,
  ValidationError,
  ConflictError,
} from '../utils/AppError.js';
import Booking from '../models/Booking.model.js';
import Talent from '../models/Talent.model.js';
import InstagramPage from '../models/InstagramPage.model.js';
import Brand from '../models/Brand.model.js';
import emailService from '../utils/emailService.js';
import logger from '../utils/logger.js';

/**
 * Booking Controller
 * Manage booking requests between brands and talent/instagram pages
 */

/**
 * @route   POST /api/v1/bookings/talent
 * @desc    Create talent booking request
 * @access  Private (brand only)
 */
export const createTalentBooking = asyncHandler(async (req, res) => {
  const { talentId, projectType, shootDate, message, budget, brandNotes } = req.body;

  // Get brand
  const brand = await Brand.findById(req.user._id);
  if (!brand) {
    throw new NotFoundError('Brand profile not found');
  }

  // Check if brand has requests available
  if (!brand.hasRequestsAvailable()) {
    throw new ValidationError(
      'Request limit reached for your plan. Please upgrade or wait for renewal.'
    );
  }

  // Verify talent exists and is active
  const talent = await Talent.findOne({ _id: talentId, role: 'talent', isActive: true });
  if (!talent) {
    throw new NotFoundError('Talent not found or unavailable');
  }

  // Create booking
  const booking = await Booking.create({
    brand: req.user._id,
    talent: talentId,
    bookingType: 'talent',
    projectType,
    shootDate,
    message,
    budget: budget || talent.rate,
    brandNotes,
    status: 'pending',
  });

  // Update brand's request count
  brand.requestsUsed += 1;
  brand.pendingBookings += 1;
  await brand.save();

  // Update talent stats
  talent.totalBookings += 1;
  await talent.save();

  // Send email notification to talent (non-blocking)
  emailService.sendBookingRequestEmail(booking, talent, brand).catch((err) =>
    logger.error('Failed to send booking email', { error: err.message })
  );

  logger.info('Talent booking created', {
    bookingId: booking._id,
    brandId: req.user._id,
    talentId,
  });

  res.status(201).json({
    success: true,
    message: 'Booking request submitted successfully. Awaiting admin approval.',
    data: { booking },
  });
});

/**
 * @route   POST /api/v1/bookings/instagram
 * @desc    Create Instagram promo booking request
 * @access  Private (brand only)
 */
export const createInstagramBooking = asyncHandler(async (req, res) => {
  const { instagramPageId, promoType, goLiveDate, campaignName, message, budget, brandNotes } =
    req.body;

  // Get brand
  const brand = await Brand.findById(req.user._id);
  if (!brand) {
    throw new NotFoundError('Brand profile not found');
  }

  // Check requests available
  if (!brand.hasRequestsAvailable()) {
    throw new ValidationError('Request limit reached. Please upgrade your plan.');
  }

  // Verify Instagram page exists
  const igPage = await InstagramPage.findOne({
    _id: instagramPageId,
    role: 'igpage',
    isActive: true,
  });
  if (!igPage) {
    throw new NotFoundError('Instagram page not found or unavailable');
  }

  // Create booking
  const booking = await Booking.create({
    brand: req.user._id,
    instagramPage: instagramPageId,
    bookingType: 'instagram',
    promoType,
    goLiveDate,
    campaignName,
    message,
    budget: budget || igPage.postRate,
    brandNotes,
    status: 'pending',
  });

  // Update brand stats
  brand.requestsUsed += 1;
  brand.pendingBookings += 1;
  await brand.save();

  // Update IG page stats
  igPage.totalPromos += 1;
  await igPage.save();

  // Send email (non-blocking)
  emailService.sendBookingRequestEmail(booking, igPage, brand).catch((err) =>
    logger.error('Failed to send booking email', { error: err.message })
  );

  logger.info('Instagram booking created', {
    bookingId: booking._id,
    brandId: req.user._id,
    pageId: instagramPageId,
  });

  res.status(201).json({
    success: true,
    message: 'Promo request submitted successfully. Awaiting admin approval.',
    data: { booking },
  });
});

/**
 * @route   GET /api/v1/bookings
 * @desc    Get user's bookings (filtered by role)
 * @access  Private
 */
export const getBookings = asyncHandler(async (req, res) => {
  const { status, bookingType, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } =
    req.query;

  // Build query based on user role
  let query = {};

  if (req.user.role === 'brand') {
    query.brand = req.user._id;
  } else if (req.user.role === 'talent') {
    query.talent = req.user._id;
  } else if (req.user.role === 'igpage') {
    query.instagramPage = req.user._id;
  } else {
    throw new AuthorizationError('Invalid role for booking access');
  }

  // Filters
  if (status) query.status = status;
  if (bookingType) query.bookingType = bookingType;

  // Sort
  const sort = {};
  sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

  // Execute query
  const bookings = await Booking.find(query)
    .populate('brand', 'name email phone brandName')
    .populate('talent', 'name email phone city category rate')
    .populate('instagramPage', 'name email phone handle niche followers postRate')
    .populate('reviewedBy', 'name email')
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit))
    .sort(sort);

  const total = await Booking.countDocuments(query);

  // Hide contact details based on status and role
  const sanitizedBookings = bookings.map((booking) => {
    const bookingObj = booking.toObject();

    // Contacts revealed only if approved
    if (booking.status !== 'approved') {
      // Hide talent/page contacts from brand
      if (req.user.role === 'brand') {
        if (bookingObj.talent) {
          bookingObj.talent.phone = '***';
          bookingObj.talent.email = '***';
        }
        if (bookingObj.instagramPage) {
          bookingObj.instagramPage.phone = '***';
          bookingObj.instagramPage.email = '***';
        }
      }

      // Hide brand contacts from talent/page
      if (req.user.role === 'talent' || req.user.role === 'igpage') {
        if (bookingObj.brand) {
          bookingObj.brand.phone = '***';
          bookingObj.brand.email = '***';
        }
      }
    }

    return bookingObj;
  });

  res.status(200).json({
    success: true,
    data: {
      bookings: sanitizedBookings,
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
 * @route   GET /api/v1/bookings/:id
 * @desc    Get booking by ID
 * @access  Private (participants only)
 */
export const getBookingById = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('brand', 'name email phone brandName')
    .populate('talent', 'name email phone city category rate')
    .populate('instagramPage', 'name email phone handle niche followers postRate')
    .populate('reviewedBy', 'name email');

  if (!booking) {
    throw new NotFoundError('Booking not found');
  }

  // Check authorization
  const isParticipant =
    booking.brand.toString() === req.user._id.toString() ||
    (booking.talent && booking.talent._id.toString() === req.user._id.toString()) ||
    (booking.instagramPage && booking.instagramPage._id.toString() === req.user._id.toString()) ||
    req.user.role === 'admin';

  if (!isParticipant) {
    throw new AuthorizationError('You do not have access to this booking');
  }

  // Hide contacts if not approved
  let sanitizedBooking = booking.toObject();
  if (booking.status !== 'approved' && req.user.role !== 'admin') {
    if (req.user.role === 'brand') {
      if (sanitizedBooking.talent) {
        sanitizedBooking.talent.phone = '***';
        sanitizedBooking.talent.email = '***';
      }
      if (sanitizedBooking.instagramPage) {
        sanitizedBooking.instagramPage.phone = '***';
        sanitizedBooking.instagramPage.email = '***';
      }
    } else {
      if (sanitizedBooking.brand) {
        sanitizedBooking.brand.phone = '***';
        sanitizedBooking.brand.email = '***';
      }
    }
  }

  res.status(200).json({
    success: true,
    data: { booking: sanitizedBooking },
  });
});

/**
 * @route   PUT /api/v1/bookings/:id/approve
 * @desc    Approve booking request (admin only)
 * @access  Private (admin)
 */
export const approveBooking = asyncHandler(async (req, res) => {
  const { adminNotes } = req.body;

  const booking = await Booking.findById(req.params.id)
    .populate('brand', 'name email')
    .populate('talent', 'name email phone')
    .populate('instagramPage', 'name email phone handle');

  if (!booking) {
    throw new NotFoundError('Booking not found');
  }

  if (booking.status !== 'pending') {
    throw new ConflictError(`Booking is already ${booking.status}`);
  }

  // Update booking
  booking.status = 'approved';
  booking.reviewedBy = req.user._id;
  booking.reviewedAt = new Date();
  booking.contactRevealed = true;
  if (adminNotes) booking.adminNotes = adminNotes;
  await booking.save();

  // Update brand stats
  await Brand.findByIdAndUpdate(booking.brand._id, {
    $inc: { approvedBookings: 1, pendingBookings: -1 },
  });

  // Prepare contact details
  const target = booking.talent || booking.instagramPage;
  const contactDetails = {
    phone: target.phone,
    email: target.email,
  };

  // Send approval email to brand
  emailService.sendApprovalEmail(booking, booking.brand, contactDetails).catch((err) =>
    logger.error('Failed to send approval email', { error: err.message })
  );

  logger.info('Booking approved', {
    bookingId: booking._id,
    approvedBy: req.user._id,
  });

  res.status(200).json({
    success: true,
    message: 'Booking approved. Contact details revealed to brand.',
    data: { booking },
  });
});

/**
 * @route   PUT /api/v1/bookings/:id/reject
 * @desc    Reject booking request (admin only)
 * @access  Private (admin)
 */
export const rejectBooking = asyncHandler(async (req, res) => {
  const { rejectionReason, adminNotes } = req.body;

  const booking = await Booking.findById(req.params.id).populate('brand', 'name email');

  if (!booking) {
    throw new NotFoundError('Booking not found');
  }

  if (booking.status !== 'pending') {
    throw new ConflictError(`Booking is already ${booking.status}`);
  }

  // Update booking
  booking.status = 'rejected';
  booking.reviewedBy = req.user._id;
  booking.reviewedAt = new Date();
  booking.rejectionReason = rejectionReason;
  if (adminNotes) booking.adminNotes = adminNotes;
  await booking.save();

  // Update brand stats
  await Brand.findByIdAndUpdate(booking.brand._id, {
    $inc: { rejectedBookings: 1, pendingBookings: -1 },
  });

  // Send rejection email
  emailService.sendRejectionEmail(booking, booking.brand).catch((err) =>
    logger.error('Failed to send rejection email', { error: err.message })
  );

  logger.info('Booking rejected', {
    bookingId: booking._id,
    rejectedBy: req.user._id,
    reason: rejectionReason,
  });

  res.status(200).json({
    success: true,
    message: 'Booking rejected',
    data: { booking },
  });
});

/**
 * @route   PUT /api/v1/bookings/:id/complete
 * @desc    Mark booking as complete
 * @access  Private (talent/igpage owner)
 */
export const completeBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    throw new NotFoundError('Booking not found');
  }

  // Check authorization
  const isOwner =
    (booking.talent && booking.talent.toString() === req.user._id.toString()) ||
    (booking.instagramPage && booking.instagramPage.toString() === req.user._id.toString());

  if (!isOwner && req.user.role !== 'admin') {
    throw new AuthorizationError('Only the service provider can mark booking as complete');
  }

  if (booking.status !== 'approved') {
    throw new ConflictError('Only approved bookings can be marked as complete');
  }

  booking.status = 'completed';
  booking.completedAt = new Date();
  await booking.save();

  // Update stats
  if (booking.talent) {
    await Talent.findByIdAndUpdate(booking.talent, { $inc: { completedBookings: 1 } });
  } else {
    await InstagramPage.findByIdAndUpdate(booking.instagramPage, { $inc: { completedPromos: 1 } });
  }

  logger.info('Booking completed', { bookingId: booking._id });

  res.status(200).json({
    success: true,
    message: 'Booking marked as complete',
    data: { booking },
  });
});

/**
 * @route   POST /api/v1/bookings/:id/review
 * @desc    Add review/rating to completed booking
 * @access  Private (brand only)
 */
export const addReview = asyncHandler(async (req, res) => {
  const { rating, review } = req.body;

  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    throw new NotFoundError('Booking not found');
  }

  // Only brand can review
  if (booking.brand.toString() !== req.user._id.toString()) {
    throw new AuthorizationError('Only the brand can add a review');
  }

  // Must be completed
  if (booking.status !== 'completed') {
    throw new ValidationError('Only completed bookings can be reviewed');
  }

  // Check if already reviewed
  if (booking.rating) {
    throw new ConflictError('Booking already reviewed');
  }

  booking.rating = rating;
  if (review) booking.review = review;
  await booking.save();

  // Update talent/page rating
  const target = booking.talent || booking.instagramPage;
  const Model = booking.talent ? Talent : InstagramPage;

  await Model.findByIdAndUpdate(target, {
    $inc: { reviewCount: 1 },
  });

  // Recalculate average rating
  const allBookings = await Booking.find({
    [booking.talent ? 'talent' : 'instagramPage']: target,
    rating: { $exists: true },
  });

  const avgRating =
    allBookings.reduce((sum, b) => sum + b.rating, 0) / allBookings.length;

  await Model.findByIdAndUpdate(target, { rating: avgRating });

  logger.info('Review added', { bookingId: booking._id, rating });

  res.status(200).json({
    success: true,
    message: 'Review added successfully',
    data: { booking },
  });
});

export default {
  createTalentBooking,
  createInstagramBooking,
  getBookings,
  getBookingById,
  approveBooking,
  rejectBooking,
  completeBooking,
  addReview,
};
