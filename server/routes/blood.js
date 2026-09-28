const express = require('express');
const BloodBank = require('../models/BloodBank');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// GET /api/blood/search?bloodType=A+&lat=18.9&lng=72.8&radius=5
// Radius-expanding search: tries 5km -> 10km -> 25km -> 50km -> all city
router.get('/search', async (req, res) => {
  try {
    const { bloodType, lat, lng, city } = req.query;
    if (!bloodType) return res.status(400).json({ message: 'bloodType is required' });

    let results = [];
    let searchRadius = null;

    if (lat && lng) {
      const radii = [5000, 10000, 25000, 50000, 100000]; // meters
      for (const radius of radii) {
        const banks = await BloodBank.find({
          location: {
            $near: {
              $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
              $maxDistance: radius,
            },
          },
          'stock.bloodType': bloodType,
          'stock.units': { $gt: 0 },
        }).limit(20);

        if (banks.length > 0) {
          results = banks;
          searchRadius = radius / 1000; // to km
          break;
        }
      }
    } else if (city) {
      results = await BloodBank.find({
        city: { $regex: city, $options: 'i' },
        'stock.bloodType': bloodType,
        'stock.units': { $gt: 0 },
      });
    } else {
      results = await BloodBank.find({
        'stock.bloodType': bloodType,
        'stock.units': { $gt: 0 },
      }).limit(20);
    }

    const formatted = results.map((bank) => {
      const stockEntry = bank.stock.find((s) => s.bloodType === bloodType);
      const units = stockEntry ? stockEntry.units : 0;
      let status = 'unavailable';
      if (units > 15) status = 'available';
      else if (units > 5) status = 'low';
      else if (units > 0) status = 'critical';

      return {
        _id: bank._id,
        name: bank.name,
        address: bank.address,
        city: bank.city,
        state: bank.state,
        phone: bank.phone,
        operatingHours: bank.operatingHours,
        units,
        status,
        isVerified: bank.isVerified,
        coordinates: bank.location?.coordinates,
      };
    });

    res.json({ results: formatted, searchRadius, totalFound: formatted.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/blood/overview - aggregate stats across all banks
router.get('/overview', async (req, res) => {
  try {
    const banks = await BloodBank.find({});
    const overview = {};
    BLOOD_TYPES.forEach((bt) => (overview[bt] = 0));

    banks.forEach((bank) => {
      bank.stock.forEach((s) => {
        if (overview[s.bloodType] !== undefined) overview[s.bloodType] += s.units;
      });
    });

    res.json({ overview, totalBanks: banks.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/blood/stock/:bankId - admin updates stock
router.put('/stock/:bankId', protect, adminOnly, async (req, res) => {
  try {
    const { stock } = req.body;
    const bank = await BloodBank.findById(req.params.bankId);
    if (!bank) return res.status(404).json({ message: 'Blood bank not found' });

    bank.stock = stock;
    await bank.save();

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`city-${bank.city}`).emit('stock-update', {
      bankId: bank._id,
      bankName: bank.name,
      city: bank.city,
      stock: bank.stock,
    });

    res.json({ message: 'Stock updated', bank });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
