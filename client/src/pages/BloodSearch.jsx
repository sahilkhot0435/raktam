import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Search, MapPin, Loader2, AlertCircle, Navigation } from 'lucide-react';
import BloodTypeCard from '../components/BloodTypeCard';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const CITIES = ['Mumbai', 'Delhi', 'Bengaluru', 'Chennai', 'Pune', 'Kolkata', 'Hyderabad', 'Ahmedabad'];

export default function BloodSearch() {
  const [searchParams] = useSearchParams();
  const [bloodType, setBloodType] = useState(searchParams.get('bloodType') || '');
  const [city, setCity] = useState('');
  const [useGeo, setUseGeo] = useState(false);
  const [coords, setCoords] = useState(null);
  const [results, setResults] = useState([]);
  const [searchRadius, setSearchRadius] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (searchParams.get('bloodType')) handleSearch(null, searchParams.get('bloodType'));
  }, []);

  const getUserLocation = () => {
    if (!navigator.geolocation) return alert('Geolocation not supported');
    navigator.geolocation.getCurrentPosition(
      pos => { setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setUseGeo(true); },
      () => alert('Could not get your location')
    );
  };

  const handleSearch = async (e, overrideBloodType) => {
    if (e) e.preventDefault();
    const bt = overrideBloodType || bloodType;
    if (!bt) return setError('Please select a blood type');
    setError('');
    setLoading(true);
    setSearched(true);

    try {
      const params = { bloodType: bt };
      if (coords && useGeo) { params.lat = coords.lat; params.lng = coords.lng; }
      else if (city) params.city = city;

      const res = await axios.get('/api/blood/search', { params });
      setResults(res.data.results || []);
      setSearchRadius(res.data.searchRadius);
    } catch (err) {
      setError('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-raktam-black to-red-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-black mb-3">Find Blood Near You</h1>
          <p className="text-red-200">Smart radius-based search — starts local, expands until found</p>
        </div>
      </div>

      {/* Search Form */}
      <div className="max-w-4xl mx-auto px-4 -mt-8">
        <form onSubmit={handleSearch} className="card shadow-xl">
          <div className="grid sm:grid-cols-3 gap-4">
            {/* Blood Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Blood Type *</label>
              <div className="grid grid-cols-4 gap-2">
                {BLOOD_TYPES.map(bt => (
                  <button
                    key={bt}
                    type="button"
                    onClick={() => setBloodType(bt)}
                    className={`py-2 rounded-lg text-sm font-bold transition-all ${
                      bloodType === bt ? 'bg-raktam-red text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {bt}
                  </button>
                ))}
              </div>
            </div>

            {/* Location */}
            <div className="sm:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
              <select
                value={city}
                onChange={e => { setCity(e.target.value); setUseGeo(false); }}
                className="input-field"
              >
                <option value="">Select city</option>
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <button
                type="button"
                onClick={getUserLocation}
                className="mt-2 w-full flex items-center justify-center gap-2 text-xs text-raktam-red border border-raktam-red rounded-lg py-2 hover:bg-raktam-light transition-colors"
              >
                <Navigation className="w-3 h-3" />
                {useGeo && coords ? '✅ Location captured' : 'Use my location (GPS)'}
              </button>
            </div>

            {/* Search btn */}
            <div className="flex flex-col justify-end">
              <button type="submit" disabled={loading} className="btn-primary flex items-center justify-center gap-2 h-12">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-4 flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4" /> {error}
            </div>
          )}
        </form>
      </div>

      {/* Results */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {searched && !loading && (
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold text-gray-900">
              {results.length > 0 ? `${results.length} Blood Banks Found` : 'No Results Found'}
            </h2>
            {searchRadius && (
              <span className="text-sm text-gray-500 bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200">
                Within {searchRadius} km radius
              </span>
            )}
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center py-16 gap-4">
            <div className="w-12 h-12 border-4 border-raktam-red border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500">Searching nearby blood banks...</p>
          </div>
        )}

        {!loading && searched && results.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🩸</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No {bloodType} blood found</h3>
            <p className="text-gray-500 mb-6">We searched a wide radius but couldn't find stock right now.</p>
            <a href="/emergency" className="btn-primary inline-block">Submit Emergency Request</a>
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-4">
          {results.map(bank => (
            <BloodTypeCard key={bank._id} bank={bank} bloodType={bloodType} />
          ))}
        </div>
      </div>
    </div>
  );
}
