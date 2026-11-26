'use client';

import React, { useState } from 'react';
import {
  Dumbbell,
  Zap,
  Activity,
  Flame,
  UserCheck,
  Sparkles,
  ArrowUpRight,
  CheckCircle2
} from 'lucide-react';

export const Facilities: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);

  const facilities = [
    {
      title: 'Free Weights & Heavy Strength Floor',
      subtitle: 'Olympic Barbells, Heavy Dumbbells & Power Stations',
      icon: Dumbbell,
      image: '/images/gym-1.jpg',
      description: 'Engineered for progressive overload and serious muscle building. Features heavy-duty squat racks, Olympic bench presses, and comprehensive dumbbell pairs up to heavy poundages.',
      features: ['Olympic Competition Barbells & Bumper Plates', 'Heavy Duty Squat & Power Racks', 'Full Dumbbell Racks for Progressive Resistance', 'Deadlift & Drop Shock-Absorbent Rubber Flooring']
    },
    {
      title: 'Cardiovascular & Endurance Deck',
      subtitle: 'Commercial Treadmills, Ellipticals & Spin Bikes',
      icon: Activity,
      image: '/images/gym-2.jpg',
      description: 'High-end commercial cardio stations to elevate cardiovascular capacity, stamina, and metabolic burn in a clean, air-circulated environment.',
      features: ['Commercial Speed & Incline Treadmills', 'High-Resistance Elliptical Cross-Trainers', 'Stationary Performance Spin Bikes', 'Real-Time Heart Rate & Calorie Feedback']
    },
    {
      title: 'Precision Machine Isolation Arena',
      subtitle: 'Targeted Pin-Loaded & Plate-Loaded Machinery',
      icon: Zap,
      image: '/images/gym-3.jpg',
      description: 'Ergonomically designed machines that maintain continuous muscular tension throughout every range of motion for safe and effective isolation.',
      features: ['Lat Pulldowns, Seated Cable Rows & Multi-Cable Towers', 'Leg Press, Hack Squats & Hamstring Curl Stations', 'Chest & Shoulder Convergent Pressing Units', 'Smooth Biomechanical Guided Movements']
    },
    {
      title: 'Functional Turf & Core Conditioning',
      subtitle: 'Kettlebells, Battle Ropes & Calisthenics Space',
      icon: Flame,
      image: '/images/gym-4.jpg',
      description: 'Dedicated floor for dynamic core development, functional agility drills, high-intensity intervals, and metabolic conditioning.',
      features: ['Cast Iron Kettlebell Arrays', 'Heavy Battle Ropes for Explosive Stamina', 'Plyometric Boxes, Resistance Bands & Medicine Balls', 'Spacious Functional Stretching & Warmup Mats']
    },
    {
      title: '1-on-1 Personal Training Coaching Pods',
      subtitle: 'Dedicated Guidance with Coach Mohaseen Subedar',
      icon: UserCheck,
      image: '/images/gym-5.jpg',
      description: 'Private attention and personalized coaching sessions to refine lifting technique, posture correction, and tailored body transformation roadmaps.',
      features: ['Individual Form Correction & Biomechanical Guidance', 'Body Measurement & Weight Progress Tracking', 'Personalized Diet & Nutrition Consultation', 'Daily Workout Scheduling & Motivation']
    }
  ];

  return (
    <section id="facilities" className="py-24 bg-[#F8F6F4] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-[#D4A574]/40 text-[#9E6B32] text-xs font-bold uppercase tracking-wider shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Facility Infrastructure</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold text-[#1A1A1A] font-serif tracking-tight">
            Curated For Focus &amp; Athletic Conditioning
          </h2>
          <p className="text-sm sm:text-base text-[#666666]">
            Explore our specialized strength, cardio, and functional zones maintained with high hygiene and disciplined standards in Cidco N-2.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {facilities.map((fac, idx) => {
            const Icon = fac.icon;
            const isActive = activeTab === idx;
            return (
              <button
                key={fac.title}
                onClick={() => setActiveTab(idx)}
                className={`flex items-center gap-2 px-3.5 py-2.5 sm:px-5 sm:py-3 rounded-2xl text-xs sm:text-sm font-bold tracking-wide transition-all border ${
                  isActive
                    ? 'bg-[#C41E3A] text-white border-[#C41E3A] shadow-md shadow-[#C41E3A]/20 scale-[1.02]'
                    : 'bg-white text-[#4A4A4A] border-black/10 hover:border-[#D4A574] hover:text-[#1A1A1A] shadow-sm'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#C41E3A]'}`} />
                <span>{fac.title.split(' ')[0]} {fac.title.split(' ')[1] || 'Zone'}</span>
              </button>
            );
          })}
        </div>

        {/* Active Facility Display */}
        <div className="rounded-3xl bg-white border border-black/10 p-6 sm:p-10 shadow-[0_15px_45px_rgba(0,0,0,0.05)] relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Facility Details */}
            <div className="lg:col-span-6 space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#9E6B32]">
                  {facilities[activeTab].subtitle}
                </span>
                <h3 className="text-2xl sm:text-4xl font-bold text-[#1A1A1A] font-serif tracking-tight mt-1">
                  {facilities[activeTab].title}
                </h3>
              </div>

              <p className="text-sm sm:text-base text-[#4A4A4A] leading-relaxed">
                {facilities[activeTab].description}
              </p>

              {/* Features List */}
              <div className="space-y-3 pt-2">
                {facilities[activeTab].features.map((feat, i) => (
                  <div key={i} className="flex items-center gap-3 p-3.5 rounded-xl bg-[#F8F6F4] border border-black/5">
                    <div className="w-6 h-6 rounded-lg bg-[#C41E3A]/10 flex items-center justify-center text-[#C41E3A] shrink-0 text-xs font-bold">
                      ✓
                    </div>
                    <span className="text-xs sm:text-sm text-[#1A1A1A] font-medium">{feat}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <a
                  href="#pricing"
                  className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#C41E3A] hover:text-[#8B1528] transition-colors"
                >
                  <span>Experience this facility in person</span>
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Facility Image */}
            <div className="lg:col-span-6">
              <div className="relative rounded-2xl overflow-hidden aspect-[16/10] border border-black/10 shadow-lg group">
                <img
                  src={facilities[activeTab].image}
                  alt={facilities[activeTab].title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-white backdrop-blur-md px-4 py-2.5 rounded-xl bg-black/50 border border-white/20">
                  <span className="font-semibold">{facilities[activeTab].subtitle}</span>
                  <span className="text-[#D4A574] font-bold">Open 05:00 - 22:00</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
