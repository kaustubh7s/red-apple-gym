'use client';

import React, { useState } from 'react';
import { Sparkles, Trophy, ArrowRight, Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';

export const Transformations: React.FC = () => {
  const [selectedIdx, setSelectedIdx] = useState(0);

  const stories = [
    {
      name: 'Rohan Deshmukh',
      role: 'Tech Professional',
      duration: '16 Weeks',
      stats: {
        weightLost: '14.5 kg',
        bodyFatDrop: '28% → 12.4%',
        muscleGained: '+3.8 kg'
      },
      trainer: 'Mohaseen Subedar',
      beforeImg: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80',
      afterImg: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&auto=format&fit=crop&q=80',
      quote: 'Red Apple Gym completely transformed my daily discipline. The science-backed lifting protocols and strict form guidance from Coach Mohaseen Subedar turned my fitness around.'
    },
    {
      name: 'Dr. Tanya Sen',
      role: 'Physician',
      duration: '24 Weeks',
      stats: {
        weightLost: '11.2 kg',
        bodyFatDrop: '31% → 18.2%',
        muscleGained: '+2.4 kg'
      },
      trainer: 'Mohaseen Subedar',
      beforeImg: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&auto=format&fit=crop&q=80',
      afterImg: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&auto=format&fit=crop&q=80',
      quote: 'Working long clinic hours left me with acute posture strain. Coach Mohaseen’s personalized form correction restored my strength and sculpted lean muscle.'
    },
    {
      name: 'Arjun Singhal',
      role: 'Entrepreneur',
      duration: '12 Weeks',
      stats: {
        weightLost: '8.4 kg',
        bodyFatDrop: '22% → 10.8%',
        muscleGained: '+4.5 kg'
      },
      trainer: 'Mohaseen Subedar',
      beforeImg: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&auto=format&fit=crop&q=80',
      afterImg: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&auto=format&fit=crop&q=80',
      quote: 'The friendly atmosphere and co-operative guidance from trainers at Red Apple Gym pushed me past mental barriers. Best shape of my life.'
    }
  ];

  const current = stories[selectedIdx];

  return (
    <section id="transformations" className="py-24 bg-white border-t border-b border-black/[0.06] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F8F6F4] border border-[#D4A574]/40 text-[#9E6B32] text-xs font-bold uppercase tracking-wider shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Athletic Results</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold text-[#1A1A1A] font-serif tracking-tight">
            Real People. Disciplined Transformations.
          </h2>
          <p className="text-sm sm:text-base text-[#666666]">
            No gimmicks or extreme restrictions. Pure biomechanical progression, consistent habit building, and coach accountability.
          </p>
        </div>

        {/* Transformation Showcase */}
        <div className="rounded-3xl bg-[#F8F6F4] border border-[#D4A574]/30 p-6 sm:p-10 shadow-[0_15px_45px_rgba(0,0,0,0.05)]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Visuals Before / After */}
            <div className="lg:col-span-7 grid grid-cols-2 gap-4">
              <div className="relative rounded-2xl overflow-hidden aspect-[3/4] border border-black/10 bg-neutral-200 shadow-md group">
                <img
                  src={current.beforeImg}
                  alt={`${current.name} Before`}
                  className="w-full h-full object-cover filter contrast-90 brightness-95 group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md text-[11px] font-bold text-white border border-white/10">
                  DAY 1 BASELINE
                </div>
              </div>

              <div className="relative rounded-2xl overflow-hidden aspect-[3/4] border-2 border-[#D4A574] bg-neutral-200 shadow-xl group">
                <img
                  src={current.afterImg}
                  alt={`${current.name} After`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-[#C41E3A] text-white text-[11px] font-bold shadow-md">
                  AFTER {current.duration.toUpperCase()}
                </div>
              </div>
            </div>

            {/* Metrics & Story */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-[#9E6B32] mb-1">
                  Guided By Coach {current.trainer}
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] font-serif">
                  {current.name}
                </h3>
                <span className="text-xs text-[#666666]">{current.role} • {current.duration} Program</span>
              </div>

              {/* Stats Highlights */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="p-3.5 rounded-2xl bg-white border border-black/5 text-center shadow-sm">
                  <div className="text-lg sm:text-xl font-bold text-[#C41E3A] font-serif">
                    {current.stats.weightLost}
                  </div>
                  <div className="text-[10px] text-[#666666] font-semibold uppercase">Total Fat Cut</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-black/5 text-center shadow-sm">
                  <div className="text-lg sm:text-xl font-bold text-[#1A1A1A] font-serif">
                    {current.stats.bodyFatDrop}
                  </div>
                  <div className="text-[10px] text-[#666666] font-semibold uppercase">Body Fat %</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-black/5 text-center shadow-sm">
                  <div className="text-lg sm:text-xl font-bold text-[#9E6B32] font-serif">
                    {current.stats.muscleGained}
                  </div>
                  <div className="text-[10px] text-[#666666] font-semibold uppercase">Lean Mass</div>
                </div>
              </div>

              {/* Quote */}
              <div className="p-4 rounded-2xl bg-white border border-[#D4A574]/30 text-xs sm:text-sm text-[#4A4A4A] italic relative leading-relaxed shadow-sm">
                <Quote className="w-6 h-6 text-[#D4A574]/40 absolute top-2 right-3 pointer-events-none" />
                "{current.quote}"
              </div>

              {/* Story Navigator */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-1.5">
                  {stories.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedIdx(idx)}
                      className={`h-2 rounded-full transition-all ${
                        selectedIdx === idx ? 'w-8 bg-[#C41E3A]' : 'w-2 bg-black/20'
                      }`}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedIdx((prev) => (prev === 0 ? stories.length - 1 : prev - 1))}
                    className="p-2.5 rounded-xl bg-white hover:bg-neutral-100 text-[#1A1A1A] border border-black/10 shadow-sm"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setSelectedIdx((prev) => (prev === stories.length - 1 ? 0 : prev + 1))}
                    className="p-2.5 rounded-xl bg-white hover:bg-neutral-100 text-[#1A1A1A] border border-black/10 shadow-sm"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
