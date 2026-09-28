const mongoose = require('mongoose');

const bloodStockSchema = new mongoose.Schema({
  bloodType: { type: String, required: true, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
  units: { type: Number, default: 0, min: 0 },
  lastUpdated: { type: Date, default: Date.now },
});

const bloodBankSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String },
  phone: { type: String, required: true },
  email: { type: String },
  operatingHours: { type: String, default: '24/7' },
  isVerified: { type: Boolean, default: false },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number], // [longitude, latitude]
  },
  stock: [bloodStockSchema],
  createdAt: { type: Date, default: Date.now },
});

bloodBankSchema.index({ location: '2dsphere' });

// Helper: get status for a blood type
bloodBankSchema.methods.getStockStatus = function (bloodType) {
  const entry = this.stock.find((s) => s.bloodType === bloodType);
  if (!entry || entry.units === 0) return 'unavailable';
  if (entry.units <= 5) return 'critical';
  if (entry.units <= 15) return 'low';
  return 'available';
};

module.exports = mongoose.model('BloodBank', bloodBankSchema);
