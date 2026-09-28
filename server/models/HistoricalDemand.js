const mongoose = require('mongoose');

const historicalDemandSchema = new mongoose.Schema({
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12,
  },
  year: {
    type: Number,
    required: true,
    min: 2000,
    max: 2100,
  },
  bloodGroup: {
    type: String,
    required: true,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  },
  condition: {
    type: String,
    required: true,
    enum: ['Thalassemia', 'Sickle Cell Disease'],
  },
  regularPatientCount: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  requiredUnits: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  usedUnits: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  remainingUnits: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  emergencyUnitsUsed: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  wastedUnits: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  bloodBank: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BloodBank',
    default: null,
  },
  isDemo: {
    type: Boolean,
    default: false,
  },
  notes: {
    type: String,
    trim: true,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for fast query of historical trends
historicalDemandSchema.index({ bloodBank: 1, bloodGroup: 1, condition: 1, year: 1, month: 1 });

module.exports = mongoose.model('HistoricalDemand', historicalDemandSchema);
