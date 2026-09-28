import React from 'react';
import { Link } from 'react-router-dom';
import { Droplets, Heart, Phone, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-raktam-black text-white">
      {/* Emergency bar */}
      <div className="bg-raktam-red py-3">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-white font-semibold text-sm">🚨 Need blood urgently? Call National Blood Helpline</p>
          <a href="tel:1910" className="text-white font-black text-xl hover:text-red-200 transition-colors">1910</a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-raktam-red rounded-full flex items-center justify-center">
                <Droplets className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-black text-white">रक्तम्</div>
                <div className="text-xs text-red-300">by Avishhkar</div>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              Raktam is a smart blood bank and emergency blood availability system,
              connecting donors with patients across India. Every drop counts.
            </p>
            <div className="flex items-center gap-1 mt-4 text-red-400 text-sm">
              <Heart className="w-4 h-4 fill-current" />
              <span>Made with love by Team Avishhkar</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {[
                ['/search', 'Find Blood'],
                ['/emergency', 'Emergency Request'],
                ['/banks', 'Blood Banks'],
                ['/register', 'Become a Donor'],
                ['/about', 'About Avishhkar'],
              ].map(([path, label]) => (
                <li key={path}>
                  <Link to={path} className="text-gray-400 hover:text-raktam-muted text-sm transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-raktam-red" />
                <a href="tel:1910" className="hover:text-white">1910 (Helpline)</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-raktam-red" />
                <a href="mailto:help@raktam.in" className="hover:text-white">help@raktam.in</a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-raktam-red mt-0.5" />
                <span>India — Serving Nationwide</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-gray-500 text-xs">
          <p>&copy; 2024 Raktam by Avishhkar. All rights reserved.</p>
          <p className="mt-2 sm:mt-0">🩸 Donate blood. Save lives.</p>
        </div>
      </div>
    </footer>
  );
}
