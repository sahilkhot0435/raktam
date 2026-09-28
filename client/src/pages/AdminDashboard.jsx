import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Loader2, Save, Bell, AlertCircle } from 'lucide-react';
import BloodDemandForecasting from '../components/BloodDemandForecasting';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function AdminDashboard() {
  const { user } = useAuth();
  const { stockUpdates, emergencyAlerts } = useSocket();
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBank, setSelectedBank] = useState(null);
  const [stock, setStock] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!user || user.role !== 'admin') return <Navigate to="/admin/login" />;

  useEffect(() => {
    axios.get('/api/banks')
      .then(res => { setBanks(res.data); if (res.data.length > 0) selectBank(res.data[0]); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const selectBank = (bank) => {
    setSelectedBank(bank);
    const s = {};
    BLOOD_TYPES.forEach(bt => {
      const e = bank.stock?.find(x => x.bloodType === bt);
      s[bt] = e?.units || 0;
    });
    setStock(s);
    setSaved(false);
  };

  const saveStock = async () => {
    setSaving(true);
    try {
      const stockArr = BLOOD_TYPES.map(bt => ({ bloodType: bt, units: Number(stock[bt] || 0) }));
      await axios.put(`/api/blood/stock/${selectedBank._id}`, { stock: stockArr });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {}
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-raktam-black to-red-950 text-white py-10">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-3xl font-black">Admin Dashboard</h1>
          <p className="text-red-300 mt-1">Manage blood stock and monitor emergency requests</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 grid md:grid-cols-3 gap-6">
        {/* Bank list */}
        <div className="card md:col-span-1">
          <h3 className="font-bold text-gray-900 mb-4">Blood Banks</h3>
          {loading ? <Loader2 className="w-6 h-6 animate-spin text-raktam-red" /> : (
            <div className="space-y-2">
              {banks.map(bank => (
                <button key={bank._id} onClick={() => selectBank(bank)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all ${
                    selectedBank?._id === bank._id ? 'bg-raktam-red text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}>
                  <p className="font-semibold">{bank.name}</p>
                  <p className={`text-xs mt-0.5 ${selectedBank?._id === bank._id ? 'text-red-200' : 'text-gray-400'}`}>{bank.city}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Stock editor */}
        <div className="md:col-span-2 space-y-6">
          {selectedBank && (
            <div className="card">
              <h3 className="font-bold text-gray-900 text-lg mb-2">{selectedBank.name}</h3>
              <p className="text-gray-500 text-sm mb-6">{selectedBank.address}, {selectedBank.city}</p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {BLOOD_TYPES.map(bt => (
                  <div key={bt}>
                    <label className="block text-center text-sm font-black text-raktam-red mb-2">{bt}</label>
                    <input
                      type="number" min="0" max="500"
                      value={stock[bt] || 0}
                      onChange={e => setStock(s => ({ ...s, [bt]: e.target.value }))}
                      className="input-field text-center font-bold text-lg"
                    />
                    <p className="text-xs text-center text-gray-400 mt-1">units</p>
                  </div>
                ))}
              </div>

              <button onClick={saveStock} disabled={saving}
                className={`btn-primary flex items-center gap-2 ${
                  saved ? 'bg-green-600 hover:bg-green-700' : ''
                }`}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saved ? '✅ Saved!' : saving ? 'Saving...' : 'Update Stock'}
              </button>
            </div>
          )}

          {/* Real-time updates feed */}
          {(stockUpdates.length > 0 || emergencyAlerts.length > 0) && (
            <div className="card">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Bell className="w-5 h-5 text-raktam-red" /> Live Activity Feed
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {emergencyAlerts.map((a, i) => (
                  <div key={i} className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3 text-sm">
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-red-800">🚨 Emergency: {a.bloodType} at {a.hospital}</p>
                      <p className="text-red-600 text-xs">{a.city} · {a.urgencyLevel}</p>
                    </div>
                  </div>
                ))}
                {stockUpdates.map((u, i) => (
                  <div key={i} className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                    <span className="text-blue-600">📦</span>
                    <p className="text-blue-800">Stock updated: {u.bankName} ({u.city})</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Blood Demand Forecasting & Emergency Availability Section */}
      <div className="max-w-6xl mx-auto px-4 pb-12">
        <BloodDemandForecasting selectedBank={selectedBank} allBanks={banks} />
      </div>
    </div>
  );
}
