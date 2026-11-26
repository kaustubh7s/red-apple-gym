'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Activity, Sparkles, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

export const BmiCalculator: React.FC = () => {
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [heightCm, setHeightCm] = useState<number>(175);
  const [weightKg, setWeightKg] = useState<number>(74);
  const [age, setAge] = useState<number>(28);

  // BMI Calculation
  const heightM = heightCm / 100;
  const bmi = heightM > 0 ? parseFloat((weightKg / (heightM * heightM)).toFixed(1)) : 0;

  // Health Category
  let category = 'Normal Weight';
  let categoryColor = '#2E7D32';
  let message = 'You have an optimal body mass ratio. Maintain lean muscle mass through progressive resistance training.';
  let targetIdealWeight = `${(18.5 * (heightM * heightM)).toFixed(1)} - ${(24.9 * (heightM * heightM)).toFixed(1)} kg`;
  let dailyCalorieEstimate = Math.round(gender === 'male' ? (10 * weightKg + 6.25 * heightCm - 5 * age + 5) * 1.4 : (10 * weightKg + 6.25 * heightCm - 5 * age - 161) * 1.4);

  if (bmi < 18.5) {
    category = 'Underweight';
    categoryColor = '#0284C7';
    message = 'Structured hypertrophy, lean caloric surplus and progressive strength training is recommended.';
  } else if (bmi >= 25 && bmi < 29.9) {
    category = 'Overweight';
    categoryColor = '#D97706';
    message = 'Moderate caloric deficit with high-protein intake and metabolic resistance conditioning recommended.';
  } else if (bmi >= 30) {
    category = 'Obese Range';
    categoryColor = '#C41E3A';
    message = 'Structured fat-loss protocol with low-impact joint conditioning and dedicated coaching recommended.';
  }

  return (
    <section id="bmi" className="py-24 bg-white border-t border-b border-black/[0.06] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F8F6F4] border border-[#D4A574]/40 text-[#9E6B32] text-xs font-bold uppercase tracking-wider shadow-sm">
            <Activity className="w-3.5 h-3.5" />
            <span>Biometric Diagnostic Tool</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1A1A1A] font-serif tracking-tight">
            Live Body Mass Index (BMI) &amp; Metabolic Calculator
          </h2>
          <p className="text-xs sm:text-sm text-[#666666]">
            Calculate your baseline metrics and receive instant training &amp; nutritional targets customized for your physiology.
          </p>
        </div>

        <div className="rounded-3xl bg-[#F8F6F4] border border-[#D4A574]/30 p-6 sm:p-10 shadow-[0_15px_45px_rgba(0,0,0,0.05)] max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Input Form */}
            <div className="lg:col-span-6 space-y-6">
              {/* Gender Switcher */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#666666] block mb-2">
                  Gender
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setGender('male')}
                    className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                      gender === 'male'
                        ? 'bg-[#C41E3A] text-white border-[#C41E3A] shadow-sm'
                        : 'bg-white text-[#4A4A4A] border-black/10 hover:border-[#D4A574]'
                    }`}
                  >
                    Male
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender('female')}
                    className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                      gender === 'female'
                        ? 'bg-[#C41E3A] text-white border-[#C41E3A] shadow-sm'
                        : 'bg-white text-[#4A4A4A] border-black/10 hover:border-[#D4A574]'
                    }`}
                  >
                    Female
                  </button>
                </div>
              </div>

              {/* Height Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold uppercase tracking-wider text-[#666666]">Height</span>
                  <span className="text-sm font-bold text-[#1A1A1A] font-serif">{heightCm} cm</span>
                </div>
                <input
                  type="range"
                  min="130"
                  max="220"
                  value={heightCm}
                  onChange={(e) => setHeightCm(Number(e.target.value))}
                  className="w-full accent-[#C41E3A] h-2 bg-neutral-300 rounded-lg cursor-pointer"
                />
              </div>

              {/* Weight Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold uppercase tracking-wider text-[#666666]">Weight</span>
                  <span className="text-sm font-bold text-[#1A1A1A] font-serif">{weightKg} kg</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="160"
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  className="w-full accent-[#C41E3A] h-2 bg-neutral-300 rounded-lg cursor-pointer"
                />
              </div>

              {/* Age Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold uppercase tracking-wider text-[#666666]">Age</span>
                  <span className="text-sm font-bold text-[#1A1A1A] font-serif">{age} Years</span>
                </div>
                <input
                  type="range"
                  min="16"
                  max="80"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full accent-[#C41E3A] h-2 bg-neutral-300 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* Results Card & Visual Meter */}
            <div className="lg:col-span-6 rounded-2xl bg-white border border-black/10 p-6 space-y-6 text-center shadow-sm">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#8A8A8A]">
                  Calculated Body Mass Index
                </div>
                <div className="text-5xl font-bold text-[#1A1A1A] font-serif my-2">
                  {bmi}
                </div>
                <div
                  className="inline-block px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm"
                  style={{ backgroundColor: `${categoryColor}15`, color: categoryColor, border: `1px solid ${categoryColor}40` }}
                >
                  {category}
                </div>
              </div>

              {/* Gauge Bar */}
              <div className="space-y-1.5 px-4">
                <div className="h-3 rounded-full bg-gradient-to-r from-sky-400 via-emerald-500 via-amber-400 to-rose-500 relative overflow-hidden shadow-inner" />
                <div className="flex justify-between text-[10px] text-[#8A8A8A] font-semibold uppercase">
                  <span>Under (&lt;18.5)</span>
                  <span>Normal (18.5-24.9)</span>
                  <span>Over (25-29.9)</span>
                  <span>Obese (30+)</span>
                </div>
              </div>

              {/* Targets Box */}
              <div className="grid grid-cols-2 gap-3 text-left pt-2">
                <div className="p-3 rounded-xl bg-[#F8F6F4] border border-black/5">
                  <div className="text-[10px] text-[#666666] font-semibold uppercase">Ideal Target Weight</div>
                  <div className="text-sm font-bold text-[#1A1A1A] font-serif mt-0.5">{targetIdealWeight}</div>
                </div>
                <div className="p-3 rounded-xl bg-[#F8F6F4] border border-black/5">
                  <div className="text-[10px] text-[#666666] font-semibold uppercase">Daily TDEE Estimate</div>
                  <div className="text-sm font-bold text-[#C41E3A] font-serif mt-0.5">~ {dailyCalorieEstimate} kcal</div>
                </div>
              </div>

              <p className="text-xs text-[#4A4A4A] text-left leading-relaxed">
                {message}
              </p>

              <Link
                href="/admission"
                className="w-full py-3.5 rounded-xl bg-[#C41E3A] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#8B1528] shadow-md shadow-[#C41E3A]/20 transition-all"
              >
                <span>Get Customized Training Protocol</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
