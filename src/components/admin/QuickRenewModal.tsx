'use client';

import React, { useState } from 'react';
import { Member, MembershipPlanType, PaymentMode } from '@/lib/types';
import { useApp, PLAN_DAYS_MAP, PLAN_PRICE_MAP } from '@/lib/store';
import { formatFriendlyDate, calculateRenewalExpiryDate, calculateMembershipCountdown } from '@/lib/dateUtils';
import {
  RefreshCw,
  X,
  CheckCircle2,
  Calendar,
  IndianRupee,
  CreditCard,
  Clock,
  Sparkles
} from 'lucide-react';

interface QuickRenewModalProps {
  member: Member;
  onClose: () => void;
}

const TIER_OPTIONS: { plan: MembershipPlanType; label: string; days: number; price: number }[] = [
  { plan: 'Monthly', label: '1 Month', days: 30, price: 800 },
  { plan: 'Quarterly', label: '3 Months', days: 90, price: 2100 },
  { plan: 'Half-Yearly', label: '6 Months', days: 180, price: 4000 },
  { plan: 'Annual', label: '1 Year', days: 365, price: 7000 },
  { plan: 'Custom', label: 'Custom Duration', days: 30, price: 800 }
];

export const QuickRenewModal: React.FC<QuickRenewModalProps> = ({ member, onClose }) => {
  const { renewMember } = useApp();

  const [selectedPlan, setSelectedPlan] = useState<MembershipPlanType>('Quarterly');
  const [customDays, setCustomDays] = useState<number>(30);
  const [customPrice, setCustomPrice] = useState<number>(1000);

  // Fee and collection details
  const planOption = TIER_OPTIONS.find((t) => t.plan === selectedPlan);
  const totalAmountToCollect = selectedPlan === 'Custom' ? customPrice : (planOption?.price || 2100);
  const durationDays = selectedPlan === 'Custom' ? customDays : (planOption?.days || 90);

  const [amountPaid, setAmountPaid] = useState<number>(totalAmountToCollect);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('UPI');
  const [renewSuccess, setRenewSuccess] = useState(false);

  // Live calculation of new expiry date
  const { newExpiryDate, startsFrom } = calculateRenewalExpiryDate(member.expiryDate, durationDays);
  const newCountdown = calculateMembershipCountdown(newExpiryDate);

  // Outstanding balance
  const outstandingBalance = Math.max(0, totalAmountToCollect - amountPaid);

  const handlePlanSelect = (plan: MembershipPlanType) => {
    setSelectedPlan(plan);
    const opt = TIER_OPTIONS.find((t) => t.plan === plan);
    if (opt && plan !== 'Custom') {
      setAmountPaid(opt.price);
    }
  };

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    renewMember(
      member.id,
      selectedPlan,
      selectedPlan === 'Custom' ? customDays : undefined,
      selectedPlan === 'Custom' ? customPrice : undefined,
      {
        amountPaid,
        paymentMode
      }
    );
    setRenewSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-7 border border-black/10 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-black/5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#C41E3A]/10 text-[#C41E3A] flex items-center justify-center">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1A1A1A] font-serif">
                Quick Renew Membership
              </h3>
              <p className="text-[11px] text-[#666666]">
                Extend expiry date & record renewal payment
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-500 hover:text-[#1A1A1A] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {renewSuccess ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-[#1A1A1A] font-serif">
              Membership Renewed Successfully!
            </h4>
            <p className="text-xs text-[#4A4A4A]">
              Athlete <strong className="text-[#1A1A1A]">{member.fullName}</strong> renewed on{' '}
              <strong>{selectedPlan}</strong> plan until{' '}
              <strong className="text-[#C41E3A]">{formatFriendlyDate(newExpiryDate)}</strong> ({newCountdown.remainingDaysText}).
            </p>
          </div>
        ) : (
          <form onSubmit={handleConfirm} className="space-y-4 text-xs">
            {/* Member Current Status Strip */}
            <div className="p-3.5 rounded-2xl bg-[#F8F6F4] border border-black/5 flex items-center justify-between">
              <div>
                <div className="font-bold text-sm text-[#1A1A1A]">{member.fullName}</div>
                <div className="text-[11px] text-[#666666] flex items-center gap-2 mt-0.5">
                  <span className="font-mono text-[#8B1528] font-bold">{member.memberId}</span>
                  <span>•</span>
                  <span>Current: <strong>{member.plan}</strong></span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase font-bold text-[#8A8A8A]">Current Expiry</div>
                <div className="text-xs font-bold text-[#C41E3A]">{formatFriendlyDate(member.expiryDate)}</div>
              </div>
            </div>

            {/* Select Membership Tier */}
            <div>
              <label className="text-[11px] font-bold text-[#1A1A1A] block mb-1.5">
                Select Renewal Plan Tier
              </label>
              <div className="grid grid-cols-2 gap-2">
                {TIER_OPTIONS.filter((t) => t.plan !== 'Custom').map((opt) => {
                  const isSelected = selectedPlan === opt.plan;
                  return (
                    <button
                      type="button"
                      key={opt.plan}
                      onClick={() => handlePlanSelect(opt.plan)}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        isSelected
                          ? 'border-[#C41E3A] bg-[#C41E3A]/5 shadow-xs'
                          : 'border-black/10 hover:border-black/20 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`font-bold text-xs ${isSelected ? 'text-[#8B1528]' : 'text-[#1A1A1A]'}`}>
                          {opt.label}
                        </span>
                        <span className="font-serif font-bold text-[#C41E3A]">
                          ₹{opt.price.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="text-[10px] text-neutral-500 mt-0.5">
                        {opt.days} Days Access
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Custom Plan Option Button */}
              <button
                type="button"
                onClick={() => handlePlanSelect('Custom')}
                className={`mt-2 w-full p-2.5 rounded-2xl border text-left transition-all flex items-center justify-between ${
                  selectedPlan === 'Custom'
                    ? 'border-[#C41E3A] bg-[#C41E3A]/5'
                    : 'border-black/10 hover:border-black/20 bg-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`font-bold text-xs ${selectedPlan === 'Custom' ? 'text-[#8B1528]' : 'text-[#1A1A1A]'}`}>
                    Custom Duration & Fee
                  </span>
                </div>
                <span className="text-[11px] text-neutral-500">Customized</span>
              </button>

              {/* Custom Inputs */}
              {selectedPlan === 'Custom' && (
                <div className="mt-2.5 grid grid-cols-2 gap-2.5 p-3 rounded-2xl bg-[#F8F6F4] border border-black/5 animate-in fade-in">
                  <div>
                    <label className="text-[10px] font-bold text-[#666666] block mb-1">
                      Duration (Days)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={365}
                      value={customDays}
                      onChange={(e) => setCustomDays(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-xl bg-white border border-black/10 text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#666666] block mb-1">
                      Custom Fee (₹)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={customPrice}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setCustomPrice(val);
                        setAmountPaid(val);
                      }}
                      className="w-full px-3 py-1.5 rounded-xl bg-white border border-black/10 text-xs font-semibold"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Expiry Date Preview Box */}
            <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-800 shrink-0" />
                <div>
                  <div className="text-[10px] uppercase font-bold text-amber-900 tracking-wider">
                    New Expiry Date Preview
                  </div>
                  <div className="text-sm font-bold text-[#1A1A1A] font-serif">
                    {formatFriendlyDate(newExpiryDate)}
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-amber-200 text-amber-900">
                +{durationDays} Days Added
              </span>
            </div>

            {/* Payment & Collection Details */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-[11px] font-bold text-[#1A1A1A] block mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value as PaymentMode)}
                  className="w-full px-3 py-2 rounded-xl bg-[#F8F6F4] border border-black/10 text-xs font-semibold"
                >
                  <option value="UPI">UPI / GPay / PhonePe</option>
                  <option value="Cash">Cash at Desk</option>
                  <option value="Card">Debit/Credit Card</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#1A1A1A] block mb-1">
                  Amount Paid (₹)
                </label>
                <input
                  type="number"
                  min={0}
                  max={totalAmountToCollect}
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-[#F8F6F4] border border-black/10 text-xs font-mono font-bold"
                />
              </div>
            </div>

            {/* Outstanding Balance Note if partial */}
            <div className="flex items-center justify-between text-xs px-1">
              <span className="text-neutral-500">
                Total Fee: <strong className="text-[#1A1A1A]">₹{totalAmountToCollect.toLocaleString('en-IN')}</strong>
              </span>
              <span className={outstandingBalance > 0 ? 'text-[#C41E3A] font-bold' : 'text-emerald-700 font-semibold'}>
                {outstandingBalance > 0
                  ? `Balance Due: ₹${outstandingBalance.toLocaleString('en-IN')}`
                  : 'Fully Paid (No Dues)'}
              </span>
            </div>

            {/* Actions */}
            <div className="pt-2 flex gap-2">
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-[#C41E3A] hover:bg-[#8B1528] text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 active:scale-95"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Confirm & Renew Membership</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-[#1A1A1A] font-semibold text-xs transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
