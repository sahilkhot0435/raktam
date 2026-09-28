import React, { useState } from 'react';
import axios from 'axios';
import { AlertCircle, Loader2, CheckCircle, Phone, MapPin, Navigation, Users } from 'lucide-react';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const URGENCY = [{ value: 'critical', label: '🔴 Critical (< 2 hours)', color: 'text-red-600' }, { value: 'urgent', label: '🟡 Urgent (< 12 hours)', color: 'text-yellow-600' }, { value: 'normal', label: '🟢 Normal (< 24 hours)', color: 'text-green-600' }];
const STATES = ['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'West Bengal', 'Telangana', 'Gujarat', 'Rajasthan', 'Uttar Pradesh', 'Punjab'];

export default function EmergencyRequest() {
  const [form, setForm] = useState({
    patientName: '', bloodType: '', unitsRequired: 1,
    hospital: '', city: '', state: '',
    contactName: '', contactPhone: '', urgencyLevel: 'urgent',
  });
  const [coords, setCoords] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const getUserLocation = () => {
    if (!navigator.geolocation) return alert('Geolocation not supported');
    navigator.geolocation.getCurrentPosition(
      pos => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => alert('Could not get location')
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.bloodType) return setError('Please select a blood type');
    setError('');
    setLoading(true);
    try {
      const payload = { ...form, ...coords };
      const res = await axios.post('/api/emergency', payload);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4">
          <div className="card text-center mb-6 border-2 border-green-200">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-black text-gray-900 mb-2">Emergency Request Submitted!</h2>
            <p className="text-gray-600">We're actively searching for donors and blood banks near {form.city}.</p>
            {result.searchRadius && (
              <p className="text-sm text-blue-600 mt-2">Search radius: {result.searchRadius} km</p>
            )}
          </div>

          {/* Matched Donors */}
          {result.matchedDonors?.length > 0 && (
            <div className="card mb-4">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-raktam-red" />
                {result.matchedDonors.length} Nearby Donors Found
              </h3>
              <div className="space-y-3">
                {result.matchedDonors.map((donor, i) => (
                  <div key={i} className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
                    <div>
                      <p className="font-semibold text-gray-900">{donor.name}</p>
                      <p className="text-sm text-gray-500">{donor.bloodType} · {donor.city}</p>
                    </div>
                    <a href={`tel:${donor.phone}`} className="flex items-center gap-2 bg-raktam-red text-white text-sm font-semibold px-4 py-2 rounded-lg">
                      <Phone className="w-4 h-4" /> Call
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Matched Banks */}
          {result.matchedBanks?.length > 0 && (
            <div className="card mb-4">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                🏥 {result.matchedBanks.length} Nearby Blood Banks
              </h3>
              <div className="space-y-3">
                {result.matchedBanks.map((bank, i) => (
                  <div key={i} className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
                    <div>
                      <p className="font-semibold text-gray-900">{bank.name}</p>
                      <p className="text-sm text-gray-500">{bank.address} · {bank.city}</p>
                    </div>
                    <a href={`tel:${bank.phone}`} className="flex items-center gap-2 bg-raktam-red text-white text-sm font-semibold px-4 py-2 rounded-lg">
                      <Phone className="w-4 h-4" /> Call
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.totalDonorsFound === 0 && result.totalBanksFound === 0 && (
            <div className="card text-center py-8">
              <p className="text-gray-600 mb-4">No donors or banks found in your area right now.</p>
              <a href="tel:1910" className="btn-primary inline-block">Call National Helpline: 1910</a>
            </div>
          )}

          <button onClick={() => setResult(null)} className="w-full mt-4 btn-outline">Submit Another Request</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-raktam-red text-white py-12">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-3" />
          <h1 className="text-3xl font-black">Emergency Blood Request</h1>
          <p className="text-red-200 mt-2">Fill the form below. We'll find donors and blood banks near you instantly.</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10">
        <form onSubmit={handleSubmit} className="card space-y-6">
          {/* Blood type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Blood Type Required *</label>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {BLOOD_TYPES.map(bt => (
                <button key={bt} type="button" onClick={() => set('bloodType', bt)}
                  className={`py-3 rounded-lg font-black text-sm transition-all ${
                    form.bloodType === bt ? 'bg-raktam-red text-white shadow-lg scale-105' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}>
                  {bt}
                </button>
              ))}
            </div>
          </div>

          {/* Patient info */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Patient Name *</label>
              <input required value={form.patientName} onChange={e => set('patientName', e.target.value)} className="input-field" placeholder="Full name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Units Required</label>
              <input type="number" min="1" max="20" value={form.unitsRequired} onChange={e => set('unitsRequired', e.target.value)} className="input-field" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hospital / Location *</label>
            <input required value={form.hospital} onChange={e => set('hospital', e.target.value)} className="input-field" placeholder="Hospital name and address" />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
              <input required value={form.city} onChange={e => set('city', e.target.value)} className="input-field" placeholder="City" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
              <select required value={form.state} onChange={e => set('state', e.target.value)} className="input-field">
                <option value="">Select state</option>
                {STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Urgency */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Urgency Level</label>
            <div className="space-y-2">
              {URGENCY.map(u => (
                <label key={u.value} className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  form.urgencyLevel === u.value ? 'border-raktam-red bg-raktam-light' : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input type="radio" name="urgency" value={u.value} checked={form.urgencyLevel === u.value} onChange={e => set('urgencyLevel', e.target.value)} className="accent-raktam-red" />
                  <span className={`font-medium ${u.color}`}>{u.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person *</label>
              <input required value={form.contactName} onChange={e => set('contactName', e.target.value)} className="input-field" placeholder="Your name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone *</label>
              <input required type="tel" value={form.contactPhone} onChange={e => set('contactPhone', e.target.value)} className="input-field" placeholder="10-digit mobile number" />
            </div>
          </div>

          {/* GPS */}
          <button type="button" onClick={getUserLocation}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg border-2 text-sm font-medium transition-all ${
              coords ? 'border-green-500 text-green-700 bg-green-50' : 'border-dashed border-gray-300 text-gray-600 hover:border-raktam-red hover:text-raktam-red'
            }`}
          >
            <Navigation className="w-4 h-4" />
            {coords ? '✅ Location captured — improves donor matching accuracy' : 'Enable GPS for better donor matching (optional)'}
          </button>

          {error && <div className="flex items-center gap-2 text-red-600 text-sm"><AlertCircle className="w-4 h-4" /> {error}</div>}

          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-lg">
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Finding Donors...</> : <><AlertCircle className="w-5 h-5" /> Submit Emergency Request</>}
          </button>
        </form>
      </div>
    </div>
  );
}
