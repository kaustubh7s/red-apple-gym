'use client';

import React, { useState, useEffect } from 'react';
import { useApp, PLAN_PRICE_MAP, PLAN_DAYS_MAP } from '@/lib/store';
import { AdmissionLead, MembershipPlanType, PaymentMode, MembershipCategory, Member } from '@/lib/types';
import { PREDEFINED_PLANS } from '@/lib/data';
import { generateShareablePassUrl } from '@/lib/passUtils';
import {
  Sparkles,
  Share2,
  Copy,
  Check,
  MessageCircle,
  UserPlus,
  Award,
  CheckCircle2,
  Clock,
  Send,
  ExternalLink,
  ChevronRight,
  X,
  CreditCard,
  DollarSign,
  ShieldCheck,
  Dumbbell,
  Flame,
  UserX,
  XCircle,
  RotateCcw,
  Filter,
  Gift,
  Tag
} from 'lucide-react';

export const AdmissionManagement: React.FC = () => {
  const {
    leads,
    refreshLeads,
    trainer,
    membershipPlans,
    convertLeadToMember,
    updateLeadStatus,
    generateWhatsAppLink,
    sendWhatsAppMessage,
    calculateExpiryInfo,
    members,
    updateMember
  } = useApp();

  const [copiedLink, setCopiedLink] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [leadToConvert, setLeadToConvert] = useState<AdmissionLead | null>(null);
  const [leadToReject, setLeadToReject] = useState<AdmissionLead | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('Application details could not be verified');
  const [notifyOnReject, setNotifyOnReject] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Converted' | 'Rejected'>('All');

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshLeads();
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    handleManualRefresh();
    // Auto-poll admissions every 12 seconds so new online requests appear live
    const interval = setInterval(() => {
      refreshLeads();
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  // Conversion Modal fields for ADMIN
  const [convertPlan, setConvertPlan] = useState<MembershipPlanType>('Annual');
  const [convertCategory, setConvertCategory] = useState<MembershipCategory>('Gym Only');
  const [customDays, setCustomDays] = useState<number>(30);
  const [feeAmount, setFeeAmount] = useState<number>(7000);
  const [amountPaid, setAmountPaid] = useState<number>(7000);
  const [dueAmount, setDueAmount] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('UPI');

  // Referral discount & reward controls for ADMIN
  const [referralDiscount, setReferralDiscount] = useState<number>(0);
  const [referrerRewardType, setReferrerRewardType] = useState<'extension' | 'credit' | 'none'>('extension');
  const [referrerBonusDays, setReferrerBonusDays] = useState<number>(15);
  const [referrerCreditAmount, setReferrerCreditAmount] = useState<number>(300);
  const [matchedReferrerMember, setMatchedReferrerMember] = useState<Member | null>(null);

  const getPlanPrice = (planType: MembershipPlanType, category: MembershipCategory) => {
    if (planType === 'Custom') return 1000;
    const found = membershipPlans.find((p) => p.type === planType);
    if (!found) return PLAN_PRICE_MAP[planType] || 800;
    return category === 'Gym + Cardio' ? found.gymCardioPrice : found.gymOnlyPrice;
  };

  // Link generation
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://redapplefitness.com';
  const generatedAdmissionUrl = `${baseUrl}/admission`;

  const defaultWhatsAppMsg = `Hello. Thank you for your interest in joining our gym. Please complete the admission form using the link below:\n\n${generatedAdmissionUrl}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedAdmissionUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleOpenConvertModal = (lead: AdmissionLead) => {
    setLeadToConvert(lead);
    const prefPlan = lead.preferredPlan || 'Annual';
    const prefCat = lead.category || 'Gym Only';
    setConvertPlan(prefPlan);
    setConvertCategory(prefCat);
    const defaultPrice = getPlanPrice(prefPlan, prefCat);

    // Look for matching referrer in members
    let foundReferrer: Member | null = null;
    if (lead.referredBy || lead.referrerMemberId || lead.referrerName) {
      const cleanRef = (lead.referrerMemberId || lead.referrerName || lead.referredBy || '').toLowerCase().trim();
      foundReferrer = members.find(
        (m) =>
          m.memberId.toLowerCase() === cleanRef ||
          m.memberId.toLowerCase().replace('red-', '') === cleanRef ||
          m.mobile.includes(cleanRef) ||
          (m.whatsapp && m.whatsapp.includes(cleanRef)) ||
          cleanRef.includes(m.fullName.toLowerCase()) ||
          m.fullName.toLowerCase() === cleanRef
      ) || null;
    }
    setMatchedReferrerMember(foundReferrer);

    // If lead has a referral, suggest a default ₹300 discount, otherwise 0
    const initialDiscount = (lead.referredBy || lead.referrerName) ? 300 : 0;
    setReferralDiscount(initialDiscount);
    setReferrerRewardType('extension');
    setReferrerBonusDays(15);
    setReferrerCreditAmount(300);

    const discountedPrice = Math.max(0, defaultPrice - initialDiscount);
    setFeeAmount(discountedPrice);
    setAmountPaid(discountedPrice);
    setDueAmount(0);
    setCustomDays(lead.customDays || 30);
  };

  const handlePlanChange = (p: MembershipPlanType) => {
    setConvertPlan(p);
    const basePrice = getPlanPrice(p, convertCategory);
    const finalPrice = Math.max(0, basePrice - referralDiscount);
    setFeeAmount(finalPrice);
    setAmountPaid(finalPrice);
    setDueAmount(0);
  };

  const handleCategoryChange = (cat: MembershipCategory) => {
    setConvertCategory(cat);
    const basePrice = getPlanPrice(convertPlan, cat);
    const finalPrice = Math.max(0, basePrice - referralDiscount);
    setFeeAmount(finalPrice);
    setAmountPaid(finalPrice);
    setDueAmount(0);
  };

  const handleApplyReferralDiscount = (disc: number) => {
    setReferralDiscount(disc);
    const basePrice = getPlanPrice(convertPlan, convertCategory);
    const finalPrice = Math.max(0, basePrice - disc);
    setFeeAmount(finalPrice);
    setAmountPaid(finalPrice);
    setDueAmount(0);
  };

  const handleFeeChange = (fee: number) => {
    setFeeAmount(fee);
    setAmountPaid(fee);
    setDueAmount(0);
  };

  const handlePaidChange = (paid: number) => {
    setAmountPaid(paid);
    setDueAmount(Math.max(0, feeAmount - paid));
  };

  const handleConfirmConvert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadToConvert) return;

    const newMem = convertLeadToMember(
      leadToConvert.id,
      convertPlan,
      convertPlan === 'Custom' ? customDays : undefined,
      feeAmount,
      amountPaid,
      paymentMode,
      dueAmount,
      convertCategory
    );

    if (newMem) {
      // 1. Reward referring member if configured
      if ((leadToConvert.referredBy || leadToConvert.referrerName) && matchedReferrerMember && referrerRewardType === 'extension' && referrerBonusDays > 0) {
        const curExp = new Date(matchedReferrerMember.expiryDate);
        curExp.setDate(curExp.getDate() + Number(referrerBonusDays));
        const newExpStr = curExp.toISOString().split('T')[0];

        updateMember(matchedReferrerMember.id, {
          expiryDate: newExpStr,
          notes: `${matchedReferrerMember.notes || ''} [Referral Reward: +${referrerBonusDays}d for referring ${leadToConvert.fullName}]`.trim()
        });

        // WhatsApp notification to referrer
        if (matchedReferrerMember.whatsapp) {
          const thankYouMsg = `Hello ${matchedReferrerMember.fullName}! 🎉 Thank you for referring ${newMem.fullName} to Red Apple Gym!\n\nAs a token of appreciation, we have added +${referrerBonusDays} FREE DAYS to your gym membership!\nYour new expiry date is ${newExpStr}.\n\nKeep training strong! 💪`;
          sendWhatsAppMessage(matchedReferrerMember.fullName, matchedReferrerMember.whatsapp, 'custom', thankYouMsg);
        }
      } else if ((leadToConvert.referredBy || leadToConvert.referrerName) && matchedReferrerMember && referrerRewardType === 'credit') {
        updateMember(matchedReferrerMember.id, {
          notes: `${matchedReferrerMember.notes || ''} [Referral Credit: ₹${referrerCreditAmount} credit on renewal for referring ${leadToConvert.fullName}]`.trim()
        });
      }

      // 2. Send WhatsApp activation message with self-contained, shareable pass URL
      const passUrl = generateShareablePassUrl(newMem, baseUrl);
      const discountNote = referralDiscount > 0 ? `\n🎁 Referral Discount Applied: ₹${referralDiscount.toLocaleString('en-IN')} OFF` : '';
      const msg = `Hello ${newMem.fullName}! 🎉 Your Red Apple Gym and Fitness Center membership has been APPROVED & ACTIVATED.\n\nMember ID: ${newMem.memberId}\nPlan: ${newMem.plan} Pass (${convertCategory}) (₹${newMem.totalFee.toLocaleString('en-IN')})${discountNote}\nExpiry Date: ${newMem.expiryDate} (${newMem.remainingDaysText})\nCoach: ${trainer.fullName}\n\n📱 View your Digital Holographic Pass here:\n${passUrl}`;
      sendWhatsAppMessage(newMem.fullName, newMem.whatsapp, 'welcome_kit', msg);

      alert(`Success! ${leadToConvert.fullName} has been activated as Member ID ${newMem.memberId}! Digital pass URL created.`);
    }
    setLeadToConvert(null);
  };

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadToReject) return;

    updateLeadStatus(leadToReject.id, 'Rejected');

    if (notifyOnReject && leadToReject.whatsapp) {
      const rejectMsg = `Hello ${leadToReject.fullName},\n\nRegarding your membership registration at Red Apple Gym and Fitness Center (CIDCO N-2, Ref: ${leadToReject.leadId}):\n\nYour application could not be approved at this time.\nReason: ${rejectReason}\n\nFor any questions or clarification, please reach out to our front desk at +91 85519 19595.`;
      sendWhatsAppMessage(leadToReject.fullName, leadToReject.whatsapp, 'admission_link', rejectMsg);
    }

    alert(`Application for ${leadToReject.fullName} (${leadToReject.leadId}) has been rejected.`);
    setLeadToReject(null);
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const livePreview = calculateExpiryInfo(todayStr, convertPlan, customDays);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-[#1A1A1A] font-serif">
          Admission Pipeline & Member Activation Center
        </h2>
        <p className="text-xs text-[#666666] mt-0.5">
          Review incoming applications with mandatory passport photos • Set membership fees, collect payments & activate digital passes
        </p>
      </div>

      {/* Admission Link Generator Card */}
      <div className="p-6 rounded-3xl bg-white border border-black/10 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-black/10 pb-4">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-[#C41E3A]" />
            <h3 className="text-base font-bold text-[#1A1A1A] font-serif">
              Official Digital Admission Link
            </h3>
          </div>
          <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold">WhatsApp Ready</span>
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-[#71717A] block mb-1.5">
            Shareable URL (Applicants submit details & photo)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={generatedAdmissionUrl}
              className="flex-1 px-4 py-2.5 rounded-xl bg-[#F8F6F4] border border-black/10 text-xs text-[#C41E3A] font-mono outline-none font-semibold"
            />
            <button
              onClick={handleCopy}
              className="px-5 py-2.5 rounded-xl bg-[#F8F6F4] hover:bg-neutral-200 border border-black/10 text-xs font-bold text-[#1A1A1A] flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-[#71717A]" />}
              <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
            </button>
          </div>
        </div>

        {/* WhatsApp Share Box */}
        <div className="p-4 rounded-2xl bg-[#F8F6F4] border border-black/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="text-xs text-[#4A4A4A]">
            <strong className="text-[#1A1A1A] block font-bold mb-0.5">Pre-Formatted WhatsApp Message:</strong>
            <span className="italic text-[#666666]">{defaultWhatsAppMsg}</span>
          </div>

          <a
            href={generateWhatsAppLink('', defaultWhatsAppMsg)}
            target="_blank"
            rel="noreferrer"
            className="px-5 py-2.5 rounded-xl bg-[#00C853] hover:bg-[#00B046] text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-xs shrink-0 cursor-pointer transition-all"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Send via WhatsApp</span>
          </a>
        </div>
      </div>

      {/* Incoming Leads Table with Mandatory Photo */}
      <div className="rounded-3xl bg-white border border-black/10 overflow-hidden shadow-xs p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-black/10 pb-3 gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="text-base font-bold text-[#1A1A1A] font-serif">
                Incoming Applicant Pipeline ({leads.length} Total)
              </h3>
              <button
                type="button"
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#F8F6F4] hover:bg-neutral-200 border border-black/10 text-[11px] font-bold text-[#1A1A1A] transition-colors cursor-pointer"
                title="Refresh admissions pipeline from cloud"
              >
                <RotateCcw className={`w-3 h-3 text-[#C41E3A] ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{isRefreshing ? 'Syncing...' : 'Sync'}</span>
              </button>
            </div>
            <p className="text-xs text-[#666666]">
              Review applicants, collect admission fees or approve registrations.
            </p>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#F8F6F4] border border-black/5 self-start sm:self-auto text-xs">
            {(['All', 'Pending', 'Converted', 'Rejected'] as const).map((tab) => {
              const count =
                tab === 'All'
                  ? leads.length
                  : tab === 'Pending'
                  ? leads.filter((l) => l.status === 'Pending' || l.status === 'Contacted').length
                  : leads.filter((l) => l.status === tab).length;

              const label =
                tab === 'All' ? 'All' : tab === 'Pending' ? 'Pending' : tab === 'Converted' ? 'Approved' : 'Rejected';

              const isActive = statusFilter === tab;

              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setStatusFilter(tab)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? tab === 'Rejected'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : tab === 'Converted'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-[#C41E3A] text-white shadow-xs'
                      : 'text-[#71717A] hover:text-[#1A1A1A]'
                  }`}
                >
                  <span>{label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-black/5 text-neutral-600'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8F6F4] text-[#71717A] uppercase text-[10px] font-bold tracking-wider border-b border-black/10">
              <tr>
                <th className="p-3">Applicant & Photo</th>
                <th className="p-3">Contact Info</th>
                <th className="p-3">Target Goal</th>
                <th className="p-3">Requested Plan</th>
                <th className="p-3">Application Status</th>
                <th className="p-3 text-right">Admin Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {leads.filter((l) => {
                if (statusFilter === 'All') return true;
                if (statusFilter === 'Pending') return l.status === 'Pending' || l.status === 'Contacted';
                return l.status === statusFilter;
              }).length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[#8A8A8A]">
                    No applications found matching the "{statusFilter}" filter.
                  </td>
                </tr>
              ) : (
                leads
                  .filter((l) => {
                    if (statusFilter === 'All') return true;
                    if (statusFilter === 'Pending') return l.status === 'Pending' || l.status === 'Contacted';
                    return l.status === statusFilter;
                  })
                  .map((lead) => (
                    <tr key={lead.id} className="hover:bg-black/[0.02]">
                      {/* Athlete & Photo */}
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={lead.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80'}
                            alt={lead.fullName}
                            className="w-11 h-11 rounded-xl object-cover border border-black/10 shrink-0 shadow-xs"
                          />
                          <div>
                            <div className="font-bold text-[#1A1A1A] text-sm">
                              {lead.fullName}
                            </div>
                            <div className="text-[10px] text-[#71717A] font-mono">
                              {lead.leadId} • {lead.age} yrs • {lead.gender} {lead.weight ? `• ${lead.weight} kg` : ''}
                            </div>
                            {(lead.chest || lead.biceps || lead.waist) && (
                              <div className="text-[9px] text-neutral-400 font-mono">
                                {[
                                  lead.chest ? `C: ${lead.chest}"` : '',
                                  lead.biceps ? `B: ${lead.biceps}"` : '',
                                  lead.waist ? `W: ${lead.waist}"` : ''
                                ].filter(Boolean).join(' ')}
                              </div>
                            )}
                            {lead.referredBy && (
                              <div className="inline-flex items-center gap-1 mt-0.5 text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                                <Gift className="w-2.5 h-2.5 text-amber-600 shrink-0" />
                                <span className="truncate max-w-[140px]">Ref: {lead.referredBy}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="p-3 font-mono text-[#4A4A4A]">
                        <div>{lead.mobile}</div>
                        <div className="text-[10px] text-[#8A8A8A] truncate max-w-[140px]">{lead.email}</div>
                      </td>

                      {/* Goal */}
                      <td className="p-3 text-[#4A4A4A] max-w-xs">{lead.goal}</td>

                      {/* Plan */}
                      <td className="p-3 font-semibold text-[#1A1A1A]">
                        <div>{lead.preferredPlan} Pass</div>
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md mt-0.5 ${
                            lead.category === 'Gym + Cardio'
                              ? 'bg-red-50 text-[#C41E3A] border border-red-200'
                              : 'bg-neutral-100 text-neutral-700'
                          }`}
                        >
                          {lead.category || 'Gym Only'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="p-3">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                            lead.status === 'Converted'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : lead.status === 'Rejected'
                              ? 'bg-rose-100 text-rose-800 border border-rose-300'
                              : lead.status === 'Contacted'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-blue-100 text-blue-800 border border-blue-300'
                          }`}
                        >
                          {lead.status === 'Converted'
                            ? 'Active Member'
                            : lead.status === 'Rejected'
                            ? 'Rejected'
                            : 'Pending Review'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={generateWhatsAppLink(
                              lead.whatsapp,
                              `Hello ${lead.fullName}! RedApple Gym Admin here regarding your application (${lead.leadId}) for the ${lead.preferredPlan} membership.`
                            )}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 transition-colors"
                            title="Chat on WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>

                          {lead.status === 'Converted' ? (
                            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200">
                              Enrolled
                            </span>
                          ) : lead.status === 'Rejected' ? (
                            <button
                              type="button"
                              onClick={() => updateLeadStatus(lead.id, 'Pending')}
                              className="px-2.5 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold text-[11px] flex items-center gap-1 transition-colors"
                              title="Reopen Application"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Reopen</span>
                            </button>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenConvertModal(lead)}
                                className="px-3 py-1.5 rounded-lg bg-[#00C853] hover:bg-[#00B046] text-white font-bold uppercase text-[10px] shadow-xs flex items-center gap-1 transition-colors"
                                title="Approve and collect fee"
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Accept &amp; Fee</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setLeadToReject(lead);
                                  setRejectReason('Application details could not be verified');
                                }}
                                className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold uppercase text-[10px] border border-rose-200 flex items-center gap-1 transition-colors"
                                title="Reject Admission"
                              >
                                <XCircle className="w-3 h-3" />
                                <span>Reject</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View: Clean Card View with only essential details */}
        <div className="md:hidden divide-y divide-black/5 -mx-2">
          {leads.filter((l) => {
            if (statusFilter === 'All') return true;
            if (statusFilter === 'Pending') return l.status === 'Pending' || l.status === 'Contacted';
            return l.status === statusFilter;
          }).length === 0 ? (
            <div className="p-8 text-center text-[#8A8A8A] text-xs">
              No applications in "{statusFilter}" view.
            </div>
          ) : (
            leads
              .filter((l) => {
                if (statusFilter === 'All') return true;
                if (statusFilter === 'Pending') return l.status === 'Pending' || l.status === 'Contacted';
                return l.status === statusFilter;
              })
              .map((lead) => (
                <div key={lead.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={lead.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80'}
                        alt={lead.fullName}
                        className="w-12 h-12 rounded-xl object-cover border border-black/10 shrink-0 shadow-xs"
                      />
                      <div className="min-w-0">
                        <div className="font-bold text-[#1A1A1A] text-sm leading-tight truncate">
                          {lead.fullName}
                        </div>
                        <div className="text-[11px] text-[#71717A] font-mono mt-0.5">
                          {lead.mobile}
                        </div>
                        <div className="text-[10px] text-[#71717A] mt-0.5">
                          Requested: <strong className="text-[#1A1A1A]">{lead.preferredPlan} Pass ({lead.category || 'Gym Only'})</strong>
                        </div>
                        {lead.referredBy && (
                          <div className="inline-flex items-center gap-1 mt-1 text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                            <Gift className="w-2.5 h-2.5 text-amber-600 shrink-0" />
                            <span>Ref: {lead.referredBy}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        lead.status === 'Converted'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : lead.status === 'Rejected'
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : 'bg-blue-100 text-blue-800 border border-blue-300'
                      }`}
                    >
                      {lead.status === 'Converted' ? 'Active' : lead.status === 'Rejected' ? 'Rejected' : 'Pending'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <a
                      href={generateWhatsAppLink(
                        lead.whatsapp,
                        `Hello ${lead.fullName}! Red Apple Gym Admin here regarding your application (${lead.leadId}) for the ${lead.preferredPlan} (${lead.category || 'Gym Only'}) membership.`
                      )}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-semibold flex items-center justify-center gap-1.5"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>

                    {lead.status === 'Converted' ? (
                      <span className="flex-1 py-2 rounded-xl bg-[#F8F6F4] text-[#71717A] text-xs font-semibold text-center">
                        Enrolled
                      </span>
                    ) : lead.status === 'Rejected' ? (
                      <button
                        type="button"
                        onClick={() => updateLeadStatus(lead.id, 'Pending')}
                        className="flex-1 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-semibold text-xs flex items-center justify-center gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reopen Application</span>
                      </button>
                    ) : (
                      <div className="flex-1 flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenConvertModal(lead)}
                          className="flex-1 py-2 rounded-xl bg-[#00C853] hover:bg-[#00B046] text-white font-bold uppercase text-xs shadow-xs flex items-center justify-center gap-1"
                        >
                          <DollarSign className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setLeadToReject(lead);
                            setRejectReason('Application details could not be verified');
                          }}
                          className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold uppercase text-xs border border-rose-200 flex items-center justify-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
          )}
        </div>
      </div>

      {/* ADMIN-ONLY Convert & Fee Configuration Modal */}
      {leadToConvert && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-black/10 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-in zoom-in-95 text-xs text-[#1A1A1A] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-black/10 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#C41E3A]" />
                <h3 className="text-lg font-bold text-[#1A1A1A] font-serif">
                  Admin Fee Entry & Member Activation
                </h3>
              </div>
              <button onClick={() => setLeadToConvert(null)} className="text-[#71717A] hover:text-[#1A1A1A]">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Applicant Summary */}
            <div className="p-4 rounded-2xl bg-[#F8F6F4] border border-black/5 flex items-center gap-3.5">
              <img
                src={leadToConvert.photo}
                alt={leadToConvert.fullName}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-[#C41E3A]"
              />
              <div>
                <h4 className="font-bold text-[#1A1A1A] text-sm">
                  {leadToConvert.fullName}
                </h4>
                <div className="text-[11px] text-[#71717A] font-mono">
                  {leadToConvert.mobile} • {leadToConvert.email}
                </div>
                <div className="text-[10px] text-[#C41E3A] font-semibold mt-0.5">
                  Requested Tier: {leadToConvert.preferredPlan} Pass ({leadToConvert.category || 'Gym Only'}) {leadToConvert.weight ? `• ${leadToConvert.weight} kg` : ''}
                </div>
                {(leadToConvert.chest || leadToConvert.biceps || leadToConvert.waist) && (
                  <div className="text-[10px] text-neutral-500 font-mono mt-0.5">
                    {[
                      leadToConvert.chest ? `Chest: ${leadToConvert.chest}"` : '',
                      leadToConvert.biceps ? `Biceps: ${leadToConvert.biceps}"` : '',
                      leadToConvert.waist ? `Waist: ${leadToConvert.waist}"` : ''
                    ].filter(Boolean).join(' • ')}
                  </div>
                )}
                {leadToConvert.referredBy && (
                  <div className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                    <Gift className="w-3 h-3 text-amber-600 shrink-0" />
                    <span>Referred by: {leadToConvert.referredBy}</span>
                  </div>
                )}
              </div>
            </div>

            <form onSubmit={handleConfirmConvert} className="space-y-4">
              {/* Category Switcher in Modal */}
              <div>
                <label className="font-bold uppercase tracking-wider text-[#71717A] block mb-1.5">
                  Membership Category
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleCategoryChange('Gym Only')}
                    className={`p-2.5 rounded-xl border text-center font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      convertCategory === 'Gym Only'
                        ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-xs'
                        : 'bg-[#F8F6F4] text-neutral-600 border-black/10 hover:border-black/20'
                    }`}
                  >
                    <Dumbbell className="w-3.5 h-3.5 text-[#C41E3A]" />
                    <span>Gym Only</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCategoryChange('Gym + Cardio')}
                    className={`p-2.5 rounded-xl border text-center font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      convertCategory === 'Gym + Cardio'
                        ? 'bg-[#C41E3A] text-white border-[#C41E3A] shadow-xs'
                        : 'bg-[#F8F6F4] text-neutral-600 border-black/10 hover:border-black/20'
                    }`}
                  >
                    <Flame className="w-3.5 h-3.5" />
                    <span>Gym + Cardio</span>
                  </button>
                </div>
              </div>

              {/* Plan Picker */}
              <div>
                <label className="font-bold uppercase tracking-wider text-[#71717A] block mb-1">
                  Confirm Membership Plan Tier
                </label>
                <select
                  value={convertPlan}
                  onChange={(e) => handlePlanChange(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F6F4] border border-black/10 text-[#1A1A1A] outline-none focus:bg-white focus:border-[#C41E3A]"
                >
                  {membershipPlans.map((p) => {
                    const price = convertCategory === 'Gym + Cardio' ? p.gymCardioPrice : p.gymOnlyPrice;
                    return (
                      <option key={p.type} value={p.type}>
                        {p.name} ({p.durationLabel} • ₹{price.toLocaleString('en-IN')})
                      </option>
                    );
                  })}
                  <option value="Custom">Custom Plan</option>
                </select>
              </div>

              {convertPlan === 'Custom' && (
                <div>
                  <label className="font-bold uppercase tracking-wider text-[#71717A] block mb-1">
                    Custom Duration (Days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={customDays}
                    onChange={(e) => setCustomDays(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-[#F8F6F4] border border-black/10 text-[#1A1A1A] outline-none focus:bg-white"
                  />
                </div>
              )}

              {/* ADMIN REFERRAL & DISCOUNT CONTROLS */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-amber-500/[0.08] via-orange-500/[0.04] to-transparent border border-amber-500/25 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-[#8A5A1F] uppercase tracking-wider">
                    <Gift className="w-4 h-4 text-amber-600" />
                    <span>Referral Discount &amp; Reward Controls</span>
                  </div>
                  {leadToConvert.referredBy ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                      Referred Lead
                    </span>
                  ) : (
                    <span className="text-[10px] text-neutral-500 font-semibold">Manual Discount</span>
                  )}
                </div>

                {/* Referrer Details */}
                {leadToConvert.referredBy && (
                  <div className="p-2.5 rounded-xl bg-white border border-amber-200/80 text-xs space-y-1">
                    <div className="text-[11px] text-neutral-600 flex items-center justify-between">
                      <span>Referred by:</span>
                      <strong className="text-[#1A1A1A] font-bold">{leadToConvert.referredBy}</strong>
                    </div>
                    {matchedReferrerMember ? (
                      <div className="text-[10px] text-emerald-800 bg-emerald-50 p-1.5 rounded-lg flex items-center justify-between font-medium">
                        <span>✓ Active Gym Member: <strong>{matchedReferrerMember.fullName}</strong> ({matchedReferrerMember.memberId})</span>
                        <span className="font-mono text-[9px] text-emerald-700">Expiry: {matchedReferrerMember.expiryDate}</span>
                      </div>
                    ) : (
                      <div className="text-[10px] text-amber-800">
                        Notice: No exact ID match found in current member list.
                      </div>
                    )}
                  </div>
                )}

                {/* Control 1: New Member Fee Discount */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-bold uppercase text-[10px] text-[#71717A]">
                      1. Discount for New Member
                    </label>
                    {referralDiscount > 0 && (
                      <span className="text-[10px] font-bold text-emerald-700">
                        -₹{referralDiscount.toLocaleString('en-IN')} Applied
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { label: 'No Discount', value: 0 },
                      { label: '₹200 Off', value: 200 },
                      { label: '₹300 Off', value: 300 },
                      { label: '₹500 Off', value: 500 }
                    ].map((btn) => (
                      <button
                        key={btn.value}
                        type="button"
                        onClick={() => handleApplyReferralDiscount(btn.value)}
                        className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                          referralDiscount === btn.value
                            ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                            : 'bg-white text-neutral-700 border-black/10 hover:border-black/20'
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[11px] text-[#71717A] font-semibold">Custom Discount (₹):</span>
                    <input
                      type="number"
                      min="0"
                      step="50"
                      value={referralDiscount || ''}
                      onChange={(e) => handleApplyReferralDiscount(Number(e.target.value))}
                      placeholder="e.g. 250"
                      className="w-28 px-2.5 py-1 rounded-lg bg-white border border-amber-300 text-xs font-mono font-bold text-[#1A1A1A] outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>

                {/* Control 2: Referrer Member Reward (if matched) */}
                {matchedReferrerMember && (
                  <div className="pt-2 border-t border-amber-200/60 space-y-2">
                    <label className="font-bold uppercase text-[10px] text-[#71717A] block">
                      2. Reward for Referring Friend ({matchedReferrerMember.fullName})
                    </label>

                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setReferrerRewardType('extension');
                          setReferrerBonusDays(15);
                        }}
                        className={`p-2 rounded-xl border text-center text-[10px] font-bold transition-all cursor-pointer ${
                          referrerRewardType === 'extension' && referrerBonusDays === 15
                            ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-xs'
                            : 'bg-white text-neutral-700 border-black/10 hover:border-black/20'
                        }`}
                      >
                        <div>+15 Free Days</div>
                        <span className="text-[9px] text-amber-500 font-normal">Extension</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setReferrerRewardType('extension');
                          setReferrerBonusDays(30);
                        }}
                        className={`p-2 rounded-xl border text-center text-[10px] font-bold transition-all cursor-pointer ${
                          referrerRewardType === 'extension' && referrerBonusDays === 30
                            ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-xs'
                            : 'bg-white text-neutral-700 border-black/10 hover:border-black/20'
                        }`}
                      >
                        <div>+30 Free Days</div>
                        <span className="text-[9px] text-amber-500 font-normal">1 Month Free</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setReferrerRewardType('none')}
                        className={`p-2 rounded-xl border text-center text-[10px] font-bold transition-all cursor-pointer ${
                          referrerRewardType === 'none'
                            ? 'bg-neutral-200 text-neutral-800 border-neutral-300'
                            : 'bg-white text-neutral-500 border-black/10'
                        }`}
                      >
                        <div>No Reward</div>
                        <span className="text-[9px] text-neutral-400 font-normal">Skip</span>
                      </button>
                    </div>

                    {referrerRewardType === 'extension' && (
                      <div className="flex items-center gap-2 pt-1 text-[11px]">
                        <span className="text-[#71717A] font-semibold">Bonus Free Days:</span>
                        <input
                          type="number"
                          min="0"
                          max="365"
                          value={referrerBonusDays}
                          onChange={(e) => setReferrerBonusDays(Number(e.target.value))}
                          className="w-20 px-2 py-1 rounded-lg bg-white border border-amber-300 text-xs font-mono font-bold text-[#1A1A1A] outline-none"
                        />
                        <span className="text-neutral-500 font-medium">days added to expiry</span>
                      </div>
                    )}

                    {referrerRewardType === 'extension' && (
                      <p className="text-[10px] text-emerald-800 font-medium">
                        ✓ Upon approval, {matchedReferrerMember.fullName}&apos;s membership will automatically extend by +{referrerBonusDays} days and send a WhatsApp thank-you!
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* ADMIN-ONLY FEE & PAYMENT ENTRY */}
              <div className="p-4 rounded-2xl bg-[#F8F6F4] border border-black/10 space-y-3">
                <div className="text-xs font-bold text-[#C41E3A] uppercase tracking-wider">
                  Admin Financial Entry
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold uppercase text-[10px] text-[#71717A] block mb-1">
                      Total Membership Fee (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={feeAmount}
                      onChange={(e) => handleFeeChange(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-black/10 text-[#1A1A1A] font-mono font-bold outline-none focus:border-[#C41E3A]"
                    />
                  </div>

                  <div>
                    <label className="font-bold uppercase text-[10px] text-[#71717A] block mb-1">
                      Amount Paid Today (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={amountPaid}
                      onChange={(e) => handlePaidChange(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-black/10 text-[#1A1A1A] font-mono font-bold outline-none focus:border-[#C41E3A]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold uppercase text-[10px] text-[#71717A] block mb-1">
                      Payment Mode
                    </label>
                    <select
                      value={paymentMode}
                      onChange={(e) => setPaymentMode(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-black/10 text-[#1A1A1A] outline-none"
                    >
                      <option value="UPI">UPI / QR Code</option>
                      <option value="Cash">Cash Deposit</option>
                      <option value="Card">Credit / Debit Card</option>
                      <option value="Bank Transfer">Bank Transfer (NEFT/IMPS)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold uppercase text-[10px] text-[#71717A] block mb-1">
                      Remaining Due Balance (₹)
                    </label>
                    <input
                      type="number"
                      readOnly
                      value={dueAmount}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-black/10 text-amber-900 font-mono font-bold outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Automatic Expiry Preview */}
              <div className="p-3 rounded-xl bg-[#F8F6F4] border border-black/5 flex items-center justify-between text-[11px]">
                <span className="text-[#71717A]">Calculated Expiry Date:</span>
                <span className="font-mono font-bold text-[#C41E3A]">{livePreview.expiryDate} ({livePreview.remainingDaysText})</span>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setLeadToConvert(null)}
                  className="px-4 py-2.5 rounded-xl bg-[#F8F6F4] hover:bg-neutral-200 text-[#4A4A4A] font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#00C853] hover:bg-[#00B046] text-white font-bold uppercase tracking-wider shadow-xs flex items-center gap-2 cursor-pointer transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Activate Membership Pass</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ADMIN-ONLY Reject Admission Modal */}
      {leadToReject && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-black/10 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 text-xs text-[#1A1A1A]">
            <div className="flex items-center justify-between border-b border-black/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <UserX className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1A1A1A] font-serif">
                    Reject Admission Application
                  </h3>
                  <p className="text-[10px] text-[#71717A]">Application ID: {leadToReject.leadId}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setLeadToReject(null)}
                className="text-[#71717A] hover:text-[#1A1A1A]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Applicant Summary */}
            <div className="p-3 rounded-2xl bg-[#F8F6F4] border border-black/5 flex items-center gap-3">
              <img
                src={leadToReject.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80'}
                alt={leadToReject.fullName}
                className="w-11 h-11 rounded-xl object-cover border border-black/10 shrink-0"
              />
              <div className="min-w-0">
                <div className="font-bold text-[#1A1A1A] text-xs truncate">{leadToReject.fullName}</div>
                <div className="text-[10px] text-[#71717A] font-mono">{leadToReject.mobile}</div>
                <div className="text-[10px] text-[#C41E3A]">
                  Requested: {leadToReject.preferredPlan} ({leadToReject.category || 'Gym Only'})
                </div>
              </div>
            </div>

            <form onSubmit={handleConfirmReject} className="space-y-4">
              <div>
                <label className="font-bold uppercase tracking-wider text-[#71717A] text-[10px] block mb-1">
                  Reason for Rejection *
                </label>
                <select
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#F8F6F4] border border-black/10 text-[#1A1A1A] text-xs outline-none focus:bg-white focus:border-rose-400"
                >
                  <option value="Duplicate or repeat registration">Duplicate or repeat registration</option>
                  <option value="Incomplete or unverified personal information">Incomplete or unverified personal information</option>
                  <option value="Invalid or unclear passport photo">Invalid or unclear passport photo</option>
                  <option value="Minor applicant without parent/guardian consent">Minor applicant without parent/guardian consent</option>
                  <option value="Medical condition requires doctor certificate first">Medical condition requires doctor certificate first</option>
                  <option value="Applicant withdrew membership request">Applicant withdrew membership request</option>
                  <option value="Other administrative reason">Other administrative reason</option>
                </select>
              </div>

              {/* Notify applicant via WhatsApp */}
              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-[#F8F6F4] border border-black/5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyOnReject}
                  onChange={(e) => setNotifyOnReject(e.target.checked)}
                  className="rounded text-[#C41E3A] focus:ring-0 mt-0.5"
                />
                <div className="text-[11px]">
                  <span className="font-bold text-[#1A1A1A] block">Send Polite WhatsApp Notification</span>
                  <span className="text-[#71717A] text-[10px]">
                    Alerts applicant on WhatsApp that their form cannot be approved with contact number to clarify.
                  </span>
                </div>
              </label>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setLeadToReject(null)}
                  className="px-4 py-2.5 rounded-xl bg-[#F8F6F4] hover:bg-neutral-200 text-[#4A4A4A] font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold uppercase tracking-wider text-xs shadow-xs flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <UserX className="w-4 h-4" />
                  <span>Confirm Rejection</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

