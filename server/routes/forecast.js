const express = require('express');
const HistoricalDemand = require('../models/HistoricalDemand');
const BloodBank = require('../models/BloodBank');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

const VALID_BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const VALID_CONDITIONS = ['Thalassemia', 'Sickle Cell Disease'];

// Centralized configurable risk thresholds (Never hardcoded in multiple places)
const RISK_THRESHOLDS = {
  SHORTAGE_MAX: 0,       // <= 0 units is Shortage Risk
  LOW_RESERVE_MAX: 10,   // 1 to 10 units is Low Reserve
  // > 10 units is Adequate
};

/**
 * Helper to determine risk level based on centralized thresholds
 */
function evaluateRiskLevel(emergencyAvailability) {
  if (emergencyAvailability <= RISK_THRESHOLDS.SHORTAGE_MAX) {
    return {
      level: 'Shortage Risk',
      color: 'red',
      badgeClass: 'bg-red-100 text-red-800 border-red-300',
      description: 'Estimated emergency units are in deficit or zero. Urgent replenishment required.',
    };
  }
  if (emergencyAvailability <= RISK_THRESHOLDS.LOW_RESERVE_MAX) {
    return {
      level: 'Low Reserve',
      color: 'yellow',
      badgeClass: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      description: 'Buffer is tight. Monitor regular transfusion schedules closely.',
    };
  }
  return {
    level: 'Adequate',
    color: 'green',
    badgeClass: 'bg-green-100 text-green-800 border-green-300',
    description: 'Sufficient blood reserve projected for both regular and emergency needs.',
  };
}

