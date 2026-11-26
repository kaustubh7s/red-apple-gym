'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import { MembershipPlanType, AdmissionLead, MembershipCategory, Member } from '@/lib/types';
import { gymAdmissionPolicies } from '@/lib/data';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { PhotoCapture } from '@/components/common/PhotoCapture';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  CheckCircle2,
  Calendar,
  MessageCircle,
  Clock,
  Check,
  AlertCircle,
  Share2,
  Copy,
  ArrowRight,
  Dumbbell,
  Flame,
  Gift
} from 'lucide-react';

function AdmissionFormContent() {
  const searchParams = useSearchParams();
  const initialPlanParam = (searchParams.get('plan') as MembershipPlanType) || 'Monthly';
  const initialCategoryParam = (searchParams.get('category') as MembershipCategory) || 'Gym Only';

  const { addLead, sendWhatsAppMessage, generateWhatsAppLink, trainer, gymSettings, membershipPlans, members } = useApp();

  // Form State
  const [selectedCategory, setSelectedCategory] = useState<MembershipCategory>(
    initialCategoryParam === 'Gym + Cardio' ? 'Gym + Cardio' : 'Gym Only'
  );
  const [fullName, setFullName] = useState('');
  const [photo, setPhoto] = useState('');
  const [mobile, setMobile] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [age, setAge] = useState<number>(24);
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [weight, setWeight] = useState('');
  const [includeMeasurements, setIncludeMeasurements] = useState(false);
  const [chest, setChest] = useState('');
  const [biceps, setBiceps] = useState('');
  const [waist, setWaist] = useState('');
  const [goal, setGoal] = useState('Muscle Building & Strength');
  const [medicalConditions, setMedicalConditions] = useState('None');
  const [selectedPlan, setSelectedPlan] = useState<MembershipPlanType>(
    membershipPlans.some((p) => p.type === initialPlanParam) ? initialPlanParam : 'Monthly'
  );
  const [showRules, setShowRules] = useState(false);

  // Referral State: Only match if exact right Member ID, exact 10-digit mobile, or exact full name (never on partial/short name)
  const [referralInput, setReferralInput] = useState('');
  const [matchedReferrer, setMatchedReferrer] = useState<Member | null>(null);

  const handleReferralChange = (val: string) => {
    setReferralInput(val);
    const clean = val.trim().toLowerCase();
    if (!clean) {
      setMatchedReferrer(null);
      return;
    }

    const found = members.find((m) => {
      const memId = m.memberId.toLowerCase();
      const memNum = memId.replace('red-', '');
      const memName = m.fullName.toLowerCase().trim();
      const cleanDigits = clean.replace(/\D/g, '');
      const mobDigits = m.mobile.replace(/\D/g, '');
      const waDigits = (m.whatsapp || '').replace(/\D/g, '');

      // 1. Exact Member ID entered (e.g. "RED-3049" or "3049")
      if (clean === memId || (cleanDigits.length === 4 && cleanDigits === memNum)) {
        return true;
      }

      // 2. Exact registered 10-digit mobile number
      if (cleanDigits.length === 10 && (mobDigits.endsWith(cleanDigits) || waDigits.endsWith(cleanDigits))) {
        return true;
      }

      // 3. Exact FULL name only (e.g. "Sakshi Kamble", strictly matching full name, never a single short name like "sakshi")
      if (clean.length >= 4 && clean === memName) {
        return true;
      }

      return false;
    });

    setMatchedReferrer(found || null);
  };

  const [photoError, setPhotoError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdLead, setCreatedLead] = useState<AdmissionLead | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!photo) {
      setPhotoError('A profile photo is required to generate your gym ID pass.');
      // Scroll to photo section if needed
      window.scrollTo({ top: 150, behavior: 'smooth' });
      return;
    }
    setPhotoError(null);

    setIsSubmitting(true);

    try {
      const newLead = await addLead({
        fullName: fullName.trim(),
        photo,
        mobile: mobile.trim(),
        whatsapp: (whatsapp || mobile).trim(),
        email: email.trim() || `${fullName.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
        gender,
        age: Number(age),
        dateOfBirth: dateOfBirth || undefined,
        weight: Number(weight),
        chest: includeMeasurements && chest ? Number(chest) : undefined,
        biceps: includeMeasurements && biceps ? Number(biceps) : undefined,
        waist: includeMeasurements && waist ? Number(waist) : undefined,
        category: selectedCategory,
        preferredPlan: selectedPlan,
        goal,
        medicalConditions: medicalConditions.trim() || 'None',
        referredBy: matchedReferrer
          ? `${matchedReferrer.fullName} (${matchedReferrer.memberId})`
          : (referralInput.trim() || undefined),
        referrerMemberId: matchedReferrer?.memberId,
        referrerName: matchedReferrer?.fullName || (referralInput.trim() || undefined)
      });

      setCreatedLead(newLead);

      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#C41E3A', '#1A1A1A', '#00C853']
        });
      } catch (err) {}

      // Send WhatsApp confirmation
      const welcomeMsg = `Hello ${fullName}! 🎉 Thank you for registering at Red Apple Gym and Fitness Center (CIDCO N-2) for the ${selectedPlan} (${selectedCategory}) Plan.\n\nApplication ID: ${newLead.leadId}\nHead Coach: ${trainer.fullName}\n\nOur gym desk will verify your registration and issue your official check-in pass.`;
      sendWhatsAppMessage(fullName, whatsapp || mobile, 'admission_link', welcomeMsg);
    } catch (err) {
      console.error('Registration submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyLink = () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#F8F6F4] text-[#1A1A1A] flex flex-col justify-between pt-16 sm:pt-24 pb-4 sm:pb-16">
      <Navbar />

      <div className="max-w-3xl mx-auto px-3 sm:px-6 w-full my-auto">
        {/* Header - Ultra compact on mobile */}
        <div className="text-center mb-3 sm:mb-8 space-y-1 sm:space-y-2">
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white border border-black/10 text-[10px] sm:text-xs font-semibold text-[#C41E3A] shadow-2xs">
            <Sparkles className="w-3 h-3" />
            <span>RED APPLE GYM • CIDCO N-2</span>
          </div>

          <h1 className="text-xl sm:text-4xl font-bold text-[#1A1A1A] font-['Playfair_Display']">
            Membership Registration
          </h1>

          <p className="text-[11px] sm:text-sm text-[#71717A] max-w-lg mx-auto hidden sm:block">
            Fill in your details below to register. Your official check-in pass will be issued upon admin verification.
          </p>
        </div>

        {/* Form or Success State */}
        {!createdLead ? (
          <div className="bg-white rounded-2xl border border-black/10 p-3.5 sm:p-8 shadow-xs">
            <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-6 text-xs">
              {/* Photo Section */}
              <div className="space-y-1">
                <PhotoCapture
                  value={photo}
                  onChange={(p) => {
                    setPhoto(p);
                    setPhotoError(null);
                  }}
                  label="Member Passport Photo"
                  required={true}
                />
                {photoError && (
                  <div className="p-2 sm:p-3 rounded-lg bg-rose-50 border border-rose-200 text-[#C41E3A] text-[11px] sm:text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{photoError}</span>
                  </div>
                )}
              </div>

              {/* Personal Information - Ergonomic Mobile Grid */}
              <div className="border-t border-black/5 pt-3 sm:pt-5 space-y-2.5 sm:space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs sm:text-sm font-bold text-[#1A1A1A] font-['Playfair_Display']">
                    Personal Details
                  </h3>
                  <span className="text-[10px] text-neutral-400">* Required</span>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:gap-3.5">
                  {/* Full Name */}
                  <div className="col-span-2 sm:col-span-1">
                    <label className="font-semibold text-[#71717A] text-[11px] sm:text-xs block mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Yash Singhania"
                      className="w-full px-3 py-2 sm:py-2.5 rounded-lg border border-black/10 bg-[#F8F6F4] text-[#1A1A1A] placeholder:text-[#A1A1AA] text-xs focus:outline-none focus:ring-1 focus:ring-[#C41E3A] focus:bg-white"
                    />
                  </div>

                  {/* Mobile Number */}
                  <div className="col-span-1">
                    <label className="font-semibold text-[#71717A] text-[11px] sm:text-xs block mb-1">
                      Mobile *
                    </label>
                    <input
                      type="tel"
                      required
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="98765 43210"
                      className="w-full px-3 py-2 sm:py-2.5 rounded-lg border border-black/10 bg-[#F8F6F4] text-[#1A1A1A] placeholder:text-[#A1A1AA] text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[#C41E3A] focus:bg-white"
                    />
                  </div>

                  {/* WhatsApp Number */}
                  <div className="col-span-1">
                    <label className="font-semibold text-[#71717A] text-[11px] sm:text-xs block mb-1 truncate">
                      WhatsApp No.
                    </label>
                    <input
                      type="tel"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder={mobile.trim() ? mobile.trim() : 'Same as mobile'}
                      className="w-full px-3 py-2 sm:py-2.5 rounded-lg border border-black/10 bg-[#F8F6F4] text-[#1A1A1A] placeholder:text-[#A1A1AA] text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[#C41E3A] focus:bg-white"
                    />
                  </div>

                  {/* Email */}
                  <div className="col-span-1">
                    <label className="font-semibold text-[#71717A] text-[11px] sm:text-xs block mb-1 truncate">
                      Email (Optional)
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@email.com"
                      className="w-full px-3 py-2 sm:py-2.5 rounded-lg border border-black/10 bg-[#F8F6F4] text-[#1A1A1A] placeholder:text-[#A1A1AA] text-xs focus:outline-none focus:ring-1 focus:ring-[#C41E3A] focus:bg-white"
                    />
                  </div>

                  {/* Gender */}
                  <div className="col-span-1">
                    <label className="font-semibold text-[#71717A] text-[11px] sm:text-xs block mb-1">
                      Gender
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value as any)}
                      className="w-full px-3 py-2 sm:py-2.5 rounded-lg border border-black/10 bg-[#F8F6F4] text-[#1A1A1A] text-xs focus:outline-none focus:ring-1 focus:ring-[#C41E3A] focus:bg-white"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* 3-Column Tight Row: DOB + Age + Weight */}
                  <div className="col-span-2 grid grid-cols-3 gap-2 pt-0.5">
                    <div>
                      <label className="font-semibold text-[#71717A] text-[10px] sm:text-xs block mb-1 truncate">
                        Birth Date 🎂
                      </label>
                      <input
                        type="date"
                        value={dateOfBirth}
                        onChange={(e) => {
                          const val = e.target.value;
                          setDateOfBirth(val);
                          if (val) {
                            const birthYear = new Date(val).getFullYear();
                            const currentYear = new Date().getFullYear();
                            if (birthYear > 1920 && currentYear - birthYear > 0) {
                              setAge(currentYear - birthYear);
                            }
                          }
                        }}
                        className="w-full px-2 py-2 rounded-lg border border-black/10 bg-[#F8F6F4] text-[#1A1A1A] text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[#C41E3A] focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-[#71717A] text-[10px] sm:text-xs block mb-1">
                        Age
                      </label>
                      <input
                        type="number"
                        min="12"
                        max="90"
                        value={age}
                        onChange={(e) => setAge(Number(e.target.value))}
                        className="w-full px-2 py-2 rounded-lg border border-black/10 bg-[#F8F6F4] text-[#1A1A1A] text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[#C41E3A] focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-[#71717A] text-[10px] sm:text-xs block mb-1 truncate">
                        Weight (kg) *
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="25"
                        max="250"
                        required
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        placeholder="70"
                        className="w-full px-2 py-2 rounded-lg border border-black/10 bg-[#F8F6F4] text-[#1A1A1A] text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[#C41E3A] focus:bg-white"
                      />
                    </div>
                  </div>

                  {/* Body Measurements - Subtle 1-line collapsible */}
                  <div className="col-span-2 pt-0.5">
                    <button
                      type="button"
                      onClick={() => setIncludeMeasurements(!includeMeasurements)}
                      className="text-[11px] text-[#C41E3A] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>
                        {includeMeasurements
                          ? '− Hide Measurements'
                          : '+ Add Measurements: Chest, Biceps, Waist (Optional)'}
                      </span>
                    </button>

                    {includeMeasurements && (
                      <div className="grid grid-cols-3 gap-2 pt-2 animate-in fade-in duration-150">
                        <div>
                          <label className="text-[10px] font-semibold text-[#71717A] block mb-0.5">
                            Chest (in)
                          </label>
                          <input
                            type="number"
                            step="0.5"
                            min="20"
                            max="70"
                            value={chest}
                            onChange={(e) => setChest(e.target.value)}
                            placeholder="38"
                            className="w-full px-2 py-1.5 rounded-lg border border-black/10 bg-white text-xs font-mono text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#C41E3A]"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-semibold text-[#71717A] block mb-0.5">
                            Biceps (in)
                          </label>
                          <input
                            type="number"
                            step="0.5"
                            min="8"
                            max="30"
                            value={biceps}
                            onChange={(e) => setBiceps(e.target.value)}
                            placeholder="14"
                            className="w-full px-2 py-1.5 rounded-lg border border-black/10 bg-white text-xs font-mono text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#C41E3A]"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-semibold text-[#71717A] block mb-0.5">
                            Waist (in)
                          </label>
                          <input
                            type="number"
                            step="0.5"
                            min="20"
                            max="65"
                            value={waist}
                            onChange={(e) => setWaist(e.target.value)}
                            placeholder="32"
                            className="w-full px-2 py-1.5 rounded-lg border border-black/10 bg-white text-xs font-mono text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#C41E3A]"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Fitness Goal - 4 Compact Pills */}
              <div className="border-t border-black/5 pt-3 sm:pt-4 space-y-1.5">
                <label className="text-xs font-bold text-[#1A1A1A] block">
                  Fitness Target
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {[
                    'Muscle & Strength',
                    'Fat Loss & Toning',
                    'Personal Coaching',
                    'General Fitness'
                  ].map((g) => {
                    const isSelected = goal.startsWith(g.split(' ')[0]);
                    return (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setGoal(g)}
                        className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#C41E3A]/10 border-[#C41E3A] text-[#C41E3A] font-bold shadow-2xs'
                            : 'bg-[#F8F6F4] border-black/10 text-neutral-600 hover:text-[#1A1A1A] font-medium'
                        } text-[11px] leading-tight`}
                      >
                        {g}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Medical Issues / Physical Health Conditions */}
              <div className="border-t border-black/5 pt-3 sm:pt-4 space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#1A1A1A]">
                    Medical Issues / Conditions
                  </label>
                  <span className="text-[10px] text-[#71717A]">Optional</span>
                </div>
                <input
                  type="text"
                  value={medicalConditions}
                  onChange={(e) => setMedicalConditions(e.target.value)}
                  placeholder="e.g. Knee injury, asthma, or None"
                  className="w-full px-3 py-1.5 sm:py-2.5 rounded-lg border border-black/10 bg-[#F8F6F4] text-[#1A1A1A] placeholder:text-[#A1A1AA] focus:outline-none focus:ring-1 focus:ring-[#C41E3A] focus:bg-white text-xs"
                />
              </div>

              {/* Membership Plan Selection - 2x2 Clean Grid on Mobile */}
              <div className="border-t border-black/5 pt-3 sm:pt-4 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-[#1A1A1A]">
                    Select Membership Plan
                  </span>

                  {/* Category Switcher Pill */}
                  <div className="inline-flex items-center p-0.5 rounded-lg bg-black/5 border border-black/5">
                    <button
                      type="button"
                      onClick={() => setSelectedCategory('Gym Only')}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                        selectedCategory === 'Gym Only'
                          ? 'bg-white text-[#1A1A1A] shadow-xs'
                          : 'text-neutral-500 hover:text-[#1A1A1A]'
                      }`}
                    >
                      <Dumbbell className="w-3 h-3 text-[#C41E3A]" />
                      <span>Gym Only</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedCategory('Gym + Cardio')}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                        selectedCategory === 'Gym + Cardio'
                          ? 'bg-[#C41E3A] text-white shadow-xs'
                          : 'text-neutral-500 hover:text-[#1A1A1A]'
                      }`}
                    >
                      <Flame className="w-3 h-3" />
                      <span>Gym + Cardio</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {membershipPlans.map((plan) => {
                    const isSelected = selectedPlan === plan.type;
                    const price = selectedCategory === 'Gym + Cardio' ? plan.gymCardioPrice : plan.gymOnlyPrice;

                    return (
                      <div
                        key={plan.type}
                        onClick={() => setSelectedPlan(plan.type)}
                        className={`p-2.5 sm:p-3.5 rounded-xl border cursor-pointer transition-all relative ${
                          isSelected
                            ? 'bg-[#C41E3A]/5 border-[#C41E3A] shadow-xs ring-1 ring-[#C41E3A]'
                            : 'bg-[#F8F6F4] border-black/10 hover:border-black/20'
                        }`}
                      >
                        {plan.badge && (
                          <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-full bg-[#C41E3A] text-white inline-block mb-0.5">
                            {plan.badge}
                          </span>
                        )}

                        <div className="font-bold text-[#1A1A1A] text-xs sm:text-sm leading-tight">
                          {plan.name}
                        </div>

                        <div className="mt-0.5 flex items-baseline gap-1">
                          <span className="text-base sm:text-lg font-bold font-['Playfair_Display'] text-[#C41E3A]">
                            ₹{price.toLocaleString('en-IN')}
                          </span>
                          <span className="text-[10px] text-[#71717A]">
                            /{plan.durationDays}d
                          </span>
                        </div>

                        <p className="text-[10px] text-[#71717A] mt-1 hidden sm:block">
                          {plan.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Referral Benefit Section (Optional) */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-amber-500/[0.08] via-orange-500/[0.04] to-transparent border border-amber-500/25 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-[#8A5A1F] flex items-center gap-1.5 uppercase tracking-wider">
                    <Gift className="w-3.5 h-3.5 text-amber-600" />
                    <span>Referred by an Existing Member? (Optional)</span>
                  </label>
                  <span className="text-[9px] sm:text-[10px] text-amber-900 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full font-bold">
                    Buddy Reward
                  </span>
                </div>

                <div className="space-y-1.5">
                  <input
                    type="text"
                    value={referralInput}
                    onChange={(e) => handleReferralChange(e.target.value)}
                    placeholder="Enter friend's exact Member ID (e.g. RED-3049), Mobile, or Full Name"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-black/10 text-xs font-semibold text-[#1A1A1A] placeholder:text-neutral-400 outline-none focus:border-[#C41E3A] focus:ring-1 focus:ring-[#C41E3A] shadow-2xs"
                  />

                  {matchedReferrer ? (
                    <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between text-xs animate-in fade-in">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="text-[11px] sm:text-xs">
                          Verified Member: <strong>{matchedReferrer.fullName}</strong>
                        </span>
                      </div>
                      <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                        Verified
                      </span>
                    </div>
                  ) : null}
                </div>

                <p className="text-[10px] sm:text-[11px] text-neutral-600 leading-relaxed">
                  Enter your friend&apos;s exact Member ID (e.g. RED-3049), registered mobile, or full name. <strong>Both you and your referring gym buddy will receive exclusive membership discounts &amp; rewards upon approval! 🎉</strong>
                </p>
              </div>

              {/* Club Terms & Conditions - Expandable fine print */}
              <div className="border-t border-black/5 pt-3 sm:pt-4 space-y-1.5">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-semibold uppercase tracking-wider text-neutral-400">
                    Official Gym Policies (20 Rules)
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowRules(!showRules)}
                    className="text-[#C41E3A] font-semibold hover:underline cursor-pointer"
                  >
                    {showRules ? 'Hide Rules ▲' : 'View Rules ▼'}
                  </button>
                </div>

                {showRules && (
                  <div className="max-h-36 overflow-y-auto p-2.5 rounded-xl bg-neutral-50 border border-black/[0.06] text-[10px] text-neutral-500 space-y-1 leading-relaxed font-normal animate-in fade-in duration-150">
                    {gymAdmissionPolicies.map((rule, idx) => (
                      <div key={idx} className="flex items-start gap-1.5">
                        <span className="text-neutral-400 font-mono text-[9px] shrink-0 mt-0.5">
                          {idx + 1}.
                        </span>
                        <span className="text-neutral-500">{rule}</span>
                      </div>
                    ))}
                  </div>
                )}

                <label className="flex items-start gap-2 cursor-pointer pt-0.5 text-neutral-600">
                  <input
                    type="checkbox"
                    required
                    defaultChecked
                    className="mt-0.5 rounded accent-[#C41E3A] w-3.5 h-3.5 cursor-pointer shrink-0"
                  />
                  <span className="leading-tight text-[10px] sm:text-[11px]">
                    I agree to the 20 official membership rules &amp; regulations of Red Apple Gym and Fitness Center.
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-2 sm:pt-3 border-t border-black/5">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 sm:py-3.5 rounded-xl bg-[#C41E3A] text-white text-xs sm:text-sm font-bold hover:bg-[#A3182E] transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <span>{isSubmitting ? 'Registering Applicant...' : 'Submit Membership Registration'}</span>
                  <ArrowRight className={`w-4 h-4 ${isSubmitting ? 'animate-pulse' : ''}`} />
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Success Screen */
          <div className="bg-white rounded-2xl border border-black/10 p-8 shadow-xs text-center space-y-6 animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#1A1A1A] font-['Playfair_Display']">
                Registration Submitted!
              </h2>
              <p className="text-xs sm:text-sm text-[#71717A] max-w-md mx-auto mt-1">
                Your admission request has been sent to Red Apple Gym and Fitness Center CIDCO N-2.
              </p>
            </div>

            {/* Applicant Summary */}
            <div className="max-w-sm mx-auto p-4 rounded-xl bg-[#F8F6F4] border border-black/10 text-left space-y-3">
              <div className="flex items-center justify-between text-xs border-b border-black/5 pb-2">
                <span className="text-[#71717A]">Application ID:</span>
                <span className="font-mono font-bold text-[#C41E3A]">{createdLead.leadId}</span>
              </div>

              <div className="flex items-center gap-3">
                <img
                  src={createdLead.photo}
                  alt={createdLead.fullName}
                  className="w-12 h-12 rounded-xl object-cover border border-black/10 shrink-0"
                />
                <div>
                  <h4 className="font-bold text-[#1A1A1A] text-sm">{createdLead.fullName}</h4>
                  <p className="text-xs text-[#71717A] font-mono">{createdLead.mobile}</p>
                  <p className="text-xs font-semibold text-[#C41E3A] mt-0.5">
                    Plan: {createdLead.preferredPlan} Pass ({createdLead.category || 'Gym Only'}) {createdLead.weight ? `• ${createdLead.weight} kg` : ''}
                  </p>
                  {(createdLead.chest || createdLead.biceps || createdLead.waist) && (
                    <p className="text-[10px] text-neutral-500 font-mono mt-0.5">
                      {[
                        createdLead.chest ? `Chest: ${createdLead.chest}"` : '',
                        createdLead.biceps ? `Biceps: ${createdLead.biceps}"` : '',
                        createdLead.waist ? `Waist: ${createdLead.waist}"` : ''
                      ].filter(Boolean).join(' • ')}
                    </p>
                  )}
                  {createdLead.referredBy && (
                    <div className="mt-2 flex items-center gap-1.5 text-[11px] text-amber-800 bg-amber-50 border border-amber-200/60 px-2.5 py-1 rounded-lg">
                      <Gift className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>Referred by: <strong>{createdLead.referredBy}</strong></span>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-white border border-black/5 text-[11px] text-[#71717A]">
                Status: <strong className="text-amber-800">Awaiting Admin Verification</strong>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <a
                href={generateWhatsAppLink(
                  gymSettings.whatsapp,
                  `Hello Red Apple Gym and Fitness Center! I have submitted my admission application (${createdLead.fullName} • ${createdLead.leadId}) for the ${createdLead.preferredPlan} (${createdLead.category || 'Gym Only'}) plan. Please verify and issue my pass.`
                )}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-[#25D366] text-white text-xs font-semibold flex items-center justify-center gap-2 hover:bg-[#1EBE5D] transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Notify Gym on WhatsApp</span>
              </a>

              <Link
                href="/"
                className="w-full sm:w-auto px-5 py-2.5 rounded-lg border border-black/10 text-xs font-semibold text-[#1A1A1A] hover:bg-black/5 transition-colors"
              >
                <span>Return to Home</span>
              </Link>
            </div>
          </div>
        )}

        {/* Share Admission Link Card - Compact & Clean */}
        <div className="mt-4 sm:mt-6 p-3 sm:p-4 rounded-xl bg-white border border-black/10 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs">
          <div>
            <h4 className="font-bold text-[#1A1A1A] flex items-center gap-1.5 text-xs">
              <Share2 className="w-3.5 h-3.5 text-[#C41E3A]" />
              <span>Shareable Admission Link</span>
            </h4>
            <p className="text-[10px] sm:text-[11px] text-[#71717A]">
              Send link to prospective members on WhatsApp for online registration.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleCopyLink}
              className="flex-1 sm:flex-none px-2.5 py-1.5 rounded-lg border border-black/10 text-[11px] sm:text-xs font-semibold text-[#1A1A1A] hover:bg-black/5 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#71717A]" />}
              <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
            </button>

            <a
              href={generateWhatsAppLink(
                '',
                'Hello! Register for Red Apple Gym (CIDCO N-2) membership using this link:\n\nhttps://redapplefitness.com/admission'
              )}
              target="_blank"
              rel="noreferrer"
              className="px-2.5 py-1.5 rounded-lg border border-[#25D366]/40 text-[#128C7E] bg-[#25D366]/5 hover:bg-[#25D366]/10 text-[11px] sm:text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Share</span>
            </a>
          </div>
        </div>
      </div>

      {/* Desktop Full Footer */}
      <div className="hidden md:block">
        <Footer />
      </div>

      {/* Mobile Minimal 1-line Footer */}
      <div className="md:hidden text-center py-3 text-[10px] text-neutral-400">
        © 2026 Red Apple Gym and Fitness Center • CIDCO N-2
      </div>
    </div>
  );
}

export default function AdmissionPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8F6F4] text-[#1A1A1A] flex items-center justify-center text-xs">
          Loading Admission Form...
        </div>
      }
    >
      <AdmissionFormContent />
    </Suspense>
  );
}
