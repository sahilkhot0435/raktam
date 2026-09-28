const express = require('express');
const BloodBank = require('../models/BloodBank');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// GET /api/banks - list blood banks
router.get('/', async (req, res) => {
  try {
    const { city, state } = req.query;
    const query = {};
    if (city) query.city = { $regex: city, $options: 'i' };
    if (state) query.state = { $regex: state, $options: 'i' };

    const banks = await BloodBank.find(query).sort({ isVerified: -1, name: 1 });
    res.json(banks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/banks/:id
router.get('/:id', async (req, res) => {
  try {
    const bank = await BloodBank.findById(req.params.id);
    if (!bank) return res.status(404).json({ message: 'Bank not found' });
    res.json(bank);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/banks - admin adds blood bank
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const bank = await BloodBank.create(req.body);
    res.status(201).json(bank);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/banks/:id - admin updates blood bank details
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const bank = await BloodBank.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!bank) return res.status(404).json({ message: 'Bank not found' });
    res.json({ message: 'Blood bank updated successfully', bank });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
