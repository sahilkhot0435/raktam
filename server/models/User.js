const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  bloodType: {
    type: String,
    required: true,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  },
  role: { type: String, enum: ['donor', 'admin'], default: 'donor' },
  location: {
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String },
    coordinates: {
      type: { type: String, default: 'Point' },
      coordinates: [Number], // [longitude, latitude]
    },
  },
  isAvailable: { type: Boolean, default: true },
  lastDonationDate: { type: Date, default: null },
  totalDonations: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

userSchema.index({ 'location.coordinates': '2dsphere' });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Donor is eligible if last donation was > 3 months ago
userSchema.virtual('isEligible').get(function () {
  if (!this.lastDonationDate) return true;
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  return this.lastDonationDate <= threeMonthsAgo;
});

module.exports = mongoose.model('User', userSchema);
