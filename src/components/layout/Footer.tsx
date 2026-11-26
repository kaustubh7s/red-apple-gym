'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import {
  Dumbbell,
  MapPin,
  Phone,
  Mail,
  Clock,
  Globe,
  Share2,
  ShieldCheck,
  UserCheck,
  ChevronRight,
  Sparkles,
  Camera,
  Star
} from 'lucide-react';

export const Footer: React.FC = () => {
  const { gymSettings, generateWhatsAppLink } = useApp();
  const [showStaffModal, setShowStaffModal] = useState(false);

  return (
    <footer className="bg-[#1A1A1A] text-white border-t border-black/10 pt-16 pb-12 relative overflow-hidden">
      {/* Subtle gold accent divider line */}
      <div className="signature-stripe absolute top-0 left-0 right-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 pb-12 border-b border-white/10">
          {/* Brand Info */}
          <div className="sm:col-span-2 lg:col-span-1 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white p-0.5 shadow-md shadow-[#C41E3A]/20 border border-[#D4A574]/40 overflow-hidden flex items-center justify-center shrink-0">
                <img
                  src="/images/logo.png"
                  alt="Red Apple Gym and Fitness Center"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white font-serif block leading-tight">
                  RED APPLE GYM
                </span>
                <span className="text-[10px] tracking-wider text-[#D4A574] block font-semibold uppercase">
                  AND FITNESS CENTER • CIDCO N-2
                </span>
              </div>
            </div>

            <p className="text-sm text-neutral-300 max-w-sm leading-relaxed">
              Aurangabad’s premier athletic facility engineered for high performers. Founded by Prashant Magre and led by Master Personal Coach Mohaseen Subedar.
            </p>

            <div className="flex items-center gap-2 pt-1 text-xs text-amber-300">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="font-semibold text-white">4.7 Rating</span>
              <span className="text-neutral-400">• 34 Google Reviews</span>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 hover:border-[#D4A574] hover:bg-[#D4A574]/20 hover:text-[#D4A574] text-neutral-300 flex items-center justify-center transition-all"
              >
                <Camera className="w-4 h-4" />
              </a>
              <a
                href={gymSettings.googleMapsUrl || 'https://maps.app.goo.gl/UYPmZrpZEJWEn84F9'}
                target="_blank"
                rel="noreferrer"
                aria-label="Google Maps"
                className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 hover:border-[#D4A574] hover:bg-[#D4A574]/20 hover:text-[#D4A574] text-neutral-300 flex items-center justify-center transition-all"
              >
                <Globe className="w-4 h-4" />
              </a>
              <a
                href={generateWhatsAppLink(gymSettings.whatsapp, 'Hello! I want to inquire about Red Apple Gym.')}
                target="_blank"
                rel="noreferrer"
                aria-label="WhatsApp Share"
                className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 hover:border-[#D4A574] hover:bg-[#D4A574]/20 hover:text-[#D4A574] text-neutral-300 flex items-center justify-center transition-all"
              >
                <Share2 className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Club Experience */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#D4A574]">Club Experience</h4>
            <ul className="space-y-2 text-sm text-neutral-300">
              <li><a href="#about" className="hover:text-white transition-colors">Philosophy & Story</a></li>
              <li><a href="#facilities" className="hover:text-white transition-colors">Equipment & Zones</a></li>
              <li><a href="#trainers" className="hover:text-white transition-colors">Master Coaches</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">Membership Tiers</a></li>
              <li><a href="#transformations" className="hover:text-white transition-colors">Member Transformations</a></li>
              <li><a href="#bmi" className="hover:text-white transition-colors">BMI Diagnostic</a></li>
            </ul>
          </div>

          {/* Timings & Member Services */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#D4A574]">Member Services</h4>
            <ul className="space-y-2 text-sm text-neutral-300">
              <li>
                <Link href="/admission" className="flex items-center gap-1.5 hover:text-white transition-colors">
                  <Sparkles className="w-3.5 h-3.5 text-[#D4A574]" />
                  <span>Online Admission Form</span>
                </Link>
              </li>
              <li>
                <a
                  href={generateWhatsAppLink(gymSettings.whatsapp, 'Hello! Please share VIP day-pass details.')}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#25D366] transition-colors"
                >
                  WhatsApp VIP Concierge
                </a>
              </li>
              <li><a href="#pricing" className="hover:text-white transition-colors">Personal Training Packages</a></li>
              <li><a href="#contact" className="hover:text-white transition-colors">Schedule Personal Visit</a></li>
              <li><a href="#facilities" className="hover:text-white transition-colors">Strength & Cardio Access</a></li>
            </ul>
          </div>

          {/* Location & Sanctuary */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#D4A574]">Club Sanctuary</h4>
            <div className="space-y-2.5 text-xs text-neutral-300">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#C41E3A] shrink-0 mt-0.5" />
                <span className="leading-relaxed">{gymSettings.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#D4A574] shrink-0" />
                <a href={`tel:${gymSettings.phone.replace(/\s+/g, '')}`} className="hover:text-white transition-colors">
                  {gymSettings.phone}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#D4A574] shrink-0" />
                <span>{gymSettings.email}</span>
              </div>
              <div className="flex items-start gap-2 pt-1">
                <Clock className="w-4 h-4 text-[#2E7D32] shrink-0 mt-0.5" />
                <span className="text-[11px] leading-relaxed text-neutral-300">{gymSettings.openHours}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar with hidden staff gateway trigger */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} Red Apple Gym and Fitness Center. All Rights Reserved.</span>
            {/* Discreet Staff Doorway Trigger */}
            <button
              onClick={() => setShowStaffModal(true)}
              className="p-1 rounded-md text-neutral-600 hover:text-[#D4A574] hover:bg-white/5 transition-all opacity-40 hover:opacity-100 focus:outline-none"
              title="Authorized Operations Gateway"
              aria-label="Staff Gateway"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-white cursor-pointer transition-colors">Terms of Membership</span>
            <span className="hover:text-white cursor-pointer transition-colors">Safety Standards</span>
          </div>
        </div>
      </div>

      {/* Discreet Staff Operations Modal */}
      {showStaffModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#1A1A1A] border border-white/10 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-5 text-white relative">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#C41E3A] flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold font-serif text-white">
                    Operations Gateway
                  </h3>
                  <span className="text-[10px] text-[#D4A574] font-mono">
                    Authorized Personnel Only
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowStaffModal(false)}
                className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-neutral-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5">
              <Link
                href="/admin"
                onClick={() => setShowStaffModal(false)}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 hover:bg-[#C41E3A]/20 border border-white/5 hover:border-[#C41E3A]/40 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-[#C41E3A]">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-[#D4A574] transition-colors">
                      Super Admin Command Suite
                    </div>
                    <div className="text-[10px] text-neutral-400">
                      Full dashboard, members &amp; revenue
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
              </Link>

              <Link
                href="/trainer"
                onClick={() => setShowStaffModal(false)}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 hover:bg-blue-500/20 border border-white/5 hover:border-blue-500/40 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors">
                      Coach / Trainer Portal
                    </div>
                    <div className="text-[10px] text-neutral-400">
                      Client workouts &amp; biometrics
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
              </Link>

              <Link
                href="/admission"
                onClick={() => setShowStaffModal(false)}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 hover:bg-[#D4A574]/20 border border-white/5 hover:border-[#D4A574]/40 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-[#D4A574]">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-[#D4A574] transition-colors">
                      Admission Concierge Kiosk
                    </div>
                    <div className="text-[10px] text-neutral-400">
                      Front-desk new athlete registration
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
              </Link>
            </div>

            <div className="text-[10px] text-neutral-500 text-center pt-2 border-t border-white/5">
              Passcode protected • Super Admin &amp; Coach Auth Required
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};
