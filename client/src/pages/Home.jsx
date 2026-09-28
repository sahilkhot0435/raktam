import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Droplets, Search, AlertCircle, Hospital, Users, Heart, ArrowRight, CheckCircle } from 'lucide-react';
import StockOverview from '../components/StockOverview';
import EmergencyBanner from '../components/EmergencyBanner';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function Home() {
  const [overview, setOverview] = useState(null);
  const [stats, setStats] = useState({ totalBanks: 0 });
  const [selectedBlood, setSelectedBlood] = useState('');

  useEffect(() => {
    axios.get('/api/blood/overview')
      .then(res => { setOverview(res.data.overview); setStats({ totalBanks: res.data.totalBanks }); })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen">
      <EmergencyBanner />

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-raktam-black via-red-950 to-raktam-dark min-h-[90vh] flex items-center overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-72 h-72 bg-red-400 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-red-600 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-red-900/50 text-red-300 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-red-800">
                <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                Live Blood Availability System
              </div>
              <h1 className="text-5xl md:text-6xl font-black text-white leading-tight">
                <span className="text-raktam-muted">रक्तम्</span><br />
                Every Drop<br />
                <span className="text-raktam-red">Counts.</span>
              </h1>
              <p className="mt-6 text-gray-300 text-lg leading-relaxed">
                India's smart blood bank network. Find the right blood group near you,
                request emergency supply, and connect with verified donors — instantly.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link to="/search" className="btn-primary inline-flex items-center gap-2 text-center justify-center">
                  <Search className="w-5 h-5" /> Find Blood Now
                </Link>
                <Link to="/emergency" className="inline-flex items-center gap-2 border-2 border-red-400 text-red-300 hover:bg-red-900/40 font-semibold py-3 px-6 rounded-lg transition-all justify-center">
                  <AlertCircle className="w-5 h-5" /> Emergency Request
                </Link>
              </div>
              <div className="mt-8 flex items-center gap-6 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Free to use</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Real-time stock</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Nationwide</span>
                </div>
              </div>
            </div>

            {/* Quick blood type selector */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-8">
              <h2 className="text-white font-bold text-lg mb-4">Quick Blood Search</h2>
              <p className="text-gray-300 text-sm mb-6">Select your blood type to find availability near you</p>
              <div className="grid grid-cols-4 gap-3 mb-6">
                {BLOOD_TYPES.map(bt => (
                  <button
                    key={bt}
                    onClick={() => setSelectedBlood(bt)}
                    className={`py-3 rounded-xl font-black text-sm transition-all ${
                      selectedBlood === bt
                        ? 'bg-raktam-red text-white shadow-lg scale-105'
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    {bt}
                  </button>
                ))}
              </div>
              <Link
                to={selectedBlood ? `/search?bloodType=${selectedBlood}` : '/search'}
                className="w-full btn-primary flex items-center justify-center gap-2"
              >
                Search {selectedBlood || 'Blood'} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-raktam-light border-y border-red-100">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { icon: <Hospital className="w-8 h-8" />, value: stats.totalBanks, label: 'Blood Banks', suffix: '+' },
            { icon: <Users className="w-8 h-8" />, value: '5000', label: 'Registered Donors', suffix: '+' },
            { icon: <Droplets className="w-8 h-8" />, value: '12000', label: 'Units Available', suffix: '+' },
            { icon: <Heart className="w-8 h-8" />, value: '3200', label: 'Lives Saved', suffix: '+' },
          ].map((stat, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="text-raktam-red">{stat.icon}</div>
              <div className="text-4xl font-black text-gray-900">{stat.value}{stat.suffix}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Blood Stock Overview */}
      {overview && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-black text-gray-900">Live Blood Stock Overview</h2>
              <p className="text-gray-500 mt-2">Aggregated units across all partner blood banks</p>
            </div>
            <StockOverview overview={overview} />
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="py-16 bg-raktam-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900">How Raktam Works</h2>
            <p className="text-gray-500 mt-2">Finding blood in an emergency is now a matter of seconds</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', icon: '🔍', title: 'Search by Blood Type', desc: 'Enter the blood type and your location. Raktam searches nearby blood banks first, then expands the radius automatically.' },
              { step: '02', icon: '🚨', title: 'Emergency Request', desc: 'Submit an emergency request. Our system instantly finds matching donors in your area and contacts nearby blood banks.' },
              { step: '03', icon: '🤝', title: 'Connect & Save', desc: 'Get a list of available donors and banks with direct contact numbers. One call and the blood is on its way.' },
            ].map(({ step, icon, title, desc }) => (
              <div key={step} className="card relative overflow-hidden">
                <div className="absolute top-4 right-4 text-6xl font-black text-gray-100">{step}</div>
                <div className="text-4xl mb-4">{icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-raktam-red">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Heart className="w-16 h-16 text-white mx-auto mb-6 fill-current" />
          <h2 className="text-4xl font-black text-white mb-4">Be a Hero. Donate Blood.</h2>
          <p className="text-red-200 text-lg mb-8">One donation can save up to 3 lives. Register as a donor today and be part of the Raktam network.</p>
          <Link to="/register" className="inline-flex items-center gap-2 bg-white text-raktam-red font-bold py-4 px-10 rounded-xl hover:bg-red-50 transition-all shadow-lg text-lg">
            Register as Donor <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
