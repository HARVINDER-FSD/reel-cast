import mongoose from 'mongoose';
import User from './User.model.js';

/**
 * Talent Model
 * Extended user model for talent (models, creators, influencers, etc.)
 */

const talentSchema = new mongoose.Schema({
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true,
    index: true,
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: [true, 'Gender is required'],
  },
  category: {
    type: String,
    enum: [
      'Model',
      'Influencer',
      'UGC Creator',
      'Child Artist',
      'Photographer',
      'Videographer',
      'Fitness & Sports',
      'Fashion & Styling',
      'Food Creator',
      'Brand Ambassador',
      'Other'
    ],
    required: [true, 'Category is required'],
    index: true,
  },
  rate: {
    type: Number,
    required: [true, 'Rate is required'],
    min: [500, 'Rate must be at least ₹500'],
    max: [1000000, 'Rate cannot exceed ₹10,00,000'],
  },
  experience: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Experienced', 'Professional'],
    default: 'Beginner',
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters'],
    trim: true,
  },
  portfolio: [{
    type: String, // URLs to portfolio items
  }],
  skills: [{
    type: String,
    trim: true,
  }],
  languages: [{
    type: String,
    trim: true,
  }],
  availability: {
    type: String,
    enum: ['available', 'busy', 'unavailable'],
    default: 'available',
    index: true,
  },
  socialMedia: {
    instagram: {
      type: String,
      trim: true,
    },
    youtube: {
      type: String,
      trim: true,
    },
    twitter: {
      type: String,
      trim: true,
    },
  },
  // Stats
  profileViews: {
    type: Number,
    default: 0,
  },
  totalBookings: {
    type: Number,
    default: 0,
  },
  completedBookings: {
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
}, {
  timestamps: true,
});

// Indexes
talentSchema.index({ category: 1, city: 1 });
talentSchema.index({ rate: 1 });
talentSchema.index({ availability: 1, isVerified: 1 });
talentSchema.index({ createdAt: -1 });

// Virtual populate for bookings
talentSchema.virtual('bookings', {
  ref: 'Booking',
  localField: '_id',
  foreignField: 'talent',
});

const Talent = User.discriminator('talent', talentSchema);

export default Talent;
