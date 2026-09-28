import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Shield,
  Droplets,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  UserCheck,
  Lock,
  ArrowRight,
  ShieldCheck,
  Heart,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') === 'user' ? 'user' : 'admin';
  const [activeTab, setActiveTab] = useState(initialRole); // 'admin' or 'user'

  // Admin form state
  const [adminForm, setAdminForm] = useState({ email: 'admin@raktam.in', password: '' });
  const [adminShowPass, setAdminShowPass] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState('');

  // User/Donor form state
  const [userForm, setUserForm] = useState({ email: '', password: '' });
  const [userShowPass, setUserShowPass] = useState(false);
  const [userLoading, setUserLoading] = useState(false);
  const [userError, setUserError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (searchParams.get('role') === 'user') {
      setActiveTab('user');
    } else if (searchParams.get('role') === 'admin') {
      setActiveTab('admin');
    }
  }, [searchParams]);

  // Handle Admin Login submission -> redirects to /admin
  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    setAdminError('');
    setAdminLoading(true);
    try {
      const user = await login(adminForm.email, adminForm.password);
      if (user.role !== 'admin') {
        setAdminError('Access restricted: This account is a regular donor account. Please use the User Login below.');
        return;
      }
      navigate('/admin');
    } catch (err) {
      setAdminError(err.response?.data?.message || 'Admin login failed. Please check credentials.');
    } finally {
      setAdminLoading(false);
    }
  };

  // Handle User/Donor Login submission -> redirects to /dashboard
  const handleUserSubmit = async (e) => {
    e.preventDefault();
    setUserError('');
    setUserLoading(true);
    try {
      const user = await login(userForm.email, userForm.password);
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setUserError(err.response?.data?.message || 'User login failed. Please check email and password.');
    } finally {
      setUserLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-xl mx-auto">
        {/* Main Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-red-100 text-raktam-red px-3 py-1 rounded-full text-xs font-bold mb-3 border border-red-200">
            <Droplets className="w-3.5 h-3.5" />
            RAKTAM Secure Access Portal
          </div>
          <h1 className="text-3xl font-black text-gray-900">Sign In to Raktam</h1>
          <p className="text-gray-500 text-sm mt-1">
            Choose your login type: <strong>Admin Portal</strong> or <strong>User / Donor Dashboard</strong>
          </p>
        </div>

        {/* Tab Switcher Buttons */}
        <div className="grid grid-cols-2 gap-2 bg-gray-200 p-1.5 rounded-2xl mb-8 shadow-inner">
          <button
            type="button"
            onClick={() => setActiveTab('admin')}
            className={`py-3 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
              activeTab === 'admin'
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Shield className="w-4 h-4 text-red-500" />
            1. Admin Login (Hospital / Bank)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('user')}
            className={`py-3 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
              activeTab === 'user'
                ? 'bg-raktam-red text-white shadow-md'
                : 'text-gray-600 hover:text-raktam-red hover:bg-gray-100'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            2. User Login
          </button>
        </div>

        {/* ---------------- SECTION 1: ADMIN LOGIN ---------------- */}
        <div
          className={`card mb-6 border-2 transition-all ${
            activeTab === 'admin'
              ? 'border-slate-800 shadow-xl bg-slate-900 text-white'
              : 'border-gray-200 bg-white opacity-90'
          }`}
        >
          <div className="flex items-center justify-between pb-4 border-b border-slate-700/60 mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-md">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className={`font-black text-base ${activeTab === 'admin' ? 'text-white' : 'text-gray-900'}`}>
                  Admin Login
                </h2>
                <p className={`text-xs ${activeTab === 'admin' ? 'text-slate-400' : 'text-gray-500'}`}>
                  For Blood Bank & Hospital Administrators
                </p>
              </div>
            </div>
            {activeTab !== 'admin' && (
              <button
                type="button"
                onClick={() => setActiveTab('admin')}
                className="text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg font-bold"
              >
                Switch to Admin
              </button>
            )}
          </div>

          <form onSubmit={handleAdminSubmit} className="space-y-4">
            <div>
              <label
                className={`block text-xs font-bold uppercase tracking-wider mb-1 ${
                  activeTab === 'admin' ? 'text-slate-300' : 'text-gray-700'
                }`}
              >
                Admin Email
              </label>
              <input
                required
                type="email"
                value={adminForm.email}
                onChange={(e) => setAdminForm((f) => ({ ...f, email: e.target.value }))}
                className={`w-full rounded-lg px-4 py-3 text-sm focus:outline-none transition-all ${
                  activeTab === 'admin'
                    ? 'bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-red-500'
                    : 'input-field'
                }`}
                placeholder="admin@raktam.in"
              />
            </div>

            <div>
              <label
                className={`block text-xs font-bold uppercase tracking-wider mb-1 ${
                  activeTab === 'admin' ? 'text-slate-300' : 'text-gray-700'
                }`}
              >
                Admin Password
              </label>
              <div className="relative">
                <input
                  required
                  type={adminShowPass ? 'text' : 'password'}
                  value={adminForm.password}
                  onChange={(e) => setAdminForm((f) => ({ ...f, password: e.target.value }))}
                  className={`w-full rounded-lg px-4 py-3 text-sm focus:outline-none transition-all pr-12 ${
                    activeTab === 'admin'
                      ? 'bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-red-500'
                      : 'input-field'
                  }`}
                  placeholder="Enter admin password (e.g. Raktam@2024)"
                />
                <button
                  type="button"
                  onClick={() => setAdminShowPass(!adminShowPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                >
                  {adminShowPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {adminError && (
              <div className="flex items-start gap-2 text-red-300 text-xs bg-red-950/80 border border-red-900 p-3 rounded-lg">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{adminError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={adminLoading}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 px-4 rounded-lg transition-all shadow-md flex items-center justify-center gap-2 text-sm"
            >
              {adminLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Verifying Admin...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" /> Sign In to Admin Dashboard ➔
                </>
              )}
            </button>
          </form>

          <p className="text-[11px] text-slate-400 text-center mt-3">
            Admin access grants control over blood inventory, hospital records & demand forecasting.
          </p>
        </div>

        {/* ---------------- SECTION 2: USER / DONOR LOGIN (BELOW ADMIN) ---------------- */}
        <div
          className={`card border-2 transition-all ${
            activeTab === 'user'
              ? 'border-raktam-red shadow-xl bg-white'
              : 'border-gray-200 bg-white opacity-95'
          }`}
        >
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-raktam-light border border-red-200 flex items-center justify-center text-raktam-red shadow-sm">
                <Heart className="w-5 h-5 text-raktam-red fill-current" />
              </div>
              <div>
                <h2 className="font-black text-base text-gray-900">User Login</h2>
                <p className="text-xs text-gray-500">
                  Access your profile, blood donations & eligibility status
                </p>
              </div>
            </div>
            {activeTab !== 'user' && (
              <button
                type="button"
                onClick={() => setActiveTab('user')}
                className="text-xs text-raktam-red bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg font-bold border border-red-200"
              >
                Switch to User
              </button>
            )}
          </div>

          <form onSubmit={handleUserSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                User Email Address
              </label>
              <input
                required
                type="email"
                value={userForm.email}
                onChange={(e) => setUserForm((f) => ({ ...f, email: e.target.value }))}
                className="input-field text-sm"
                placeholder="e.g. user@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                User Password
              </label>
              <div className="relative">
                <input
                  required
                  type={userShowPass ? 'text' : 'password'}
                  value={userForm.password}
                  onChange={(e) => setUserForm((f) => ({ ...f, password: e.target.value }))}
                  className="input-field text-sm pr-12"
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setUserShowPass(!userShowPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {userShowPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {userError && (
              <div className="flex items-start gap-2 text-red-700 text-xs bg-red-50 border border-red-200 p-3 rounded-lg">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{userError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={userLoading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 text-sm shadow-md"
            >
              {userLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Signing In...
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4" /> Sign In to User Dashboard ➔
                </>
              )}
            </button>
          </form>

          {/* Donor registration link */}
          <div className="mt-5 pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-2">
            <span>Don't have a registered donor profile?</span>
            <Link
              to="/register"
              className="font-bold text-raktam-red hover:underline inline-flex items-center gap-1"
            >
              Register as New Donor <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
