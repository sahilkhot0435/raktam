const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bloodBank: { type: mongoose.Schema.Types.ObjectId, ref: 'BloodBank', required: true },
  bloodType: { type: String, required: true },
  units: { type: Number, default: 1 },
  donatedAt: { type: Date, default: Date.now },
  certificate: { type: String, default: null },
});

module.exports = mongoose.model('Donation', donationSchema);