// -------------------------------------------------------------
// 1. GET /api/forecast/historical - List historical records
// -------------------------------------------------------------
router.get('/historical', protect, adminOnly, async (req, res) => {
  try {
    const { bloodBank, bloodGroup, condition, isDemo } = req.query;
    const query = {};

    if (bloodBank) query.bloodBank = bloodBank;
    if (bloodGroup && VALID_BLOOD_GROUPS.includes(bloodGroup)) query.bloodGroup = bloodGroup;
    if (condition && VALID_CONDITIONS.includes(condition)) query.condition = condition;
    if (isDemo !== undefined) query.isDemo = isDemo === 'true';

    const records = await HistoricalDemand.find(query)
      .populate('bloodBank', 'name city')
      .sort({ year: -1, month: -1, createdAt: -1 });

    res.json({
      success: true,
      count: records.length,
      records,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// -------------------------------------------------------------
// 2. POST /api/forecast/historical - Add historical record
// -------------------------------------------------------------
router.post('/historical', protect, adminOnly, async (req, res) => {
  try {
    const {
      month,
      year,
      bloodGroup,
      condition,
      regularPatientCount = 0,
      requiredUnits = 0,
      usedUnits = 0,
      remainingUnits = 0,
      emergencyUnitsUsed = 0,
      wastedUnits = 0,
      bloodBank = null,
      notes = '',
      isDemo = false,
    } = req.body;

    // Validation
    const parsedMonth = parseInt(month, 10);
    const parsedYear = parseInt(year, 10);

    if (isNaN(parsedMonth) || parsedMonth < 1 || parsedMonth > 12) {
      return res.status(400).json({ success: false, message: 'Month must be an integer between 1 and 12.' });
    }
    if (isNaN(parsedYear) || parsedYear < 2000 || parsedYear > 2100) {
      return res.status(400).json({ success: false, message: 'Year must be a valid 4-digit year.' });
    }
    if (!VALID_BLOOD_GROUPS.includes(bloodGroup)) {
      return res.status(400).json({ success: false, message: `Invalid blood group. Allowed: ${VALID_BLOOD_GROUPS.join(', ')}` });
    }
    if (!VALID_CONDITIONS.includes(condition)) {
      return res.status(400).json({ success: false, message: `Condition must be either 'Thalassemia' or 'Sickle Cell Disease'.` });
    }

    // Non-negative quantities validation
    const quantities = {
      regularPatientCount: Number(regularPatientCount),
      requiredUnits: Number(requiredUnits),
      usedUnits: Number(usedUnits),
      remainingUnits: Number(remainingUnits),
      emergencyUnitsUsed: Number(emergencyUnitsUsed),
      wastedUnits: Number(wastedUnits),
    };

    for (const [field, val] of Object.entries(quantities)) {
      if (isNaN(val) || val < 0) {
        return res.status(400).json({ success: false, message: `${field} cannot be negative or invalid.` });
      }
    }

    const record = await HistoricalDemand.create({
      month: parsedMonth,
      year: parsedYear,
      bloodGroup,
      condition,
      ...quantities,
      bloodBank: bloodBank || null,
      notes,
      isDemo: Boolean(isDemo),
    });

    res.status(201).json({
      success: true,
      message: 'Historical demand entry recorded successfully.',
      record,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// -------------------------------------------------------------
// 3. PUT /api/forecast/historical/:id - Update historical record
// -------------------------------------------------------------
router.put('/historical/:id', protect, adminOnly, async (req, res) => {
  try {
    const updateData = { ...req.body };

    // Validate non-negative quantities if provided
    const numericFields = ['regularPatientCount', 'requiredUnits', 'usedUnits', 'remainingUnits', 'emergencyUnitsUsed', 'wastedUnits'];
    for (const field of numericFields) {
      if (updateData[field] !== undefined) {
        const val = Number(updateData[field]);
        if (isNaN(val) || val < 0) {
          return res.status(400).json({ success: false, message: `${field} cannot be negative.` });
        }
        updateData[field] = val;
      }
    }

    if (updateData.bloodGroup && !VALID_BLOOD_GROUPS.includes(updateData.bloodGroup)) {
      return res.status(400).json({ success: false, message: 'Invalid blood group.' });
    }
    if (updateData.condition && !VALID_CONDITIONS.includes(updateData.condition)) {
      return res.status(400).json({ success: false, message: 'Invalid condition.' });
    }

    const updated = await HistoricalDemand.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Historical record not found.' });
    }

    res.json({
      success: true,
      message: 'Historical record updated.',
      record: updated,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// -------------------------------------------------------------
// 4. DELETE /api/forecast/historical/:id - Delete record
// -------------------------------------------------------------
router.delete('/historical/:id', protect, adminOnly, async (req, res) => {
  try {
    const deleted = await HistoricalDemand.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Historical record not found.' });
    }
    res.json({ success: true, message: 'Historical record removed successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// -------------------------------------------------------------
// 5. GET /api/forecast/predict - Generate forecast & availability
// -------------------------------------------------------------
router.get('/predict', protect, adminOnly, async (req, res) => {
  try {
    const { bloodGroup, bloodBank, condition, reservedStock = 5 } = req.query;

    if (!bloodGroup || !VALID_BLOOD_GROUPS.includes(bloodGroup)) {
      return res.status(400).json({
        success: false,
        message: `Please specify a valid bloodGroup (${VALID_BLOOD_GROUPS.join(', ')}).`,
      });
    }

    const reserved = Math.max(0, Number(reservedStock) || 0);

    // Build filter for historical demand records
    const historyFilter = { bloodGroup };
    if (bloodBank) {
      historyFilter.$or = [{ bloodBank: bloodBank }, { bloodBank: null }];
    }
    if (condition && VALID_CONDITIONS.includes(condition)) {
      historyFilter.condition = condition;
    }

    // Retrieve historical records
    const records = await HistoricalDemand.find(historyFilter).sort({ year: 1, month: 1 });

    // Aggregate monthly demand points (combines Thalassemia + Sickle Cell Disease if condition is not filtered)
    const monthlyMap = new Map();
    records.forEach((rec) => {
      const key = `${rec.year}-${String(rec.month).padStart(2, '0')}`;
      if (!monthlyMap.has(key)) {
        monthlyMap.set(key, {
          key,
          year: rec.year,
          month: rec.month,
          requiredUnits: 0,
          usedUnits: 0,
          regularPatientCount: 0,
          emergencyUnitsUsed: 0,
          wastedUnits: 0,
          recordsCount: 0,
          isDemo: rec.isDemo,
        });
      }
      const entry = monthlyMap.get(key);
      entry.requiredUnits += rec.requiredUnits;
      entry.usedUnits += rec.usedUnits;
      entry.regularPatientCount += rec.regularPatientCount;
      entry.emergencyUnitsUsed += rec.emergencyUnitsUsed;
      entry.wastedUnits += rec.wastedUnits;
      entry.recordsCount += 1;
      if (!rec.isDemo) entry.isDemo = false; // if any real data exists for that month, mark false
    });

    const monthlySeries = Array.from(monthlyMap.values()).sort((a, b) => a.key.localeCompare(b.key));
    const dataPointsCount = monthlySeries.length;

    // Fetch current usable stock
    let currentUsableStock = 0;
    let bankName = 'All Combined Blood Banks';

    if (bloodBank) {
      const bank = await BloodBank.findById(bloodBank);
      if (bank) {
        bankName = bank.name;
        const stockEntry = bank.stock?.find((s) => s.bloodType === bloodGroup);
        currentUsableStock = stockEntry ? stockEntry.units : 0;
      }
    } else {
      // Aggregate across all banks
      const banks = await BloodBank.find({});
      banks.forEach((b) => {
        const s = b.stock?.find((item) => item.bloodType === bloodGroup);
        if (s) currentUsableStock += s.units;
      });
    }

    // Case 1: Insufficient historical data
    if (dataPointsCount === 0) {
      return res.json({
        success: true,
        canForecast: false,
        status: 'insufficient_data',
        message: 'Insufficient historical data for reliable forecasting.',
        bloodGroup,
        bankName,
        currentUsableStock,
        reservedStock: reserved,
        historicalSeries: [],
        disclaimer: 'This is an ESTIMATE for planning. Do not present it as guaranteed emergency availability.',
      });
    }

    // Case 2: Forecasting using explainable Weighted Moving Average (WMA)
    // We prioritize the most recent 3 months with weights 3, 2, 1
    let predictedRegularRequirement = 0;
    let methodUsed = '';
    let weightsUsed = [];

    const recentMonths = monthlySeries.slice(-3); // up to 3 latest months

    if (recentMonths.length === 3) {
      const [m1, m2, m3] = recentMonths; // m1 oldest of the 3, m3 most recent
      // Weights: m1 (weight 1), m2 (weight 2), m3 (weight 3)
      predictedRegularRequirement = Math.round((m1.usedUnits * 1 + m2.usedUnits * 2 + m3.usedUnits * 3) / 6);
      methodUsed = '3-Month Weighted Moving Average (weights: 3x recent, 2x prev, 1x earlier)';
      weightsUsed = [1, 2, 3];
    } else if (recentMonths.length === 2) {
      const [m1, m2] = recentMonths;
      predictedRegularRequirement = Math.round((m1.usedUnits * 1 + m2.usedUnits * 2) / 3);
      methodUsed = '2-Month Weighted Moving Average (weights: 2x recent, 1x prev)';
      weightsUsed = [1, 2];
    } else {
      // 1 month available
      predictedRegularRequirement = Math.round(recentMonths[0].usedUnits);
      methodUsed = 'Single Month Historical Baseline';
      weightsUsed = [1];
    }

    // Calculate Estimated Emergency Availability:
    // Estimated Emergency Availability = Current Usable Stock - Predicted Regular Requirement - Reserved Stock
    const estimatedEmergencyAvailability = currentUsableStock - predictedRegularRequirement - reserved;

    // Evaluate Risk Level
    const risk = evaluateRiskLevel(estimatedEmergencyAvailability);

    // Calculate trend between last two months
    let trend = 'stable';
    if (monthlySeries.length >= 2) {
      const last = monthlySeries[monthlySeries.length - 1].usedUnits;
      const prev = monthlySeries[monthlySeries.length - 2].usedUnits;
      if (last > prev) trend = 'increasing';
      else if (last < prev) trend = 'decreasing';
    }

    res.json({
      success: true,
      canForecast: true,
      status: 'forecast_generated',
      bloodGroup,
      condition: condition || 'All Target Groups (Thalassemia & Sickle Cell)',
      bankName,
      currentUsableStock,
      predictedRegularRequirement,
      reservedStock: reserved,
      estimatedEmergencyAvailability,
      riskLevel: risk.level,
      riskDetails: risk,
      trend,
      methodUsed,
      dataPointsCount,
      historicalSeries: monthlySeries.map((s) => ({
        monthKey: s.key,
        year: s.year,
        month: s.month,
        usedUnits: s.usedUnits,
        requiredUnits: s.requiredUnits,
        regularPatientCount: s.regularPatientCount,
        emergencyUnitsUsed: s.emergencyUnitsUsed,
        isDemo: s.isDemo,
      })),
      lastUpdated: new Date().toISOString(),
      disclaimer: 'This is an ESTIMATE for planning. Do not present it as guaranteed emergency availability.',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// -------------------------------------------------------------
// 6. POST /api/forecast/seed-demo - Populate sample demo data
// -------------------------------------------------------------
router.post('/seed-demo', protect, adminOnly, async (req, res) => {
  try {
    const { bloodBankId = null } = req.body;

    // Check if demo data already exists
    const existingDemoCount = await HistoricalDemand.countDocuments({ isDemo: true });
    if (existingDemoCount > 0) {
      return res.json({
        success: true,
        message: `Demo data already loaded (${existingDemoCount} sample records present).`,
        count: existingDemoCount,
      });
    }

    // Clearly labelled sample demo data for Thalassemia & Sickle Cell Disease
    // Spans 4 consecutive recent months (June, July, August, September 2026)
    const demoEntries = [
      // O+ Thalassemia
      { month: 6, year: 2026, bloodGroup: 'O+', condition: 'Thalassemia', regularPatientCount: 18, requiredUnits: 38, usedUnits: 38, remainingUnits: 2, emergencyUnitsUsed: 4, wastedUnits: 0, isDemo: true, notes: 'DEMO SAMPLE: Regular transfusions June' },
      { month: 7, year: 2026, bloodGroup: 'O+', condition: 'Thalassemia', regularPatientCount: 19, requiredUnits: 40, usedUnits: 40, remainingUnits: 3, emergencyUnitsUsed: 5, wastedUnits: 1, isDemo: true, notes: 'DEMO SAMPLE: Regular transfusions July' },
      { month: 8, year: 2026, bloodGroup: 'O+', condition: 'Thalassemia', regularPatientCount: 20, requiredUnits: 42, usedUnits: 42, remainingUnits: 1, emergencyUnitsUsed: 6, wastedUnits: 0, isDemo: true, notes: 'DEMO SAMPLE: Regular transfusions August' },
      { month: 9, year: 2026, bloodGroup: 'O+', condition: 'Thalassemia', regularPatientCount: 20, requiredUnits: 41, usedUnits: 41, remainingUnits: 4, emergencyUnitsUsed: 3, wastedUnits: 0, isDemo: true, notes: 'DEMO SAMPLE: Regular transfusions September' },

      // O+ Sickle Cell Disease
      { month: 6, year: 2026, bloodGroup: 'O+', condition: 'Sickle Cell Disease', regularPatientCount: 8, requiredUnits: 14, usedUnits: 14, remainingUnits: 1, emergencyUnitsUsed: 2, wastedUnits: 0, isDemo: true, notes: 'DEMO SAMPLE: Sickle cell pain crisis transfusions June' },
      { month: 7, year: 2026, bloodGroup: 'O+', condition: 'Sickle Cell Disease', regularPatientCount: 9, requiredUnits: 16, usedUnits: 15, remainingUnits: 2, emergencyUnitsUsed: 3, wastedUnits: 0, isDemo: true, notes: 'DEMO SAMPLE: Regular transfusions July' },
      { month: 8, year: 2026, bloodGroup: 'O+', condition: 'Sickle Cell Disease', regularPatientCount: 9, requiredUnits: 17, usedUnits: 16, remainingUnits: 1, emergencyUnitsUsed: 4, wastedUnits: 0, isDemo: true, notes: 'DEMO SAMPLE: Regular transfusions August' },
      { month: 9, year: 2026, bloodGroup: 'O+', condition: 'Sickle Cell Disease', regularPatientCount: 10, requiredUnits: 18, usedUnits: 17, remainingUnits: 2, emergencyUnitsUsed: 2, wastedUnits: 0, isDemo: true, notes: 'DEMO SAMPLE: Regular transfusions September' },

      // B+ Thalassemia
      { month: 6, year: 2026, bloodGroup: 'B+', condition: 'Thalassemia', regularPatientCount: 14, requiredUnits: 28, usedUnits: 28, remainingUnits: 2, emergencyUnitsUsed: 3, wastedUnits: 0, isDemo: true, notes: 'DEMO SAMPLE: June' },
      { month: 7, year: 2026, bloodGroup: 'B+', condition: 'Thalassemia', regularPatientCount: 15, requiredUnits: 30, usedUnits: 30, remainingUnits: 1, emergencyUnitsUsed: 4, wastedUnits: 0, isDemo: true, notes: 'DEMO SAMPLE: July' },
      { month: 8, year: 2026, bloodGroup: 'B+', condition: 'Thalassemia', regularPatientCount: 15, requiredUnits: 32, usedUnits: 31, remainingUnits: 2, emergencyUnitsUsed: 3, wastedUnits: 0, isDemo: true, notes: 'DEMO SAMPLE: August' },
      { month: 9, year: 2026, bloodGroup: 'B+', condition: 'Thalassemia', regularPatientCount: 16, requiredUnits: 33, usedUnits: 33, remainingUnits: 3, emergencyUnitsUsed: 5, wastedUnits: 1, isDemo: true, notes: 'DEMO SAMPLE: September' },

      // A+ Thalassemia
      { month: 6, year: 2026, bloodGroup: 'A+', condition: 'Thalassemia', regularPatientCount: 10, requiredUnits: 20, usedUnits: 20, remainingUnits: 1, emergencyUnitsUsed: 2, wastedUnits: 0, isDemo: true, notes: 'DEMO SAMPLE: June' },
      { month: 7, year: 2026, bloodGroup: 'A+', condition: 'Thalassemia', regularPatientCount: 11, requiredUnits: 22, usedUnits: 22, remainingUnits: 2, emergencyUnitsUsed: 3, wastedUnits: 0, isDemo: true, notes: 'DEMO SAMPLE: July' },
      { month: 8, year: 2026, bloodGroup: 'A+', condition: 'Thalassemia', regularPatientCount: 12, requiredUnits: 24, usedUnits: 23, remainingUnits: 1, emergencyUnitsUsed: 2, wastedUnits: 0, isDemo: true, notes: 'DEMO SAMPLE: August' },
      { month: 9, year: 2026, bloodGroup: 'A+', condition: 'Thalassemia', regularPatientCount: 12, requiredUnits: 25, usedUnits: 25, remainingUnits: 2, emergencyUnitsUsed: 4, wastedUnits: 0, isDemo: true, notes: 'DEMO SAMPLE: September' },
    ];

    if (bloodBankId) {
      demoEntries.forEach((e) => (e.bloodBank = bloodBankId));
    }

    const inserted = await HistoricalDemand.insertMany(demoEntries);

    res.status(201).json({
      success: true,
      message: `Successfully loaded ${inserted.length} clearly labelled sample demo records for testing.`,
      count: inserted.length,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// -------------------------------------------------------------
// 7. DELETE /api/forecast/clear-demo - Clear only demo records
// -------------------------------------------------------------
router.delete('/clear-demo', protect, adminOnly, async (req, res) => {
  try {
    const result = await HistoricalDemand.deleteMany({ isDemo: true });
    res.json({
      success: true,
      message: `Removed ${result.deletedCount} demo records. Real data remains untouched.`,
      deletedCount: result.deletedCount,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
