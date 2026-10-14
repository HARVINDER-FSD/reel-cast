import mongoose from 'mongoose';
import User from './User.model.js';

/**
 * Brand Model
 * Extended user model for brands and agencies
 */

const brandSchema = new mongoose.Schema({
  brandName: {
    type: String,
    required: [true, 'Brand name is required'],
    trim: true,
    minlength: [2, 'Brand name must be at least 2 characters'],
    maxlength: [100, 'Brand name cannot exceed 100 characters'],
  },
  companyType: {
    type: String,
    enum: ['Brand', 'Agency', 'Startup', 'Enterprise', 'Individual'],
    default: 'Brand',
  },
  industry: {
    type: String,
    trim: true,
  },
  website: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters'],
    trim: true,
  },
  // Subscription plan
  plan: {
    type: String,
    enum: ['starter', 'growth', 'pro'],
    required: [true, 'Subscription plan is required'],
    default: 'starter',
    index: true,
  },
  planStartDate: {
    type: Date,
    default: Date.now,
  },
  planEndDate: {
    type: Date,
    required: true,
  },
  // Request limits based on plan
  requestsLimit: {
    type: Number,
    default: 5, // starter: 5, growth: 20, pro: unlimited(-1)
  },
  requestsUsed: {
    type: Number,
    default: 0,
  },
  // Billing
  billingAddress: {
    street: String,
    city: String,
    state: String,
    country: { type: String, default: 'India' },
    pincode: String,
  },
  gstNumber: {
    type: String,
    trim: true,
  },
  // Stats
  totalBookings: {
    type: Number,
    default: 0,
  },
  approvedBookings: {
    type: Number,
    default: 0,
  },
  rejectedBookings: {
    type: Number,
    default: 0,
  },
  pendingBookings: {
    type: Number,
    default: 0,
  },
  totalSpent: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Indexes
brandSchema.index({ plan: 1 });
brandSchema.index({ planEndDate: 1 });
brandSchema.index({ createdAt: -1 });

// Virtual populate for bookings
brandSchema.virtual('bookings', {
  ref: 'Booking',
  localField: '_id',
  foreignField: 'brand',
});

// Method to check if plan is active
brandSchema.methods.isPlanActive = function() {
  return this.planEndDate && this.planEndDate > Date.now();
};

// Method to check if requests available
brandSchema.methods.hasRequestsAvailable = function() {
  if (this.plan === 'pro') return true; // unlimited
  return this.requestsUsed < this.requestsLimit;
};

// Method to get requests remaining
brandSchema.methods.getRequestsRemaining = function() {
  if (this.plan === 'pro') return 'Unlimited';
  return Math.max(0, this.requestsLimit - this.requestsUsed);
};

// Set plan limits based on plan type
brandSchema.pre('save', function(next) {
  if (this.isModified('plan')) {
    switch (this.plan) {
      case 'starter':
        this.requestsLimit = 5;
        break;
      case 'growth':
        this.requestsLimit = 20;
        break;
      case 'pro':
        this.requestsLimit = -1; // unlimited
        break;
    }
    
    // Set plan end date (30 days from start)
    if (this.isNew || !this.planEndDate) {
      this.planEndDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }
  }
  next();
});

const Brand = User.discriminator('brand', brandSchema);

export default Brand;
