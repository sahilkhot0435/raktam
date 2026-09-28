import React from 'react';
import { AlertCircle, X, Phone } from 'lucide-react';
import { useSocket } from '../context/SocketContext';

export default function EmergencyBanner() {
  const { emergencyAlerts, dismissAlert } = useSocket();

  if (emergencyAlerts.length === 0) return null;

  return (
    <div className="fixed top-16 left-0 right-0 z-40 space-y-2 px-4 pt-2">
      {emergencyAlerts.slice(0, 3).map((alert, i) => (
        <div
          key={i}
          className="max-w-2xl mx-auto bg-red-600 text-white rounded-xl shadow-2xl p-4 flex items-start gap-3 animate-slide-in emergency-pulse"
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold text-sm">🚨 EMERGENCY: {alert.bloodType} blood needed urgently!</p>
            <p className="text-red-100 text-xs mt-1">{alert.hospital} · {alert.city}</p>
            {alert.contactPhone && (
              <a href={`tel:${alert.contactPhone}`} className="inline-flex items-center gap-1 text-xs text-white font-semibold mt-2 underline">
                <Phone className="w-3 h-3" /> Call: {alert.contactPhone}
              </a>
            )}
          </div>
          <button onClick={() => dismissAlert(i)} className="p-1 hover:bg-red-700 rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
