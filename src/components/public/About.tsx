'use client';

import React from 'react';
import { ShieldCheck, Target, Trophy, Sparkles, CheckCircle2, Dumbbell, Star, HeartHandshake, Phone } from 'lucide-react';

export const About: React.FC = () => {
  return (
    <section id="about" className="py-24 bg-white border-t border-b border-black/[0.06] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Visual Collage */}
          <div className="lg:col-span-6 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Warm glow behind */}
              <div className="absolute -inset-4 bg-gradient-to-r from-[#D4A574]/25 to-[#C41E3A]/15 rounded-3xl blur-2xl opacity-60" />

              {/* Main Image - Owner */}
              <div className="relative rounded-3xl overflow-hidden border border-[#D4A574]/40 shadow-2xl bg-neutral-900 aspect-[4/5] group">
                <img
                  src="/images/owner.jpg"
                  alt="Prashant Magre - Founder & Owner of Red Apple Gym and Fitness Center"
                  className="w-full h-full object-cover object-top transition-all duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

                {/* Owner Overlay Label */}
                <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-black/75 backdrop-blur-md border border-white/10 text-white">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#C41E3A] animate-pulse" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#D4A574]">Gym Founder &amp; Owner</span>
                    </div>
                    <a
                      href="tel:+918551919595"
                      className="text-[11px] font-mono font-bold text-[#D4A574] hover:text-white transition-colors flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded-full"
                    >
                      <Phone className="w-3 h-3 text-[#D4A574]" />
                      <span>+91 85519 19595</span>
                    </a>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold font-serif text-white mt-1">Prashant Magre</h3>
                  <p className="text-[10px] text-neutral-300 font-semibold uppercase tracking-wider">
                    AND FITNESS CENTER • CIDCO N-2
                  </p>
                </div>
              </div>

              {/* Floating Achievement Card */}
              <div className="sm:absolute relative mt-4 sm:mt-0 sm:-bottom-6 sm:-right-4 p-4 sm:p-5 rounded-2xl bg-white/95 backdrop-blur-xl border border-[#D4A574]/40 shadow-xl max-w-full sm:max-w-xs z-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-700 shrink-0">
                    <Trophy className="w-5 h-5 text-[#B38048]" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-[#8A8A8A]">Google Verified</div>
                    <div className="text-sm font-bold text-[#1A1A1A] font-serif">4.7 ★ Rated Athletic Club</div>
                  </div>
                </div>
                <p className="text-xs text-[#666666] leading-snug">
                  Chhatrapati Sambhajinagar&apos;s trusted fitness center for discipline, high energy &amp; genuine human transformation.
                </p>
              </div>
            </div>
          </div>

          {/* Right Content */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F8F6F4] border border-[#D4A574]/40 text-[#9E6B32] text-xs font-bold uppercase tracking-wider shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>The Red Apple Philosophy</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold text-[#1A1A1A] font-serif tracking-tight leading-tight">
              A Warm, Disciplined Space For Real Human Transformations.
            </h2>

            <div className="space-y-4 text-sm sm:text-base text-[#4A4A4A] leading-relaxed font-normal">
              <p>
                Founded by <strong className="text-[#1A1A1A]">Prashant Magre</strong>, <strong className="text-[#C41E3A]">Red Apple Gym and Fitness Center</strong> was created with a clear mission: to provide the people of Chhatrapati Sambhajinagar with an elevated, supportive fitness sanctuary free from chaotic distractions.
              </p>
              <p className="text-[#666666]">
                Under the coaching leadership of Master Personal Coach <strong className="text-[#1A1A1A]">Mohaseen Subedar</strong>, every member receives thoughtful guidance, correct biomechanical form instruction, and consistent motivation to reach their personal peak conditioning.
              </p>
            </div>

            {/* Mission & Key Points */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#F8F6F4] border border-black/5">
                <CheckCircle2 className="w-4 h-4 text-[#C41E3A] shrink-0 mt-0.5" />
                <div className="text-xs text-[#4A4A4A]">
                  <span className="font-bold text-[#1A1A1A] block">Personalized Guidance</span>
                  Tailored workouts by Coach Mohaseen Subedar.
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#F8F6F4] border border-black/5">
                <CheckCircle2 className="w-4 h-4 text-[#C41E3A] shrink-0 mt-0.5" />
                <div className="text-xs text-[#4A4A4A]">
                  <span className="font-bold text-[#1A1A1A] block">Great Atmosphere</span>
                  Respectful, clean, motivating workout environment.
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#F8F6F4] border border-black/5">
                <CheckCircle2 className="w-4 h-4 text-[#C41E3A] shrink-0 mt-0.5" />
                <div className="text-xs text-[#4A4A4A]">
                  <span className="font-bold text-[#1A1A1A] block">05:00 AM Dawn Access</span>
                  Early morning &amp; evening flexible slots.
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#F8F6F4] border border-black/5">
                <CheckCircle2 className="w-4 h-4 text-[#C41E3A] shrink-0 mt-0.5" />
                <div className="text-xs text-[#4A4A4A]">
                  <span className="font-bold text-[#1A1A1A] block">WhatsApp Concierge</span>
                  Automated renewal alerts &amp; live support.
                </div>
              </div>
            </div>

            {/* Numbers Row */}
            <div className="pt-4 grid grid-cols-3 gap-4 border-t border-black/10">
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-[#C41E3A] font-serif">4.7 ★</div>
                <div className="text-xs text-[#8A8A8A] font-medium">Google Rating</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] font-serif">34+</div>
                <div className="text-xs text-[#8A8A8A] font-medium">Verified Reviews</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-[#9E6B32] font-serif">Cidco N-2</div>
                <div className="text-xs text-[#8A8A8A] font-medium">Ram Nagar Location</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
