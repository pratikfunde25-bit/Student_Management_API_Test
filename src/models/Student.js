const mongoose = require('mongoose');
const { decrypt, encrypt } = require('../utils/crypto');

const studentSchema = new mongoose.Schema(
  {
    rollNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },
    dateOfBirth: Date,
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
    },
    className: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    section: {
      type: String,
      trim: true,
      uppercase: true,
      index: true,
    },
    guardianName: {
      type: String,
      required: true,
      trim: true,
    },
    guardianPhoneEncrypted: {
      type: String,
      select: false,
    },
    address: {
      line1: String,
      city: String,
      state: String,
      postalCode: String,
      country: {
        type: String,
        default: 'India',
      },
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'graduated'],
      default: 'active',
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt fields
    toJSON: { virtuals: true }, // Ensure virtual fields are included when converting to JSON
    toObject: { virtuals: true },
  }
);

// --- Compound & Text Indexes for Performance ---
// A compound index improves query performance when filtering by multiple specific fields
studentSchema.index({ className: 1, section: 1, status: 1 });
// A text index supports efficient full-text search operations on names and roll numbers
studentSchema.index({ firstName: 'text', lastName: 'text', rollNumber: 'text' });

// --- Virtual Properties ---
// Virtuals are not stored in MongoDB but are computed on the fly

/**
 * Virtual: Full Name (computed from firstName and lastName)
 */
studentSchema.virtual('fullName').get(function fullName() {
  return `${this.firstName} ${this.lastName}`;
});

/**
 * Virtual Getter: Decrypts the guardian's phone number when accessed
 */
studentSchema.virtual('guardianPhone').get(function getGuardianPhone() {
  return decrypt(this.guardianPhoneEncrypted);
});

/**
 * Virtual Setter: Encrypts the guardian's phone number before storing it
 */
studentSchema.virtual('guardianPhone').set(function setGuardianPhone(value) {
  this.guardianPhoneEncrypted = encrypt(value);
});

// --- Mongoose Hooks (Middleware) ---

/**
 * Pre-save Hook: Data Normalization
 * Trims leading/trailing whitespace from names before saving
 */
studentSchema.pre('save', function normalizeNames() {
  this.firstName = this.firstName.trim();
  this.lastName = this.lastName.trim();
});

studentSchema.methods.toJSON = function toJSON() {
  const student = this.toObject({ virtuals: true });
  delete student.guardianPhoneEncrypted;
  delete student.id;
  return student;
};

module.exports = mongoose.model('Student', studentSchema);
