const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const ROLES = require('../constants/roles');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true, // Database Indexing for faster email lookups
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false, // Security: Prevents password from being returned in queries by default
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.STUDENT,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    passwordChangedAt: Date,
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

/**
 * Pre-save Hook: Runs before saving a document to the database.
 * Used here for Data Security: Hashing the password using bcrypt.
 */
userSchema.pre('save', async function hashPassword() {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return;

  // Hash the password with a cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // If this is an existing user changing their password, update the timestamp
  if (!this.isNew) {
    this.passwordChangedAt = new Date(Date.now() - 1000);
  }
});

/**
 * Instance Method: Compare a candidate password against the user's hashed password.
 * @param {string} candidatePassword - The plain text password
 * @returns {Promise<boolean>} True if passwords match
 */
userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

/**
 * Instance Method: Check if the user changed their password after the JWT token was issued.
 * Helps prevent stolen tokens from being used if the user changes their password.
 * @param {number} jwtIssuedAt - Token issue timestamp in seconds
 * @returns {boolean} True if password was changed after token issuance
 */
userSchema.methods.passwordChangedAfter = function passwordChangedAfter(jwtIssuedAt) {
  if (!this.passwordChangedAt) return false;

  const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
  return jwtIssuedAt < changedTimestamp;
};

module.exports = mongoose.model('User', userSchema);
