import React from 'react';

const STATUS_CONFIG = {
  available: { label: 'Available', className: 'bg-green-100 text-green-800 border-green-200', dot: 'bg-green-500' },
  low: { label: 'Low Stock', className: 'bg-yellow-100 text-yellow-800 border-yellow-200', dot: 'bg-yellow-500' },
  critical: { label: 'Critical', className: 'bg-orange-100 text-orange-800 border-orange-200', dot: 'bg-orange-500' },
  unavailable: { label: 'Unavailable', className: 'bg-gray-100 text-gray-500 border-gray-200', dot: 'bg-gray-400' },
};

export default function BloodTypeCard({ bank, bloodType }) {
  const stockEntry = bank.stock?.find(s => s.bloodType === bloodType);
  const units = stockEntry?.units ?? bank.units ?? 0;
  const status = bank.status || (units > 15 ? 'available' : units > 5 ? 'low' : units > 0 ? 'critical' : 'unavailable');
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.unavailable;

  return (
    <div className="card hover:shadow-lg transition-shadow border border-gray-100">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {bank.isVerified && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">✓ Verified</span>}
          </div>
          <h3 className="font-semibold text-gray-900 mt-1 leading-tight">{bank.name}</h3>
          <p className="text-sm text-gray-500 mt-1">{bank.address}</p>
          <p className="text-xs text-gray-400">{bank.city}, {bank.state}</p>
        </div>
        <div className="ml-4 text-center">
          <div className="w-14 h-14 bg-raktam-red rounded-full flex items-center justify-center text-white font-black text-sm shadow-md">
            {bloodType}
          </div>
          <p className="text-xs text-gray-500 mt-1">{units} units</p>
        </div>
      </div>

      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${config.className}`}>
        <span className={`w-2 h-2 rounded-full ${config.dot}`}></span>
        {config.label}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-xs text-gray-500">
          <span className="font-medium">⏰</span> {bank.operatingHours || '24/7'}
        </div>
        <a
          href={`tel:${bank.phone}`}
          className="flex items-center gap-1.5 bg-raktam-red text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-raktam-dark transition-colors"
        >
          📞 {bank.phone}
        </a>
      </div>
    </div>
  );
}
