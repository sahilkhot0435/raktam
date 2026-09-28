import React from 'react';
import { Droplets } from 'lucide-react';

const BLOOD_TYPES = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

export default function StockOverview({ overview }) {
  if (!overview) return null;

  const maxUnits = Math.max(...Object.values(overview), 1);

  return (
    <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
      {BLOOD_TYPES.map(bt => {
        const units = overview[bt] || 0;
        const pct = Math.round((units / maxUnits) * 100);
        const color = pct > 60 ? 'bg-green-500' : pct > 30 ? 'bg-yellow-500' : pct > 0 ? 'bg-orange-500' : 'bg-gray-300';

        return (
          <div key={bt} className="flex flex-col items-center gap-2">
            <div className="w-full bg-gray-100 rounded-full overflow-hidden h-20 flex flex-col justify-end relative">
              <div
                className={`${color} w-full transition-all duration-700 rounded-b-full`}
                style={{ height: `${Math.max(pct, 5)}%` }}
              />
            </div>
            <div className="text-center">
              <p className="font-black text-raktam-red text-sm">{bt}</p>
              <p className="text-xs text-gray-500">{units}u</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
