'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { Trainer } from '@/lib/types';
import {
  Award,
  Star,
  Users,
  Dumbbell,
  CheckCircle2,
  Edit,
  Phone,
  Mail,
  Sparkles,
  MessageCircle,
  Save
} from 'lucide-react';

export const TrainerManagement: React.FC = () => {
  const { trainer, updateTrainer, members, generateWhatsAppLink } = useApp();

  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(trainer.fullName);
  const [mobile, setMobile] = useState(trainer.mobile);
  const [whatsapp, setWhatsapp] = useState(trainer.whatsapp);
  const [email, setEmail] = useState(trainer.email);
  const [bio, setBio] = useState(trainer.bio);
  const [experienceYears, setExperienceYears] = useState(trainer.experienceYears);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateTrainer({
      fullName,
      mobile,
      whatsapp,
      email,
      bio,
      experienceYears: Number(experienceYears)
    });
    setEditing(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[#1A1A1A] font-['Space_Grotesk']">
            Head Master Coach Profile
          </h2>
          <p className="text-xs text-[#71717A]">
            Single trainer club model • All {members.length} registered gym athletes train under this master profile.
          </p>
        </div>

        <button
          onClick={() => setEditing(!editing)}
          className="px-5 py-2.5 rounded-xl bg-white hover:bg-[#F8F6F4] border border-black/10 text-[#1A1A1A] font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-colors shadow-xs"
        >
          <Edit className="w-4 h-4 text-[#C41E3A]" />
          <span>{editing ? 'Cancel Editing' : 'Edit Coach Profile'}</span>
        </button>
      </div>

      {/* Head Coach Details Card */}
      <div className="rounded-3xl bg-white border border-black/10 p-6 sm:p-10 shadow-xs space-y-6">
        {editing ? (
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold uppercase tracking-wider text-[#71717A] block mb-1">
                  Full Coach Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#F8F6F4] border border-black/10 text-[#1A1A1A] outline-none focus:border-[#C41E3A] focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="font-bold uppercase tracking-wider text-[#71717A] block mb-1">
                  Experience (Years)
                </label>
                <input
                  type="number"
                  required
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl bg-[#F8F6F4] border border-black/10 text-[#1A1A1A] outline-none focus:border-[#C41E3A] focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="font-bold uppercase tracking-wider text-[#71717A] block mb-1">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  required
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#F8F6F4] border border-black/10 text-[#1A1A1A] outline-none focus:border-[#C41E3A] focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="font-bold uppercase tracking-wider text-[#71717A] block mb-1">
                  WhatsApp Number
                </label>
                <input
                  type="tel"
                  required
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#F8F6F4] border border-black/10 text-[#1A1A1A] outline-none focus:border-[#C41E3A] focus:bg-white transition-all"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold uppercase tracking-wider text-[#71717A] block mb-1">
                  Official Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#F8F6F4] border border-black/10 text-[#1A1A1A] outline-none focus:border-[#C41E3A] focus:bg-white transition-all"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold uppercase tracking-wider text-[#71717A] block mb-1">
                  Professional Bio & Philosophy
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#F8F6F4] border border-black/10 text-[#1A1A1A] outline-none focus:border-[#C41E3A] focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#C41E3A] text-white font-extrabold uppercase tracking-wider flex items-center gap-2 shadow-sm hover:bg-[#A3182E] transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Save Profile</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-4 flex flex-col items-center text-center space-y-3">
              <img
                src={trainer.photo}
                alt={trainer.fullName}
                className="w-36 h-36 rounded-3xl object-cover border-2 border-[#C41E3A] shadow-md"
              />
              <div>
                <h3 className="text-xl font-extrabold text-[#1A1A1A] font-['Space_Grotesk']">
                  {trainer.fullName}
                </h3>
                <span className="text-xs text-[#C41E3A] font-bold font-mono">
                  {trainer.trainerId} • Head Coach
                </span>
              </div>
            </div>

            <div className="md:col-span-8 space-y-4">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-[#C41E3A]/10 border border-[#C41E3A]/20 text-[#C41E3A] text-xs font-bold uppercase">
                  {trainer.experienceYears}+ Years Experience
                </span>
                <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-700 text-xs font-bold flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>{trainer.rating} Star Coach</span>
                </span>
              </div>

              <p className="text-xs sm:text-sm text-[#4A4A4A] leading-relaxed">
                {trainer.bio}
              </p>

              <div className="space-y-2 pt-2 border-t border-black/5 text-xs">
                <div className="text-[#71717A]">
                  Specializations: <strong className="text-[#1A1A1A]">{trainer.specialization.join(', ')}</strong>
                </div>
                <div className="text-[#71717A]">
                  Accreditations: <strong className="text-[#C41E3A]">{trainer.certifications.join(' • ')}</strong>
                </div>
                <div className="text-[#71717A]">
                  Athletes Supervised: <strong className="text-[#1A1A1A]">{members.length} Athletes (100% of Club)</strong>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
