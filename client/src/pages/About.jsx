import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Target, Users, Zap, ArrowRight, Github, Mail } from 'lucide-react';


          // <p className="text-xl text-red-200 mb-2">A project by <span className="font-black text-white">Avishhkar</span></p>

export default function About() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="bg-gradient-to-br from-raktam-black to-red-950 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="text-6xl mb-6">🩸</div>
          <h1 className="text-5xl font-black mb-4">रक्तम्</h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto leading-relaxed mt-4">
            Raktam is a smart blood bank and emergency blood availability system built to bridge the critical gap
            between blood donors and patients in need across India.
          </p>
        </div>
      </div>

      {/* Mission */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-black text-gray-900 mb-4">Our Mission</h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                Every year, thousands of lives are lost in India due to unavailability of blood at the right time
                and the right place. Raktam was built to solve this — by creating a real-time, location-aware
                blood bank network that anyone can access instantly.
              </p>
              <p className="text-gray-600 leading-relaxed">
                From a patient in an ICU needing O-negative blood urgently, to a hospital managing its blood stock
                dashboard — Raktam connects the dots.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: <Zap className="w-6 h-6" />, title: 'Instant Matching', desc: 'Find donors within seconds using smart radius-based search' },
                { icon: <Target className="w-6 h-6" />, title: 'Location-Aware', desc: 'GPS-powered search that starts local and expands automatically' },
                { icon: <Users className="w-6 h-6" />, title: 'Community Driven', desc: 'Powered by thousands of registered volunteer donors' },
                { icon: <Heart className="w-6 h-6" />, title: 'Life Saving', desc: 'Every connection made can save up to 3 lives' },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="card border border-red-100">
                  <div className="text-raktam-red mb-3">{icon}</div>
                  <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
                  <p className="text-xs text-gray-500">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* About Avishhkar */}
      <section className="py-16 bg-raktam-light">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-black text-gray-900 mb-4">About Avishhkar</h2>
          <p className="text-gray-600 leading-relaxed max-w-2xl mx-auto mb-8">
            <strong>Avishhkar</strong> (Sanskrit: Discovery) is a student innovation project focused on building
            technology solutions for real-world problems in India. Raktam is our flagship project — a smart
            healthcare infrastructure tool built with modern web technologies and a mission-first approach.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="btn-primary inline-flex items-center gap-2">
              Join as Donor <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="mailto:help@raktam.in" className="btn-outline inline-flex items-center gap-2">
              <Mail className="w-4 h-4" /> Contact Us
            </a>
          </div>
        </div>
      </section>

      {/* Tech stack */}
      <section className="py-12 bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-400 mb-6">Built with</p>
          <div className="flex flex-wrap justify-center gap-3">
            {['React', 'Node.js', 'Express', 'MongoDB', 'Socket.io', 'Tailwind CSS', 'Vite'].map(tech => (
              <span key={tech} className="bg-gray-100 text-gray-700 text-sm font-medium px-4 py-2 rounded-full">{tech}</span>
            ))}
          </div>
          <p className="text-gray-400 text-xs mt-6">&copy; 2024 Avishhkar. Made with ❤️ for India.</p>
        </div>
      </section>
    </div>
  );
}
