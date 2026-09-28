import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Search, Phone, Clock, MapPin, CheckCircle, Loader2 } from 'lucide-react';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const CITIES = ['', 'Mumbai', 'Delhi', 'Bengaluru', 'Chennai', 'Pune', 'Kolkata', 'Hyderabad', 'Ahmedabad'];

export default function BloodBankDirectory() {
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState('');
  const [query, setQuery] = useState('');

  useEffect(() => {
    axios.get('/api/banks', { params: city ? { city } : {} })
      .then(res => setBanks(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [city]);

  const filtered = banks.filter(b =>
    !query || b.name.toLowerCase().includes(query.toLowerCase()) || b.city.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-raktam-black to-red-900 text-white py-14">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-black mb-2">Blood Bank Directory</h1>
          <p className="text-red-200">Find verified blood banks and their current stock across India</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-6">
        <div className="card shadow-lg flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input value={query} onChange={e => setQuery(e.target.value)} className="input-field pl-10" placeholder="Search blood banks..." />
          </div>
          <select value={city} onChange={e => setCity(e.target.value)} className="input-field sm:w-48">
            {CITIES.map(c => <option key={c} value={c}>{c || 'All Cities'}</option>)}
          </select>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-10 h-10 text-raktam-red animate-spin" /></div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">{filtered.length} blood banks found</p>
            <div className="grid md:grid-cols-2 gap-4">
              {filtered.map(bank => (
                <div key={bank._id} className="card hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-gray-900">{bank.name}</h3>
                        {bank.isVerified && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">✓ Verified</span>}
                      </div>
                      <div className="flex items-start gap-1 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-gray-500">{bank.address}, {bank.city}, {bank.state}</p>
                      </div>
                    </div>
                  </div>

                  {/* Blood stock */}
                  <div className="grid grid-cols-4 gap-1 mb-4">
                    {BLOOD_TYPES.map(bt => {
                      const entry = bank.stock?.find(s => s.bloodType === bt);
                      const units = entry?.units || 0;
                      const color = units > 15 ? 'bg-green-500' : units > 5 ? 'bg-yellow-500' : units > 0 ? 'bg-orange-500' : 'bg-gray-200';
                      return (
                        <div key={bt} className="text-center">
                          <div className={`${color} text-white text-xs font-bold rounded-md py-1`}>{bt}</div>
                          <p className="text-xs text-gray-500 mt-0.5">{units}u</p>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="w-3 h-3" /> {bank.operatingHours || '24/7'}
                    </div>
                    <a href={`tel:${bank.phone}`} className="flex items-center gap-2 bg-raktam-red text-white text-xs font-semibold px-3 py-2 rounded-lg">
                      <Phone className="w-3.5 h-3.5" /> {bank.phone}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
