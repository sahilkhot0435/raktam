import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle, CheckCircle, Navigation } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const STATES = ['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'West Bengal', 'Telangana', 'Gujarat', 'Rajasthan', 'Uttar Pradesh', 'Punjab', 'Madhya Pradesh', 'Andhra Pradesh', 'Kerala', 'Odisha', 'Haryana'];

export default function Register() {
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '', bloodType: '',
    city: '', state: '', pincode: '',
  });
  const [coords, setCoords] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const getUserLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(pos => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.bloodType) return setError('Please select your blood type');
    if (form.password.length < 6) return setError('Password must be at least 6 characters');
    setError('');
    setLoading(true);
    try {
      await register({ ...form, ...coords });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-gray-900">Become a Donor 🩸</h1>
          <p className="text-gray-500 mt-2">Join the Raktam network and help save lives</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Blood type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Your Blood Type *</label>
              <div className="grid grid-cols-4 gap-2">
                {BLOOD_TYPES.map(bt => (
                  <button key={bt} type="button" onClick={() => set('bloodType', bt)}
                    className={`py-3 rounded-lg font-black text-sm transition-all ${
                      form.bloodType === bt ? 'bg-raktam-red text-white shadow-lg' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}>
                    {bt}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input required value={form.name} onChange={e => set('name', e.target.value)} className="input-field" placeholder="Your full name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                <input required type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} className="input-field" placeholder="10-digit mobile" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input required type="email" value={form.email} onChange={e => set('email', e.target.value)} className="input-field" placeholder="your@email.com" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
              <input required type="password" value={form.password} onChange={e => set('password', e.target.value)} className="input-field" placeholder="Min. 6 characters" />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                <input required value={form.city} onChange={e => set('city', e.target.value)} className="input-field" placeholder="Your city" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                <select required value={form.state} onChange={e => set('state', e.target.value)} className="input-field">
                  <option value="">Select state</option>
                  {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
              <input value={form.pincode} onChange={e => set('pincode', e.target.value)} className="input-field" placeholder="6-digit pincode" />
            </div>

            <button type="button" onClick={getUserLocation}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                coords ? 'border-green-500 text-green-700 bg-green-50' : 'border-dashed border-gray-300 text-gray-600 hover:border-raktam-red hover:text-raktam-red'
              }`}>
              <Navigation className="w-4 h-4" />
              {coords ? '✅ Location captured — you will appear in nearby searches' : 'Share location for better matching (recommended)'}
            </button>

            {error && <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg"><AlertCircle className="w-4 h-4" />{error}</div>}

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-4">
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Registering...</> : '🩸 Register as Donor'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already registered? <Link to="/login" className="text-raktam-red font-semibold hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
