'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  MessageCircle,
  Sparkles,
  CheckCircle2,
  Users
} from 'lucide-react';

export const ContactSection: React.FC = () => {
  const { gymSettings, generateWhatsAppLink, addNotification } = useApp();
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [interest, setInterest] = useState('Personal Training with Coach Mohaseen');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !mobile) return;

    addNotification({
      title: '📞 New Club Tour Inquiry',
      message: `${name} (${mobile}) requested an inquiry for: ${interest}.`,
      type: 'general',
      targetRole: 'admin'
    });

    setSubmitted(true);
  };

  return (
    <section id="contact" className="py-24 bg-[#F8F6F4] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-[#D4A574]/40 text-[#9E6B32] text-xs font-bold uppercase tracking-wider shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Club Concierge &amp; Visit</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1A1A1A] font-serif tracking-tight">
            Schedule A Personal Visit &amp; Facility Walkthrough
          </h2>
          <p className="text-xs sm:text-sm text-[#666666]">
            Visit our training floor in Cidco N-2 and consult directly with Founder Prashant Magre and Master Coach Mohaseen Subedar.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Contact Details & Interactive Map Mock */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-3xl bg-white border border-black/10 shadow-[0_10px_30px_rgba(0,0,0,0.04)] space-y-4">
              <div>
                <h3 className="text-xl font-bold text-[#1A1A1A] font-serif">
                  Red Apple Gym Information
                </h3>
                <span className="text-xs text-[#8A8A8A]">रेड ॲपल जिम • Cidco N-2, Chhatrapati Sambhajinagar</span>
              </div>

              <div className="space-y-4 text-xs text-[#4A4A4A]">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#C41E3A]/10 border border-[#C41E3A]/20 flex items-center justify-center text-[#C41E3A] shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-[#1A1A1A] block">Club Address</span>
                    <span className="text-[#666666] leading-relaxed">{gymSettings.address}</span>
                    <span className="block text-[11px] font-mono text-[#8B1528] mt-0.5">Plus Code: V9CP+FV Chhatrapati Sambhajinagar</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#D4A574]/15 border border-[#D4A574]/40 flex items-center justify-center text-[#9E6B32] shrink-0">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-[#1A1A1A] block">Leadership &amp; Coaching</span>
                    <span className="text-[#666666] block">Founder: <strong className="text-[#1A1A1A]">Prashant Magre</strong></span>
                    <span className="text-[#666666] block">Master Coach: <strong className="text-[#1A1A1A]">Mohaseen Subedar</strong></span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#D4A574]/15 border border-[#D4A574]/40 flex items-center justify-center text-[#9E6B32] shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-[#1A1A1A] block">Phone &amp; WhatsApp Direct</span>
                    <a href={`tel:${gymSettings.phone.replace(/\s+/g, '')}`} className="text-[#C41E3A] font-semibold hover:underline block">
                      {gymSettings.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-[#1A1A1A] block">Operating Hours</span>
                    <span className="text-[#666666]">{gymSettings.openHours}</span>
                    <span className="block text-[10px] text-emerald-700 font-semibold mt-0.5">Opens 05:00 AM Mon (Sundays Closed)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Google Map Card with Direct Navigation */}
            <div className="relative rounded-3xl overflow-hidden border border-[#D4A574]/40 p-6 bg-white shadow-md group space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#C41E3A]" />
                  <span className="font-bold text-sm text-[#1A1A1A] font-serif">Google Maps Direct Navigation</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  4.7 ★ (34 Reviews)
                </span>
              </div>

              <p className="text-xs text-[#666666] leading-relaxed">
                Located right on Jalna Road, Ram Nagar, N 2, Cidco, Chhatrapati Sambhajinagar.
              </p>

              <a
                href={gymSettings.googleMapsUrl || 'https://maps.app.goo.gl/UYPmZrpZEJWEn84F9'}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 px-4 rounded-xl bg-[#C41E3A] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#8B1528] shadow-md shadow-[#C41E3A]/25 transition-all"
              >
                <MapPin className="w-4 h-4" />
                <span>Get Driving Directions on Google Maps</span>
              </a>
            </div>
          </div>

          {/* Quick Inquiry Form */}
          <div className="lg:col-span-7 p-6 sm:p-10 rounded-3xl bg-white border border-black/10 shadow-[0_15px_45px_rgba(0,0,0,0.05)]">
            {submitted ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#2E7D32] mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-[#1A1A1A] font-serif">
                  Tour Request Received!
                </h3>
                <p className="text-xs sm:text-sm text-[#666666] max-w-md mx-auto">
                  Our concierge will connect with you via WhatsApp to confirm your preferred visit slot.
                </p>
                <div className="pt-4">
                  <a
                    href={generateWhatsAppLink(gymSettings.whatsapp, `Hello! I just requested a visit on your website for ${interest}.`)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#25D366] text-white font-bold text-xs uppercase tracking-wider shadow-md"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Instant WhatsApp Fast-Track</span>
                  </a>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <h3 className="text-2xl font-bold text-[#1A1A1A] font-serif">
                    Request Club Visit &amp; Inquiry
                  </h3>
                  <p className="text-xs text-[#666666] mt-1">
                    Fill out your details below to schedule an in-person walkthrough and membership consultation.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#666666] block mb-1.5">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full px-4 py-3 rounded-xl bg-[#F8F6F4] border border-black/10 focus:border-[#C41E3A] text-[#1A1A1A] text-xs outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#666666] block mb-1.5">
                      Mobile &amp; WhatsApp Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="e.g. +91 98765 43210"
                      className="w-full px-4 py-3 rounded-xl bg-[#F8F6F4] border border-black/10 focus:border-[#C41E3A] text-[#1A1A1A] text-xs outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#666666] block mb-1.5">
                    Primary Fitness Interest
                  </label>
                  <select
                    value={interest}
                    onChange={(e) => setInterest(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#F8F6F4] border border-black/10 focus:border-[#C41E3A] text-[#1A1A1A] text-xs outline-none"
                  >
                    <option value="Personal Training with Coach Mohaseen">Personal Training with Coach Mohaseen</option>
                    <option value="General Strength & Muscle Building">General Strength &amp; Muscle Building</option>
                    <option value="Fat Loss & Cardio Conditioning">Fat Loss &amp; Cardio Conditioning</option>
                    <option value="Annual Membership Privilege">Annual Membership Privilege</option>
                    <option value="Custom Duration Pass">Custom Duration Pass</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-xl bg-[#C41E3A] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#8B1528] shadow-md shadow-[#C41E3A]/25 transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Visit Request</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
