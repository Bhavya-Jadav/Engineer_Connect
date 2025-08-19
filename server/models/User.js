// server/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  // Password is optional for Google-auth users
  password: {
    type: String,
    required: function () { return this.authMethod !== 'google'; },
    minlength: function () { return this.authMethod !== 'google' ? 3 : undefined; }
  },
  role: {
    type: String,
    required: true,
    enum: ['student', 'admin', 'company'],
    default: 'student'
  },
  university: {
    type: String,
    required: function () { return this.role === 'student' && this.authMethod !== 'google'; }
  },
  // Extended profile fields
  name: { type: String, trim: true },
  email: { type: String, trim: true, lowercase: true },
  bio: { type: String, maxlength: 500 },
  phone: { type: String, trim: true },
  course: { type: String, trim: true },
  year: { type: String, trim: true },
  skills: [{ type: String, trim: true }],
  profilePicture: { type: String, default: null },
  // Company-specific optional field
  companyName: { type: String, trim: true },
  // Google OAuth fields
  googleId: { type: String, index: true },
  googleEmail: { type: String },
  googleName: { type: String },
  googlePicture: { type: String },
  // Auth method
  authMethod: { type: String, enum: ['local', 'google'], default: 'local' },
  // Settings
  emailNotifications: { type: Boolean, default: true },
  profileVisibility: { type: Boolean, default: true },
  darkMode: { type: Boolean, default: false }
}, { timestamps: true });

// Hash password before saving (only if provided/modified)
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare passwords (guard for users without local password)
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);