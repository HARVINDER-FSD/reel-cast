import mongoose from 'mongoose';

/**
 * Booking Model
 * Handles booking requests between brands and talent/instagram pages
 */

const bookingSchema = new mongoose.Schema(
  {
    // Brand who made the booking
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Brand is required'],
      index: true,
    },
    // Either talent OR instagram page (one will be null)
    talent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    instagramPage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    // Booking type
    bookingType: {
      type: String,
      enum: ['talent', 'instagram'],
      required: [true, 'Booking type is required'],
      index: true,
    },
    // Project details for talent bookings
    projectType: {
      type: String,
      enum: [
        'Reels / Short Video',
        'Fashion Shoot',
        'Product Commercial',
        'UGC Content',
        'Corporate',
        'Event Coverage',
        'Other'
      ],
    },
    shootDate: {
      type: Date,
    },
    // Promo details for Instagram bookings
    promoType: {
      type: String,
      enum: [
        'Feed Post',
        'Instagram Story',
        'Reel',
        'Story + Reel Combo',
        'Series (3 stories)',
        'IGTV',
        'Carousel Post',
        'Other'
      ],
    },
    goLiveDate: {
      type: Date,
    },
    campaignName: {
      type: String,
      trim: true,
    },
    // Common fields
    message: {
      type: String,
      required: [true, 'Project description is required'],
      maxlength: [2000, 'Message cannot exceed 2000 characters'],
      trim: true,
    },
    budget: {
      type: Number,
      min: [0, 'Budget cannot be negative'],
    },
    // Booking status
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'completed', 'cancelled'],
      default: 'pending',
      index: true,
    },
    // Admin who reviewed (if approved/rejected)
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
      maxlength: [500, 'Rejection reason cannot exceed 500 characters'],
      trim: true,
    },
    // Contact revealed flag
    contactRevealed: {
      type: Boolean,
      default: false,
    },
    // Notes
    adminNotes: {
      type: String,
      maxlength: [1000, 'Admin notes cannot exceed 1000 characters'],
      trim: true,
    },
    brandNotes: {
      type: String,
      maxlength: [1000, 'Brand notes cannot exceed 1000 characters'],
      trim: true,
    },
    // Completion
    completedAt: {
      type: Date,
    },
    // Rating after completion (optional)
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    review: {
      type: String,
      maxlength: [500, 'Review cannot exceed 500 characters'],
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
bookingSchema.index({ brand: 1, status: 1 });
bookingSchema.index({ talent: 1, status: 1 });
bookingSchema.index({ instagramPage: 1, status: 1 });
bookingSchema.index({ bookingType: 1, status: 1 });
bookingSchema.index({ createdAt: -1 });
bookingSchema.index({ status: 1, createdAt: -1 });

// Validation: Either talent OR instagramPage must be set, not both
bookingSchema.pre('validate', function(next) {
  if (!this.talent && !this.instagramPage) {
    next(new Error('Either talent or instagramPage must be specified'));
  } else if (this.talent && this.instagramPage) {
    next(new Error('Cannot specify both talent and instagramPage'));
  } else {
    next();
  }
});

// Validation: booking type must match the populated field
bookingSchema.pre('validate', function(next) {
  if (this.bookingType === 'talent' && !this.talent) {
    next(new Error('Talent booking requires talent field'));
  } else if (this.bookingType === 'instagram' && !this.instagramPage) {
    next(new Error('Instagram booking requires instagramPage field'));
  } else {
    next();
  }
});

// Virtual for target (either talent or instagram page)
bookingSchema.virtual('target').get(function() {
  return this.talent || this.instagramPage;
});

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
