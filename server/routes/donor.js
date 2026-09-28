const express = require('express');
const User = require('../models/User');
const Donation = require('../models/Donation');
const { protect } = require('../middleware/auth');

const router = express.Router();

// GET /api/donors - search donors by blood type + city
router.get('/', async (req, res) => {
  try {
    const { bloodType, city, available } = req.query;
    const query = { role: 'donor' };
    if (bloodType) query.bloodType = bloodType;
    if (city) query['location.city'] = { $regex: city, $options: 'i' };
    if (available === 'true') query.isAvailable = true;

    const donors = await User.find(query)
      .select('name bloodType location.city isAvailable lastDonationDate totalDonations')
      .limit(50);
    res.json(donors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/donors/me/dashboard
router.get('/me/dashboard', protect, async (req, res) => {
  try {
    const donations = await Donation.find({ donor: req.user._id })
      .populate('bloodBank', 'name city')
      .sort({ donatedAt: -1 });

    const now = new Date();
    let nextEligibleDate = null;
    if (req.user.lastDonationDate) {
      const next = new Date(req.user.lastDonationDate);
      next.setMonth(next.getMonth() + 3);
      nextEligibleDate = next;
    }

    res.json({
      user: req.user,
      donations,
      totalDonations: req.user.totalDonations,
      isEligible: !req.user.lastDonationDate || new Date(req.user.lastDonationDate) <= new Date(now.setMonth(now.getMonth() - 3)),
      nextEligibleDate,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/donors/me/availability
router.put('/me/availability', protect, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { isAvailable: req.body.isAvailable },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
