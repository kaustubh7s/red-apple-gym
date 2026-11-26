'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import { Award, MessageCircle, Star, Sparkles, ArrowRight, ShieldCheck, Dumbbell, Flame, CheckCircle2 } from 'lucide-react';

export const Trainers: React.FC = () => {
  const { trainer, generateWhatsAppLink } = useApp();

  return (
    <section id="trainers" className="py-24 bg-white border-t border-b border-black/[0.06] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F8F6F4] border border-[#D4A574]/40 text-[#9E6B32] text-xs font-bold uppercase tracking-wider shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Master Coach Spotlight</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold text-[#1A1A1A] font-serif tracking-tight">
            Direct 1-on-1 Master Guidance
          </h2>
          <p className="text-sm sm:text-base text-[#666666]">
            Every athlete at Red Apple Gym receives authentic mentorship under our Head Master Coach with dedicated periodized workout routines.
          </p>
        </div>

        {/* Solo Trainer Spotlight Card */}
        <div className="max-w-4xl mx-auto rounded-3xl bg-[#F8F6F4] border border-[#D4A574]/30 shadow-[0_15px_45px_rgba(0,0,0,0.05)] p-6 sm:p-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {/* Photo with Gold Accent Border */}
            <div className="md:col-span-5 relative rounded-2xl overflow-hidden aspect-[4/5] bg-neutral-200 border-2 border-[#D4A574] shadow-xl">
              <img
                src={trainer.photo}
                alt={trainer.fullName}
                className="w-full h-full object-cover transition-all duration-700 hover:scale-105"
              />
              <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md text-xs font-bold text-white flex items-center gap-1.5 border border-white/20">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>{trainer.rating} Rating</span>
              </div>
              <div className="absolute bottom-3 left-3 right-3 p-2.5 rounded-xl bg-white/95 backdrop-blur-md border border-[#D4A574]/40 text-center shadow-sm">
                <span className="text-[11px] font-bold text-[#8B1528] uppercase tracking-wider">Head Master Coach</span>
              </div>
            </div>

            {/* Details */}
            <div className="md:col-span-7 space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#9E6B32]">
                  {trainer.experienceYears}+ Years Elite Coaching Experience
                </span>
                <h3 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] font-serif mt-1">
                  {trainer.fullName}
                </h3>
                <p className="text-xs sm:text-sm text-[#4A4A4A] leading-relaxed mt-2">
                  {trainer.bio}
                </p>
              </div>

              {/* Certifications & Specialties */}
              <div className="space-y-3">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#8A8A8A]">
                  Specializations:
                </div>
                <div className="flex flex-wrap gap-2">
                  {trainer.specialization.map((spec, i) => (
                    <span
                      key={i}
                      className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white text-[#1A1A1A] border border-black/10 shadow-sm"
                    >
                      {spec}
                    </span>
                  ))}
                </div>

                <div className="text-[11px] font-bold uppercase tracking-wider text-[#8A8A8A] pt-1">
                  Accreditations:
                </div>
                <div className="text-xs text-[#C41E3A] font-semibold">
                  {trainer.certifications.join(' • ')}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-black/10">
                <a
                  href={generateWhatsAppLink(
                    trainer.whatsapp,
                    `Hello Coach ${trainer.fullName}! I would like to inquire about personal training and membership at Red Apple Gym (Cidco N-2, Chhatrapati Sambhajinagar).`
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#C41E3A] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#8B1528] shadow-md shadow-[#C41E3A]/25 transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Talk with Coach Mohaseen</span>
                </a>

                <Link
                  href="/admission"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white hover:bg-neutral-50 border border-[#D4A574]/60 text-[#1A1A1A] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <span>Apply for Membership</span>
                  <ArrowRight className="w-4 h-4 text-[#C41E3A]" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
