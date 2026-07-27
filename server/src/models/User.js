const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, 'Invalid email format'],
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    name: {
      type: String,
      trim: true,
      default: '',
    },
    role: {
      type: String,
      enum: ['student', 'teacher'],
      default: 'student',
    },
    progress: {
      type: Map,
      of: Number,
      default: {},
    },
    totalSessions: {
      type: Number,
      default: 0,
    },
    totalMasteryPoints: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  next();
});

userSchema.methods.comparePassword = function (plainPassword) {
  return bcrypt.compare(plainPassword, this.passwordHash);
};

userSchema.methods.toPublicJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.__v;
  if (this.progress instanceof Map) {
    obj.progress = Object.fromEntries(this.progress);
  } else if (obj.progress && typeof obj.progress === 'object') {
    obj.progress = { ...obj.progress };
  }
  return obj;
};

module.exports = mongoose.model('User', userSchema);
