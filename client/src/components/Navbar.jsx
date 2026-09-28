import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Droplets, Menu, X, AlertCircle, Bell, Shield, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const { emergencyAlerts } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/search', label: 'Find Blood' },
    { path: '/emergency', label: 'Emergency' },
    { path: '/banks', label: 'Blood Banks' },
    { path: '/about', label: 'About' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-sm border-b-2 border-raktam-red sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-raktam-red rounded-full flex items-center justify-center group-hover:bg-raktam-dark transition-colors">
              <Droplets className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-black text-raktam-red">रक्तम्</span>
              <span className="text-xs text-gray-400 block leading-none -mt-1">by Avishhkar</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ path, label }) => (
              <Link
                key={path}
                to={path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  path === '/emergency'
                    ? 'bg-raktam-red text-white hover:bg-raktam-dark ml-2'
                    : isActive(path)
                    ? 'text-raktam-red bg-raktam-light'
                    : 'text-gray-600 hover:text-raktam-red hover:bg-gray-50'
                }`}
              >
                {path === '/emergency' && <span className="mr-1">🚨</span>}
                {label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            {/* Emergency alerts bell */}
            {emergencyAlerts.length > 0 && (
              <button className="relative p-2 text-raktam-red">
                <Bell className="w-5 h-5" />
                <span className="absolute top-0 right-0 w-4 h-4 bg-raktam-red text-white text-xs rounded-full flex items-center justify-center">
                  {emergencyAlerts.length}
                </span>
              </button>
            )}

            {user ? (
              <div className="flex items-center gap-3">
                {user.role === 'admin' ? (
                  <>
                    <Link
                      to="/admin"
                      className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-black text-white text-xs font-bold py-2 px-3.5 rounded-lg shadow-sm transition-colors"
                    >
                      <Shield className="w-3.5 h-3.5 text-red-400" /> Admin Portal
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="text-xs font-semibold text-gray-500 hover:text-raktam-red px-2 py-1"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/dashboard"
                      className="flex items-center gap-2 bg-raktam-light border border-red-200 text-xs font-bold text-gray-800 hover:text-raktam-red px-3 py-1.5 rounded-xl transition-all shadow-sm"
                    >
                      <div className="w-7 h-7 bg-raktam-red rounded-lg flex items-center justify-center text-white text-xs font-black">
                        {user.bloodType || user.name?.charAt(0)}
                      </div>
                      <div className="text-left">
                        <span className="block text-[11px] text-gray-400 font-normal leading-none">User</span>
                        <span>{user.name?.split(' ')[0]}</span>
                      </div>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="text-xs font-semibold text-gray-500 hover:text-raktam-red px-2 py-1"
                    >
                      Logout
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {/* User Login (placed side-by-side with Admin Login) */}
                <Link
                  to="/login?role=user"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-700 hover:text-raktam-red bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg transition-colors border border-gray-200 shadow-sm"
                >
                  <User className="w-3.5 h-3.5 text-raktam-red" />
                  User Login
                </Link>

                {/* Admin Login (placed on the side) */}
                <Link
                  to="/login?role=admin"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-black px-3 py-2 rounded-lg transition-colors shadow-sm"
                  title="Hospital & Blood Bank Administration Portal"
                >
                  <Shield className="w-3.5 h-3.5 text-red-400" />
                  Admin Login
                </Link>

                <Link
                  to="/register"
                  className="btn-primary text-xs py-2 px-3.5 ml-1"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 text-gray-600">
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden py-3 border-t border-gray-100 animate-slide-in">
            {navLinks.map(({ path, label }) => (
              <Link
                key={path}
                to={path}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-3 text-sm font-medium rounded-lg mx-2 mb-1 ${
                  path === '/emergency'
                    ? 'bg-raktam-red text-white'
                    : isActive(path)
                    ? 'text-raktam-red bg-raktam-light'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {path === '/emergency' && '🚨 '}{label}
              </Link>
            ))}
            <div className="border-t border-gray-100 mt-2 pt-2 px-2">
              {user ? (
                <>
                  {user.role === 'admin' ? (
                    <Link
                      to="/admin"
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-3 text-sm font-bold text-red-600 bg-red-50 rounded-lg mb-1"
                    >
                      🛡️ Admin Portal
                    </Link>
                  ) : (
                    <Link
                      to="/dashboard"
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-3 text-sm font-bold text-gray-800 bg-gray-50 rounded-lg mb-1"
                    >
                      👤 My User Profile ({user.name})
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="block w-full text-left px-4 py-3 text-sm text-gray-500 hover:text-raktam-red"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login?role=user"
                    onClick={() => setIsOpen(false)}
                    className="block px-4 py-3 text-sm font-bold text-gray-800 hover:bg-gray-50 rounded-lg mb-1"
                  >
                    👤 User Login
                  </Link>
                  <Link
                    to="/login?role=admin"
                    onClick={() => setIsOpen(false)}
                    className="block px-4 py-3 text-sm font-bold text-slate-800 hover:bg-gray-50 rounded-lg mb-1"
                  >
                    🛡️ Admin Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsOpen(false)}
                    className="block px-4 py-3 text-sm font-semibold text-raktam-red border-t border-gray-100 mt-1"
                  >
                    Register as Donor
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
