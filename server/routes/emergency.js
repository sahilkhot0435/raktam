const express = require('express');
const EmergencyRequest = require('../models/EmergencyRequest');
const User = require('../models/User');
const BloodBank = require('../models/BloodBank');

const router = express.Router();

// POST /api/emergency - submit an emergency request
router.post('/', async (req, res) => {
  try {
    const {
      patientName, bloodType, unitsRequired, hospital,
      city, state, contactName, contactPhone, urgencyLevel, lat, lng,
    } = req.body;

    const emergencyReq = await EmergencyRequest.create({
      patientName,
      bloodType,
      unitsRequired: unitsRequired || 1,
      hospital,
      city,
      state,
      contactName,
      contactPhone,
      urgencyLevel: urgencyLevel || 'urgent',
      location: lat && lng ? { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] } : undefined,
    });

    // Smart radius-based donor matching
    let matchedDonors = [];
    let searchRadius = 0;

    if (lat && lng) {
      const radii = [5000, 10000, 25000, 50000, 100000]; // meters
      for (const radius of radii) {
        matchedDonors = await User.find({
          bloodType,
          isAvailable: true,
          location: {
            $near: {
              $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
              $maxDistance: radius,
            },
          },
        }).limit(20).select('name phone bloodType location.city');

        if (matchedDonors.length >= 3 || radius === 100000) {
          searchRadius = radius / 1000;
          break;
        }
      }
    } else {
      // fallback: city-based search
      matchedDonors = await User.find({ bloodType, isAvailable: true, 'location.city': { $regex: city, $options: 'i' } }).limit(20);
      searchRadius = null;
    }

    // Also find nearby blood banks with stock
    let matchedBanks = [];
    if (lat && lng) {
      matchedBanks = await BloodBank.find({
        location: {
          $near: {
            $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
            $maxDistance: 50000,
          },
        },
        'stock': { $elemMatch: { bloodType, units: { $gt: 0 } } },
      }).limit(5);
    }

    // Update request with matched donors/banks
    emergencyReq.matchedDonors = matchedDonors.map((d) => d._id);
    emergencyReq.matchedBanks = matchedBanks.map((b) => b._id);
    await emergencyReq.save();

    // Real-time broadcast
    const io = req.app.get('io');
    io.to(`city-${city}`).emit('emergency-request', {
      requestId: emergencyReq._id,
      bloodType,
      hospital,
      city,
      urgencyLevel,
      contactPhone,
    });

    res.status(201).json({
      request: emergencyReq,
      matchedDonors: matchedDonors.map((d) => ({
        name: d.name,
        phone: d.phone,
        bloodType: d.bloodType,
        city: d.location?.city,
      })),
      matchedBanks: matchedBanks.map((b) => ({
        name: b.name,
        phone: b.phone,
        address: b.address,
        city: b.city,
      })),
      searchRadius,
      totalDonorsFound: matchedDonors.length,
      totalBanksFound: matchedBanks.length,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/emergency - get active requests
router.get('/', async (req, res) => {
  try {
    const requests = await EmergencyRequest.find({ status: 'active' })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/emergency/:id/status
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const request = await EmergencyRequest.findByIdAndUpdate(
      req.params.id,
      { status, fulfilledAt: status === 'fulfilled' ? new Date() : null },
      { new: true }
    );
    res.json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
