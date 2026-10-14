import mongoose from 'mongoose';
import User from './User.model.js';

/**
 * Instagram Page Model
 * Extended user model for Instagram page owners
 */

const instagramPageSchema = new mongoose.Schema({
  handle: {
    type: String,
    required: [true, 'Instagram handle is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^@?[a-zA-Z0-9._]+$/, 'Please provide a valid Instagram handle'],
    index: true,
  },
  niche: {
    type: String,
    enum: [
      'Fashion & Lifestyle',
      'Food & Restaurant',
      'Travel & Adventure',
      'Fitness & Health',
      'Beauty & Makeup',
      'Home Decor',
      'Tech & Gadgets',
      'Memes & Entertainment',
      'Business & Finance',
      'Sports',
      'Parenting',
      'Education',
      'Photography',
      'Art & Design',
      'Music',
      'Other'
    ],
    required: [true, 'Niche is required'],
    index: true,
  },
  followers: {
    type: String,
    required: [true, 'Follower count is required'],
    trim: true,
  },
  followerCount: {
    type: Number,
    required: [true, 'Numeric follower count is required'],
    min: [1000, 'Minimum 1,000 followers required'],
    index: true,
  },
  engagementRate: {
    type: String,
    required: [true, 'Engagement rate is required'],
    trim: true,
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true,
    index: true,
  },
  about: {
    type: String,
    maxlength: [1000, 'About section cannot exceed 1000 characters'],
    trim: true,
  },
  // Promotion rates
  postRate: {
    type: Number,
    required: [true, 'Post rate is required'],
    min: [500, 'Post rate must be at least ₹500'],
    max: [1000000, 'Post rate cannot exceed ₹10,00,000'],
  },
  storyRate: {
    type: Number,
    required: [true, 'Story rate is required'],
    min: [300, 'Story rate must be at least ₹300'],
    max: [500000, 'Story rate cannot exceed ₹5,00,000'],
  },
  reelRate: {
    type: Number,
    required: [true, 'Reel rate is required'],
    min: [1000, 'Reel rate must be at least ₹1,000'],
    max: [2000000, 'Reel rate cannot exceed ₹20,00,000'],
  },
  // Analytics
  averageLikes: {
    type: Number,
    default: 0,
  },
  averageComments: {
    type: Number,
    default: 0,
  },
  averageReach: {
    type: Number,
    default: 0,
  },
  // Demographics
  audienceGender: {
    male: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    female: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    other: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  audienceAge: {
    '13-17': { type: Number, default: 0 },
    '18-24': { type: Number, default: 0 },
    '25-34': { type: Number, default: 0 },
    '35-44': { type: Number, default: 0 },
    '45+': { type: Number, default: 0 },
  },
  topCountries: [{
    country: String,
    percentage: Number,
  }],
  topCities: [{
    city: String,
    percentage: Number,
  }],
  availability: {
    type: String,
    enum: ['available', 'busy', 'unavailable'],
    default: 'available',
    index: true,
  },
  // Stats
  profileViews: {
    type: Number,
    default: 0,
  },
  totalPromos: {
    type: Number,
    default: 0,
  },
  completedPromos: {
    type: Number,
    default: 0,
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  reviewCount: {
    type: Number,
    default: 0,
  },
  // Verification
  instagramVerified: {
    type: Boolean,
    default: false,
  },
  verificationDocument: {
    type: String,
  },
}, {
  timestamps: true,
});

// Indexes
instagramPageSchema.index({ niche: 1, city: 1 });
instagramPageSchema.index({ followerCount: -1 });
instagramPageSchema.index({ availability: 1, isVerified: 1 });
instagramPageSchema.index({ postRate: 1, storyRate: 1, reelRate: 1 });
instagramPageSchema.index({ createdAt: -1 });

// Virtual populate for bookings
instagramPageSchema.virtual('bookings', {
  ref: 'Booking',
  localField: '_id',
  foreignField: 'instagramPage',
});

// Method to get follower size category
instagramPageSchema.methods.getFollowerCategory = function() {
  if (this.followerCount < 10000) return 'Nano';
  if (this.followerCount < 50000) return 'Micro';
  if (this.followerCount < 200000) return 'Mid-tier';
  if (this.followerCount < 1000000) return 'Macro';
  return 'Mega';
};

const InstagramPage = User.discriminator('igpage', instagramPageSchema);

export default InstagramPage;
