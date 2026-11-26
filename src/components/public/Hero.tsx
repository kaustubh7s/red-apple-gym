'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import {
  Sparkles,
  ArrowRight,
  MessageCircle,
  Award,
  Zap,
  Star,
  MapPin,
  Clock,
  Shield
} from 'lucide-react';

export const Hero: React.FC = () => {
  const { gymSettings, generateWhatsAppLink } = useApp();

  return (
    <section className="relative min-h-[92vh] flex items-center justify-center pt-32 pb-20 overflow-hidden bg-[#F8F6F4]">
      {/* Background Visual Layer */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Soft Warm Ambient Lighting */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[550px] bg-gradient-to-br from-[#D4A574]/15 via-[#C41E3A]/5 to-transparent rounded-full blur-[140px]" />
        <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-[#D4A574]/10 rounded-full blur-[160px]" />

        {/* Hero Background image with real gym photo */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-[0.14] mix-blend-multiply scale-105"
          style={{
            backgroundImage: `url('/images/gym-1.jpg')`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#F8F6F4]/90 via-[#F8F6F4]/70 to-[#F8F6F4]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full text-center">
        {/* Brand Logo Showcase */}
        <div className="mb-6 flex justify-center">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white p-2 shadow-2xl shadow-[#C41E3A]/20 border border-[#D4A574]/40 hover:scale-105 transition-transform duration-300">
            <img
              src="/images/logo.png"
              alt="Red Apple Gym and Fitness Center"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Top Eyebrow Tag */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-[#D4A574]/40 shadow-sm backdrop-blur-md mb-6">
          <div className="flex text-amber-500">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#1A1A1A]">
            4.7 ★ Google Rating • 34 Reviews • Cidco N-2, Ram Nagar
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#C41E3A]/10 text-[#C41E3A] font-bold">
            Verified
          </span>
        </div>

        {/* Master Editorial Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#1A1A1A] max-w-5xl mx-auto font-serif leading-[1.15] mb-5">
          RED APPLE GYM AND FITNESS CENTER
        </h1>

        {/* Subtitle & Brand Heritage */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <span className="h-px w-8 bg-[#D4A574]" />
          <span className="text-base sm:text-xl font-bold text-[#8B1528] uppercase tracking-wider">
            AND FITNESS CENTER • CIDCO N-2
          </span>
          <span className="h-px w-8 bg-[#D4A574]" />
        </div>

        {/* Master Subheadline */}
        <p className="text-base sm:text-lg text-[#4A4A4A] font-normal max-w-3xl mx-auto mb-4 leading-relaxed">
          Chhatrapati Sambhajinagar’s premier fitness sanctuary. Founded by <strong className="text-[#1A1A1A] font-semibold">Prashant Magre</strong> with personalized biometric conditioning by Master Coach <strong className="text-[#1A1A1A] font-semibold">Mohaseen Subedar</strong>.
        </p>
        <p className="text-xs sm:text-sm text-[#8A8A8A] max-w-xl mx-auto mb-10 flex items-center justify-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-[#C41E3A]" />
          <span>Jalna Road, Ram Nagar, Cidco N-2, Chhatrapati Sambhajinagar</span>
        </p>

        {/* Master Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-2xl mx-auto mb-16">
          <Link
            href="/admission"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-[#C41E3A] to-[#9E1228] text-white font-bold text-sm tracking-wide shadow-xl shadow-[#C41E3A]/25 hover:shadow-[#C41E3A]/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group"
          >
            <span>Apply for Membership</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>

          <a
            href="#pricing"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white hover:bg-neutral-50 text-[#1A1A1A] font-bold text-sm tracking-wide border border-[#D4A574]/60 shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <span>Explore Tiers &amp; Pricing</span>
          </a>

          <a
            href={generateWhatsAppLink(gymSettings.whatsapp, 'Hello! I want to inquire about membership packages at Red Apple Gym (Cidco N-2).')}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] font-bold text-sm tracking-wide border border-[#25D366]/30 transition-all flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-4 h-4 text-[#25D366]" />
            <span>WhatsApp Concierge</span>
          </a>
        </div>

        {/* Feature Badges Grid with Premium Finish */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
          <div className="p-4 rounded-2xl bg-white/90 border border-black/5 shadow-[0_8px_25px_rgba(0,0,0,0.04)] hover:border-[#C41E3A]/30 transition-all">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-700 shrink-0 mb-3">
              <Star className="w-5 h-5 fill-amber-400 text-amber-500" />
            </div>
            <div className="text-base font-bold text-[#1A1A1A] font-serif">4.7 ★ Rated</div>
            <div className="text-xs text-[#666666]">34 Google Reviews</div>
          </div>

          <div className="p-4 rounded-2xl bg-white/90 border border-black/5 shadow-[0_8px_25px_rgba(0,0,0,0.04)] hover:border-[#C41E3A]/30 transition-all">
            <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200/60 flex items-center justify-center text-[#C41E3A] shrink-0 mb-3">
              <Award className="w-5 h-5" />
            </div>
            <div className="text-base font-bold text-[#1A1A1A] font-serif">Mohaseen Subedar</div>
            <div className="text-xs text-[#666666]">Master Personal Coach</div>
          </div>

          <div className="p-4 rounded-2xl bg-white/90 border border-black/5 shadow-[0_8px_25px_rgba(0,0,0,0.04)] hover:border-[#C41E3A]/30 transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-700 shrink-0 mb-3">
              <Clock className="w-5 h-5" />
            </div>
            <div className="text-base font-bold text-[#1A1A1A] font-serif">Opens 05:00 AM</div>
            <div className="text-xs text-[#666666]">Mon - Sat Schedules</div>
          </div>

          <div className="p-4 rounded-2xl bg-white/90 border border-black/5 shadow-[0_8px_25px_rgba(0,0,0,0.04)] hover:border-[#C41E3A]/30 transition-all">
            <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200/60 flex items-center justify-center text-orange-700 shrink-0 mb-3">
              <Shield className="w-5 h-5" />
            </div>
            <div className="text-base font-bold text-[#1A1A1A] font-serif">Cidco N-2</div>
            <div className="text-xs text-[#666666]">Ram Nagar Sanctuary</div>
          </div>
        </div>
      </div>
    </section>
  );
};
