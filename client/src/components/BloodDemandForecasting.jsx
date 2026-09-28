import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  TrendingUp,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  PlusCircle,
  Trash2,
  RefreshCw,
  Info,
  Calendar,
  Layers,
  Database,
  CheckCircle2,
  X,
  HelpCircle,
} from 'lucide-react';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const CONDITIONS = ['Thalassemia', 'Sickle Cell Disease'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function BloodDemandForecasting({ selectedBank, allBanks }) {
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [condition, setCondition] = useState(''); // '' means combined
  const [reservedStock, setReservedStock] = useState(5);
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Historical data management state
  const [records, setRecords] = useState([]);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    bloodGroup: 'O+',
    condition: 'Thalassemia',
    regularPatientCount: 15,
    requiredUnits: 30,
    usedUnits: 30,
    remainingUnits: 2,
    emergencyUnitsUsed: 4,
    wastedUnits: 0,
    notes: '',
  });

  // Fetch forecast whenever parameters change
  useEffect(() => {
    fetchForecast();
    fetchHistoricalRecords();
  }, [bloodGroup, selectedBank?._id, condition, reservedStock]);

  const fetchForecast = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        bloodGroup,
        reservedStock,
      };
      if (selectedBank?._id) params.bloodBank = selectedBank._id;
      if (condition) params.condition = condition;

      const res = await axios.get('/api/forecast/predict', { params });
      if (res.data.success) {
        setForecastData(res.data);
      } else {
        setError(res.data.message || 'Failed to calculate forecast.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error communicating with forecasting service.');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistoricalRecords = async () => {
    setRecordsLoading(true);
    try {
      const params = { bloodGroup };
      if (selectedBank?._id) params.bloodBank = selectedBank._id;
      if (condition) params.condition = condition;

      const res = await axios.get('/api/forecast/historical', { params });
      if (res.data.success) {
        setRecords(res.data.records);
      }
    } catch {
      // Non-blocking
    } finally {
      setRecordsLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: ['month', 'year', 'regularPatientCount', 'requiredUnits', 'usedUnits', 'remainingUnits', 'emergencyUnitsUsed', 'wastedUnits'].includes(name)
        ? Math.max(0, parseInt(value, 10) || 0)
        : value,
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setActionMessage('');
    try {
      const payload = {
        ...formData,
        bloodBank: selectedBank?._id || null,
      };

      const res = await axios.post('/api/forecast/historical', payload);
      if (res.data.success) {
        setActionMessage('✅ Historical demand entry recorded successfully.');
        setShowEntryModal(false);
        fetchForecast();
        fetchHistoricalRecords();
        setTimeout(() => setActionMessage(''), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save historical entry.');
    }
  };

  const handleDeleteRecord = async (id) => {
    if (!window.confirm('Delete this historical entry?')) return;
    try {
      const res = await axios.delete(`/api/forecast/historical/${id}`);
      if (res.data.success) {
        setActionMessage('Historical entry removed.');
        fetchForecast();
        fetchHistoricalRecords();
        setTimeout(() => setActionMessage(''), 3000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete record.');
    }
  };

  const handleSeedDemoData = async () => {
    try {
      const res = await axios.post('/api/forecast/seed-demo', {
        bloodBankId: selectedBank?._id || null,
      });
      if (res.data.success) {
        setActionMessage(`✅ ${res.data.message}`);
        fetchForecast();
        fetchHistoricalRecords();
        setTimeout(() => setActionMessage(''), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to seed demo data.');
    }
  };

  const handleClearDemoData = async () => {
    if (!window.confirm('Clear all sample demo records? Real data will NOT be deleted.')) return;
    try {
      const res = await axios.delete('/api/forecast/clear-demo');
      if (res.data.success) {
        setActionMessage(`Cleared ${res.data.deletedCount} demo records.`);
        fetchForecast();
        fetchHistoricalRecords();
        setTimeout(() => setActionMessage(''), 3000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to clear demo data.');
    }
  };

  return (
    <div className="card mt-8 border-2 border-red-100 shadow-md">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-gray-100 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-raktam-red animate-pulse" />
            <h2 className="text-xl font-black text-gray-900">
              Blood Demand Forecasting & Emergency Availability
            </h2>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Predict recurring transfusion demand (Thalassemia & Sickle Cell Disease) & estimate emergency reserves
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowEntryModal(true)}
            className="inline-flex items-center gap-1.5 bg-raktam-red hover:bg-raktam-dark text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors shadow-sm"
          >
            <PlusCircle className="w-4 h-4" /> Add Historical Data
          </button>
          <button
            onClick={handleSeedDemoData}
            title="Load sample monthly records for O+, B+, A+ to evaluate forecasting"
            className="inline-flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold px-3 py-2 rounded-lg transition-colors border border-gray-300"
          >
            <Database className="w-3.5 h-3.5 text-raktam-red" /> Load Sample Demo Data
          </button>
          <button
            onClick={fetchForecast}
            className="p-2 text-gray-500 hover:text-raktam-red hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh Forecast"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className="my-3 p-3 bg-green-50 border border-green-200 text-green-800 text-xs rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Filter and Configuration Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-5 bg-gray-50 p-4 rounded-xl border border-gray-200">
        {/* Blood Group Selector */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
            Target Blood Group
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {BLOOD_TYPES.map((bt) => (
              <button
                key={bt}
                type="button"
                onClick={() => setBloodGroup(bt)}
                className={`py-1.5 text-xs font-black rounded-lg transition-all ${
                  bloodGroup === bt
                    ? 'bg-raktam-red text-white shadow-sm scale-105'
                    : 'bg-white text-gray-700 hover:bg-gray-200 border border-gray-200'
                }`}
              >
                {bt}
              </button>
            ))}
          </div>
        </div>

        {/* Condition Filter */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
            Target Patient Group
          </label>
          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            className="input-field text-xs py-2 bg-white"
          >
            <option value="">All Recurring Groups (Combined)</option>
            {CONDITIONS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <p className="text-[11px] text-gray-400 mt-1">
            Focus on chronic transfusion schedules
          </p>
        </div>

        {/* Reserved Stock Setting */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
            Committed / Reserved Buffer
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              max="200"
              value={reservedStock}
              onChange={(e) => setReservedStock(Math.max(0, parseInt(e.target.value, 10) || 0))}
              className="input-field text-xs py-2 bg-white w-24 text-center font-bold"
            />
            <span className="text-xs text-gray-500">units reserved</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">
            Excluded from emergency availability calculation
          </p>
        </div>
      </div>

      {/* Main Forecast Metrics & Emergency Estimation */}
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-2">
          <div className="w-8 h-8 border-3 border-raktam-red border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-gray-500">Calculating historical forecast & emergency estimation...</p>
        </div>
      ) : forecastData && !forecastData.canForecast ? (
        /* Insufficient Data State */
        <div className="my-6 p-6 rounded-xl bg-amber-50 border border-amber-200 text-center">
          <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-2" />
          <h3 className="font-bold text-gray-900 text-sm">
            {forecastData.message || 'Insufficient historical data for reliable forecasting.'}
          </h3>
          <p className="text-xs text-gray-600 mt-1 max-w-md mx-auto">
            No historical monthly demand records were found for <strong>{bloodGroup}</strong>.
            Enter historical data above or click below to load sample demo records.
          </p>
          <button
            onClick={handleSeedDemoData}
            className="mt-4 inline-flex items-center gap-1.5 btn-primary text-xs py-2 px-4 shadow-sm"
          >
            <Database className="w-3.5 h-3.5" /> Load Sample Demo Data (O+, B+, A+)
          </button>
        </div>
      ) : forecastData ? (
        <div className="space-y-6">
          {/* Key Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* 1. Current Usable Stock */}
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <span className="text-[11px] font-semibold text-gray-500 uppercase">Current Stock</span>
              <div className="text-2xl font-black text-gray-900 mt-1">
                {forecastData.currentUsableStock} <span className="text-xs font-normal text-gray-500">units</span>
              </div>
              <p className="text-[11px] text-gray-400 mt-0.5">
                {selectedBank ? selectedBank.name : 'All Banks Aggregate'}
              </p>
            </div>

            {/* 2. Predicted Regular Demand */}
            <div className="p-4 bg-red-50/50 rounded-xl border border-red-200">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-raktam-red uppercase">Predicted Demand</span>
                <TrendingUp className="w-3.5 h-3.5 text-raktam-red" />
              </div>
              <div className="text-2xl font-black text-raktam-red mt-1">
                {forecastData.predictedRegularRequirement} <span className="text-xs font-normal text-gray-500">units</span>
              </div>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Next Month Regular Transfusions
              </p>
            </div>

            {/* 3. Reserved Stock */}
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <span className="text-[11px] font-semibold text-gray-500 uppercase">Reserved Stock</span>
              <div className="text-2xl font-black text-gray-700 mt-1">
                {forecastData.reservedStock} <span className="text-xs font-normal text-gray-500">units</span>
              </div>
              <p className="text-[11px] text-gray-400 mt-0.5">Committed baseline buffer</p>
            </div>

            {/* 4. Estimated Emergency Availability */}
            <div className={`p-4 rounded-xl border ${
              forecastData.estimatedEmergencyAvailability <= 0
                ? 'bg-red-100/60 border-red-300'
                : forecastData.estimatedEmergencyAvailability <= 10
                ? 'bg-amber-100/50 border-amber-300'
                : 'bg-green-100/50 border-green-300'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-800 uppercase">Emergency Availability</span>
                {forecastData.riskLevel === 'Adequate' ? (
                  <ShieldCheck className="w-4 h-4 text-green-600" />
                ) : (
                  <ShieldAlert className="w-4 h-4 text-red-600" />
                )}
              </div>
              <div className={`text-2xl font-black mt-1 ${
                forecastData.estimatedEmergencyAvailability <= 0
                  ? 'text-red-700'
                  : forecastData.estimatedEmergencyAvailability <= 10
                  ? 'text-amber-800'
                  : 'text-green-800'
              }`}>
                {forecastData.estimatedEmergencyAvailability} <span className="text-xs font-normal text-gray-600">units</span>
              </div>
              <div className="mt-1">
                <span className={`inline-block px-2 py-0.5 text-[10px] font-black rounded-full border ${forecastData.riskDetails?.badgeClass}`}>
                  {forecastData.riskLevel}
                </span>
              </div>
            </div>
          </div>

          {/* Formula & Explanation Details Banner */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-xs space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2 text-gray-700">
              <div>
                <span className="font-bold">Estimation Formula: </span>
                <code className="bg-white px-2 py-0.5 rounded border border-gray-300 font-mono text-slate-800">
                  {forecastData.currentUsableStock} (Stock) - {forecastData.predictedRegularRequirement} (Predicted) - {forecastData.reservedStock} (Reserved) = {forecastData.estimatedEmergencyAvailability} units
                </code>
              </div>
              <span className="text-gray-500">Method: {forecastData.methodUsed}</span>
            </div>
            <p className="text-gray-500 italic text-[11px]">
              ⚠️ <strong>Disclaimer:</strong> {forecastData.disclaimer}
            </p>
          </div>

          {/* Historical Demand Trend Visual Chart */}
          {forecastData.historicalSeries?.length > 0 && (
            <div className="p-4 bg-white rounded-xl border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-raktam-red" />
                  <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider">
                    Historical Monthly Demand Trend ({bloodGroup})
                  </h4>
                </div>
                <span className="text-[11px] text-gray-400">
                  {forecastData.historicalSeries.length} recorded month(s) in calculation
                </span>
              </div>

              {/* Pure CSS/SVG Responsive Bar Chart */}
              <div className="h-44 flex items-end gap-3 pt-6 pb-2 border-b border-gray-200">
                {forecastData.historicalSeries.map((item, idx) => {
                  const maxUnits = Math.max(...forecastData.historicalSeries.map((s) => s.usedUnits), 50);
                  const barHeightPercent = Math.max(10, Math.round((item.usedUnits / maxUnits) * 100));

                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                      <span className="text-[11px] font-black text-gray-700 mb-1 group-hover:text-raktam-red">
                        {item.usedUnits}u
                      </span>
                      <div className="w-full bg-gray-100 rounded-t-lg h-full max-h-32 flex flex-col justify-end p-0.5">
                        <div
                          style={{ height: `${barHeightPercent}%` }}
                          className={`w-full rounded-t transition-all duration-500 ${
                            item.isDemo
                              ? 'bg-gradient-to-t from-red-400 to-raktam-red opacity-80'
                              : 'bg-raktam-red'
                          }`}
                        />
                      </div>
                      <span className="text-[10px] text-gray-500 mt-2 font-medium">
                        {MONTH_NAMES[item.month - 1]?.slice(0, 3)} '{String(item.year).slice(-2)}
                      </span>
                      {item.isDemo && (
                        <span className="text-[9px] text-amber-600 bg-amber-50 px-1 rounded scale-90">Demo</span>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-between text-[11px] text-gray-400 mt-2">
                <span>Height represents actual units transfused (usedUnits)</span>
                <span>Sorted chronologically</span>
              </div>
            </div>
          )}
        </div>
      ) : null}

      {/* Historical Data Records Table */}
      <div className="mt-8 pt-6 border-t border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-600" />
            <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider">
              Historical Monthly Records Database ({records.length})
            </h4>
          </div>
          {records.some((r) => r.isDemo) && (
            <button
              onClick={handleClearDemoData}
              className="text-[11px] text-red-600 hover:text-red-800 underline font-medium"
            >
              Clear Demo Data
            </button>
          )}
        </div>

        {recordsLoading ? (
          <p className="text-xs text-gray-400 py-4 text-center">Loading historical records...</p>
        ) : records.length === 0 ? (
          <p className="text-xs text-gray-400 py-4 text-center">
            No historical records stored for {bloodGroup}. Add records using the form above.
          </p>
        ) : (
          <div className="overflow-x-auto max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-100 text-gray-700 font-bold sticky top-0">
                <tr>
                  <th className="p-2.5">Period</th>
                  <th className="p-2.5">Blood</th>
                  <th className="p-2.5">Condition</th>
                  <th className="p-2.5 text-right">Patients</th>
                  <th className="p-2.5 text-right">Required</th>
                  <th className="p-2.5 text-right">Used</th>
                  <th className="p-2.5 text-right">Remaining</th>
                  <th className="p-2.5 text-right">Emergency</th>
                  <th className="p-2.5">Type</th>
                  <th className="p-2.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {records.map((r) => (
                  <tr key={r._id} className="hover:bg-gray-50">
                    <td className="p-2.5 font-medium">
                      {MONTH_NAMES[r.month - 1]} {r.year}
                    </td>
                    <td className="p-2.5 font-black text-raktam-red">{r.bloodGroup}</td>
                    <td className="p-2.5">{r.condition}</td>
                    <td className="p-2.5 text-right">{r.regularPatientCount}</td>
                    <td className="p-2.5 text-right">{r.requiredUnits}</td>
                    <td className="p-2.5 text-right font-semibold">{r.usedUnits}</td>
                    <td className="p-2.5 text-right">{r.remainingUnits}</td>
                    <td className="p-2.5 text-right">{r.emergencyUnitsUsed}</td>
                    <td className="p-2.5">
                      {r.isDemo ? (
                        <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                          Sample Demo
                        </span>
                      ) : (
                        <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                          Verified
                        </span>
                      )}
                    </td>
                    <td className="p-2.5 text-center">
                      <button
                        onClick={() => handleDeleteRecord(r._id)}
                        className="text-gray-400 hover:text-red-600 transition-colors p-1"
                        title="Delete record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Add Historical Data Form */}
      {showEntryModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-raktam-red" />
                <h3 className="font-bold text-gray-900 text-base">
                  Record Historical Blood Requirement Data
                </h3>
              </div>
              <button
                onClick={() => setShowEntryModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Month *</label>
                  <select
                    name="month"
                    value={formData.month}
                    onChange={handleFormChange}
                    className="input-field text-xs py-2"
                    required
                  >
                    {MONTH_NAMES.map((m, idx) => (
                      <option key={idx} value={idx + 1}>
                        {idx + 1} - {m}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Year *</label>
                  <input
                    type="number"
                    name="year"
                    min="2000"
                    max="2100"
                    value={formData.year}
                    onChange={handleFormChange}
                    className="input-field text-xs py-2"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Blood Group *</label>
                  <select
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleFormChange}
                    className="input-field text-xs py-2 font-bold text-raktam-red"
                    required
                  >
                    {BLOOD_TYPES.map((bt) => (
                      <option key={bt} value={bt}>{bt}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Condition *</label>
                  <select
                    name="condition"
                    value={formData.condition}
                    onChange={handleFormChange}
                    className="input-field text-xs py-2"
                    required
                  >
                    {CONDITIONS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">Regular Patients</label>
                  <input
                    type="number"
                    min="0"
                    name="regularPatientCount"
                    value={formData.regularPatientCount}
                    onChange={handleFormChange}
                    className="input-field text-xs py-1.5"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">Required Units</label>
                  <input
                    type="number"
                    min="0"
                    name="requiredUnits"
                    value={formData.requiredUnits}
                    onChange={handleFormChange}
                    className="input-field text-xs py-1.5"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">Used Units *</label>
                  <input
                    type="number"
                    min="0"
                    name="usedUnits"
                    value={formData.usedUnits}
                    onChange={handleFormChange}
                    className="input-field text-xs py-1.5 font-bold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">Remaining Units</label>
                  <input
                    type="number"
                    min="0"
                    name="remainingUnits"
                    value={formData.remainingUnits}
                    onChange={handleFormChange}
                    className="input-field text-xs py-1.5"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">Emergency Used</label>
                  <input
                    type="number"
                    min="0"
                    name="emergencyUnitsUsed"
                    value={formData.emergencyUnitsUsed}
                    onChange={handleFormChange}
                    className="input-field text-xs py-1.5"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">Wasted Units</label>
                  <input
                    type="number"
                    min="0"
                    name="wastedUnits"
                    value={formData.wastedUnits}
                    onChange={handleFormChange}
                    className="input-field text-xs py-1.5"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Notes / Context (Optional)</label>
                <input
                  type="text"
                  name="notes"
                  value={formData.notes}
                  onChange={handleFormChange}
                  placeholder="e.g., Seasonal spike, transfusion camp"
                  className="input-field text-xs py-2"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowEntryModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary text-xs py-2 px-5 shadow-sm"
                >
                  Save Historical Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
