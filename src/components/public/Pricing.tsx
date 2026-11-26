'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import { Check, Sparkles, ArrowRight, Clock, Award, Dumbbell, Activity } from 'lucide-react';
import { MembershipCategory } from '@/lib/types';

export const Pricing: React.FC = () => {
  const { membershipPlans } = useApp();
  const [activeCategory, setActiveCategory] = useState<MembershipCategory>('Gym Only');

  return (
    <section id="pricing" className="py-24 bg-[#F8F6F4] relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-[#D4A574]/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-[#D4A574]/40 text-[#9E6B32] text-xs font-bold uppercase tracking-wider shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Investment Portfolios</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold text-[#1A1A1A] font-serif tracking-tight">
            Transparent Athletic Memberships
          </h2>
          <p className="text-sm sm:text-base text-[#666666]">
            Guaranteed Olympic-grade equipment access, certified coaching by Master Trainer Mohaseen Subedar, and transparent pricing.
          </p>
        </div>

        {/* 2 Types of Membership Category Switcher */}
        <div className="flex justify-center mb-12">
          <div className="p-1.5 rounded-2xl bg-neutral-200/80 border border-black/5 flex items-center gap-1 shadow-inner max-w-md w-full">
            <button
              type="button"
              onClick={() => setActiveCategory('Gym Only')}
              className={`flex-1 py-2.5 sm:py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeCategory === 'Gym Only'
                  ? 'bg-white text-[#1A1A1A] shadow-md'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Dumbbell className="w-4 h-4 text-[#C41E3A]" />
              <span>Gym Only</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory('Gym + Cardio')}
              className={`flex-1 py-2.5 sm:py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeCategory === 'Gym + Cardio'
                  ? 'bg-gradient-to-r from-[#C41E3A] to-[#8B1528] text-white shadow-md'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Gym + Cardio</span>
              <span className="text-[9px] bg-amber-300 text-neutral-900 px-1.5 py-0.2 rounded font-mono font-bold">
                POPULAR
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {membershipPlans.map((plan) => {
            const isAnnual = plan.type === 'Annual' || plan.badge === 'MOST POPULAR';
            const currentPrice = activeCategory === 'Gym + Cardio' ? plan.gymCardioPrice : plan.gymOnlyPrice;

            return (
              <div
                key={plan.id}
                className={`rounded-3xl p-7 flex flex-col justify-between transition-all duration-300 relative ${
                  isAnnual
                    ? 'premium-card-gold shadow-[0_20px_60px_rgba(212,165,116,0.22)] scale-[1.03] z-10'
                    : 'premium-card premium-card-hover'
                }`}
              >
                {/* Popular / Best Value Ribbon */}
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-[#D4A574] to-[#B38048] text-white text-[11px] font-bold tracking-wider uppercase shadow-md flex items-center gap-1.5 whitespace-nowrap">
                    <Award className="w-3 h-3" />
                    <span>{plan.badge}</span>
                  </div>
                )}

                <div>
                  {/* Plan Name & Tag */}
                  <div className="flex items-center justify-between mb-1 mt-1">
                    <h3 className="text-xl sm:text-2xl font-bold text-[#1A1A1A] font-serif">
                      {plan.name}
                    </h3>
                  </div>

                  <div className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#C41E3A]/10 text-[#C41E3A] mb-3">
                    {activeCategory === 'Gym + Cardio' ? (
                      <>
                        <Activity className="w-3 h-3" />
                        <span>Gym + Cardio Deck</span>
                      </>
                    ) : (
                      <>
                        <Dumbbell className="w-3 h-3" />
                        <span>Gym Floor Access</span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-[#8B1528] font-semibold mb-5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Duration: {plan.durationLabel} Unrestricted</span>
                  </div>

                  {/* Price Block */}
                  <div className="pb-5 border-b border-black/5 mb-5">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl sm:text-4xl font-bold text-[#1A1A1A] font-serif">
                        ₹{currentPrice.toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs text-[#8A8A8A]">/ {plan.durationLabel}</span>
                    </div>
                    <p className="text-[11px] text-[#71717A] mt-1.5">
                      {plan.description}
                    </p>
                  </div>

                  {/* Features List */}
                  <div className="space-y-2.5 mb-7">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-[#8A8A8A]">
                      Included Privileges:
                    </div>
                    {plan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-[#4A4A4A]">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                          isAnnual ? 'bg-[#D4A574]/20 text-[#8B5A2B]' : 'bg-[#C41E3A]/10 text-[#C41E3A]'
                        }`}>
                          <Check className="w-3 h-3" />
                        </div>
                        <span className="leading-tight">{feat}</span>
                      </div>
                    ))}
                    {activeCategory === 'Gym + Cardio' && (
                      <div className="flex items-start gap-2 text-xs text-emerald-700 font-medium pt-1">
                        <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-3 h-3" />
                        </div>
                        <span>Includes Cardio Deck &amp; Treadmills</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Direct CTA */}
                <Link
                  href={`/admission?plan=${encodeURIComponent(plan.type)}&category=${encodeURIComponent(activeCategory)}`}
                  className={`w-full py-3.5 px-4 rounded-2xl font-bold text-xs uppercase tracking-wider text-center flex items-center justify-center gap-2 transition-all ${
                    isAnnual
                      ? 'bg-gradient-to-r from-[#C41E3A] to-[#9E1228] text-white hover:shadow-lg hover:shadow-[#C41E3A]/30'
                      : 'bg-white hover:bg-neutral-50 text-[#1A1A1A] border border-black/10 hover:border-[#C41E3A]/40 shadow-sm'
                  }`}
                >
                  <span>Join with {activeCategory}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            );
          })}
        </div>

        {/* Custom Plan Banner */}
        <div className="mt-14 p-6 sm:p-8 rounded-3xl bg-white border border-[#D4A574]/30 shadow-sm text-center max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-left space-y-1">
            <h4 className="text-base font-bold text-[#1A1A1A] font-serif">
              Looking for a Custom Duration or Corporate Membership?
            </h4>
            <p className="text-xs text-[#666666] leading-relaxed">
              Our concierge team can create tailored duration passes and group packages on demand.
            </p>
          </div>
          <Link
            href="/admission?plan=Custom"
            className="px-6 py-3 rounded-xl bg-[#F8F6F4] text-[#8B1528] hover:bg-[#C41E3A] hover:text-white font-bold text-xs uppercase tracking-wider transition-all shrink-0 border border-[#D4A574]/50 shadow-sm"
          >
            Custom Membership
          </Link>
        </div>
      </div>
    </section>
  );
};
