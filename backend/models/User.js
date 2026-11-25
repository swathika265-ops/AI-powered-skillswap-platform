const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name must not exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Don't include password in queries by default
    },
    role: {
      type: String,
      enum: ['learner', 'mentor', 'admin'],
      default: 'learner',
    },
    status: {
      type: String,
      enum: ['active', 'suspended', 'banned', 'inactive'],
      default: 'active',
    },
    profileImage: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      maxlength: [1000, 'Bio must not exceed 1000 characters'],
      default: '',
    },
    education: {
      type: String,
      maxlength: [500, 'Education must not exceed 500 characters'],
      default: '',
    },
    languages: [
      {
        type: String,
        trim: true,
      },
    ],
    learningPreferences: {
      preferredSessionDuration: {
        type: Number,
        default: 60, // minutes
      },
      preferredTimes: [String],
      timezone: {
        type: String,
        default: 'UTC',
      },
    },
    creditBalance: {
      type: Number,
      default: 3, // New users get 3 starter credits
      min: 0,
    },
    totalCreditsEarned: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalCreditsSpent: {
      type: Number,
      default: 0,
      min: 0,
    },
    reputationScore: {
      type: Number,
      default: 50, // Start with neutral reputation (0-100 scale)
      min: 0,
      max: 100,
    },
    completedSessions: {
      type: Number,
      default: 0,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalRatings: {
      type: Number,
      default: 0,
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // createdAt and updatedAt
  }
);

// Index for efficient queries
userSchema.index({ role: 1, status: 1 });
userSchema.index({ 'languages': 1 });

// Hash password before saving
userSchema.pre('save', async function () {
  // Only hash if password is modified
  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove sensitive fields from JSON output
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
