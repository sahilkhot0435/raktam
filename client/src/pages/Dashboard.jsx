import React, { useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  Heart,
  Droplets,
  Calendar,
  CheckCircle,
  Clock,
  ToggleLeft,
  ToggleRight,
  User,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  Search,
  AlertCircle,
  Activity,
  Award,
} from 'lucide-react';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    if (!user) return;
    axios
      .get('/api/donors/me/dashboard')
      .then((res) => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) return <Navigate to="/login" />;

  const toggleAvailability = async () => {
    setToggling(true);
    try {
      const nextStatus = !data?.user?.isAvailable;
      await axios.put('/api/donors/me/availability', { isAvailable: nextStatus });
      setData((d) => ({ ...d, user: { ...d.user, isAvailable: nextStatus } }));
    } catch {
      alert('Failed to update availability status.');
    } finally {
      setToggling(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Header */}
      <div className="bg-gradient-to-r from-raktam-black via-red-950 to-raktam-dark text-white py-12">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-18 h-18 bg-raktam-red rounded-2xl flex items-center justify-center text-white text-3xl font-black shadow-xl border-2 border-red-400/40">
                {user.bloodType}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-black">{user.name}</h1>
                  <span className="bg-red-500/20 text-red-300 text-xs px-2.5 py-0.5 rounded-full border border-red-500/40 font-semibold">
                    Verified Donor
                  </span>
                </div>
                <p className="text-red-200 text-xs mt-1">
                  {user.location?.city ? `${user.location.city}, ${user.location.state}` : 'India'} · Donor Profile & Portal
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2.5">
              <Link
                to="/emergency"
                className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-md inline-flex items-center gap-1.5"
              >
                <AlertCircle className="w-4 h-4" /> Emergency Request
              </Link>
              <Link
                to="/search"
                className="bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all border border-white/20 inline-flex items-center gap-1.5"
              >
                <Search className="w-4 h-4" /> Find Blood
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Notice if user is admin */}
      {user.role === 'admin' && (
        <div className="bg-amber-50 border-b border-amber-200 py-2.5 px-4 text-center text-xs text-amber-900 font-medium">
          Logged in as Administrator. Want to manage hospital stocks and forecasting?{' '}
          <Link to="/admin" className="font-bold underline text-amber-950 ml-1">
            Open Admin Dashboard ➔
          </Link>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-10 h-10 border-4 border-raktam-red border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-gray-500">Loading donor profile...</p>
          </div>
        ) : data ? (
          <>
            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {/* Card 1: Blood Group */}
              <div className="card border-l-4 border-raktam-red flex items-center gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-raktam-red flex-shrink-0">
                  <Droplets className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Blood Group</span>
                  <div className="text-2xl font-black text-gray-900">{user.bloodType}</div>
                  <span className="text-[11px] text-gray-500">Universal or Compatible</span>
                </div>
              </div>

              {/* Card 2: Donations Count */}
              <div className="card border-l-4 border-red-500 flex items-center gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-red-500 flex-shrink-0">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Donations</span>
                  <div className="text-2xl font-black text-gray-900">{data.totalDonations}</div>
                  <span className="text-[11px] text-gray-500">
                    Saved ~{data.totalDonations * 3} lives
                  </span>
                </div>
              </div>

              {/* Card 3: Eligibility */}
              <div className="card border-l-4 border-green-500 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  data.isEligible ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'
                }`}>
                  {data.isEligible ? <CheckCircle className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                </div>
                <div>
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Donation Status</span>
                  <div className={`text-xl font-black ${data.isEligible ? 'text-green-600' : 'text-amber-600'}`}>
                    {data.isEligible ? 'Eligible to Donate' : 'Cooldown Period'}
                  </div>
                  <span className="text-[11px] text-gray-500">
                    {data.isEligible
                      ? 'Ready for donation'
                      : data.nextEligibleDate
                      ? `Eligible: ${new Date(data.nextEligibleDate).toLocaleDateString('en-IN')}`
                      : 'Cooldown active'}
                  </span>
                </div>
              </div>
            </div>

            {/* Donor Profile Information Card */}
            <div className="card shadow-sm border border-gray-100">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-raktam-red" />
                  <h2 className="font-black text-gray-900 text-base">Donor Profile Details</h2>
                </div>
                <span className="text-[11px] bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-medium">
                  ID: #{String(user._id || '').slice(-6).toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pt-5">
                <div>
                  <span className="text-xs font-semibold text-gray-400 block mb-1">Full Name</span>
                  <p className="text-sm font-bold text-gray-800 flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    {user.name}
                  </p>
                </div>

                <div>
                  <span className="text-xs font-semibold text-gray-400 block mb-1">Blood Group</span>
                  <p className="text-sm font-bold text-raktam-red flex items-center gap-2">
                    <Droplets className="w-4 h-4" />
                    {user.bloodType} (Rh positive/negative)
                  </p>
                </div>

                <div>
                  <span className="text-xs font-semibold text-gray-400 block mb-1">Registered Phone</span>
                  <p className="text-sm font-bold text-gray-800 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    {user.phone || 'Not provided'}
                  </p>
                </div>

                <div>
                  <span className="text-xs font-semibold text-gray-400 block mb-1">Email Address</span>
                  <p className="text-sm font-bold text-gray-800 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    {user.email}
                  </p>
                </div>

                <div>
                  <span className="text-xs font-semibold text-gray-400 block mb-1">Location</span>
                  <p className="text-sm font-bold text-gray-800 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    {user.location?.city ? `${user.location.city}, ${user.location.state}` : 'City not configured'}
                    {user.location?.pincode && ` - ${user.location.pincode}`}
                  </p>
                </div>

                <div>
                  <span className="text-xs font-semibold text-gray-400 block mb-1">Emergency Matching</span>
                  <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${
                    data.user?.isAvailable ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${data.user?.isAvailable ? 'bg-green-500' : 'bg-gray-400'}`} />
                    {data.user?.isAvailable ? 'Active for Emergency Match' : 'Temporarily Inactive'}
                  </span>
                </div>
              </div>
            </div>

            {/* Availability Toggle Box */}
            <div className="card bg-gradient-to-r from-red-50/50 to-white border border-red-100 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-black text-gray-900 text-sm">Emergency Donor Availability</h3>
                <p className="text-xs text-gray-500 mt-1 max-w-md">
                  When enabled, nearby patients and hospitals can contact you during critical blood shortages. You can toggle this off anytime if traveling or unwell.
                </p>
              </div>
              <button
                onClick={toggleAvailability}
                disabled={toggling}
                className={`flex items-center gap-2.5 px-6 py-3 rounded-xl font-bold text-xs transition-all shadow-sm ${
                  data.user?.isAvailable
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                {data.user?.isAvailable ? (
                  <>
                    <ToggleRight className="w-5 h-5" /> Available for Calls
                  </>
                ) : (
                  <>
                    <ToggleLeft className="w-5 h-5" /> Temporarily Paused
                  </>
                )}
              </button>
            </div>

            {/* Donation History */}
            <div className="card shadow-sm border border-gray-100">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-raktam-red" />
                  <h3 className="font-black text-gray-900 text-base">Your Donation History</h3>
                </div>
                <span className="text-xs text-gray-500">{data.donations?.length || 0} recorded</span>
              </div>

              {data.donations?.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Heart className="w-12 h-12 mx-auto mb-2 text-red-200" />
                  <p className="text-sm font-semibold text-gray-600">No donations recorded yet</p>
                  <p className="text-xs text-gray-400 mt-1">
                    When you donate blood at any partner bank or camp, your records will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 pt-4">
                  {data.donations.map((d, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between bg-gray-50 rounded-xl p-4 border border-gray-100 hover:bg-red-50/30 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-raktam-red rounded-xl flex items-center justify-center text-white text-xs font-black shadow-sm">
                          {d.bloodType}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{d.bloodBank?.name || 'Blood Centre'}</p>
                          <p className="text-xs text-gray-500">{d.bloodBank?.city || 'India'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200">
                          {d.units} unit(s) donated
                        </span>
                        <p className="text-[11px] text-gray-400 mt-1">
                          {new Date(d.donatedAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
