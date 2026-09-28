const mongoose = require('mongoose');

const emergencyRequestSchema = new mongoose.Schema({
  patientName: { type: String, required: true },
  bloodType: {
    type: String,
    required: true,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  },
  unitsRequired: { type: Number, required: true, min: 1 },
  hospital: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  contactName: { type: String, required: true },
  contactPhone: { type: String, required: true },
  urgencyLevel: {
    type: String,
    enum: ['critical', 'urgent', 'normal'],
    default: 'urgent',
  },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number], // [longitude, latitude]
  },
  status: {
    type: String,
    enum: ['active', 'fulfilled', 'cancelled'],
    default: 'active',
  },
  matchedDonors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  matchedBanks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'BloodBank' }],
  requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  createdAt: { type: Date, default: Date.now },
  fulfilledAt: { type: Date, default: null },
});

emergencyRequestSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('EmergencyRequest', emergencyRequestSchema);
