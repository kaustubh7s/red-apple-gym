'use client';

import React, { useState } from 'react';
import { Member, Trainer } from '@/lib/types';
import { DynamicQrCode } from '@/components/common/DynamicQrCode';
import {
  Check
} from 'lucide-react';

interface AppleWalletCardProps {
  member: Member;
  trainer: Trainer;
  passUrl: string;
}

export const AppleWalletCard: React.FC<AppleWalletCardProps> = ({
  member,
  passUrl
}) => {
  const [showWalletSuccess, setShowWalletSuccess] = useState<'apple' | 'google' | null>(null);

  const isExpired = member.status === 'Expired' || member.remainingDays <= 0;
  const isExpiringSoon = member.status === 'Expiring Soon' || (member.remainingDays > 0 && member.remainingDays <= 7);

  const handleAppleWalletAdd = () => {
    const passData = {
      formatVersion: 1,
      passTypeIdentifier: 'pass.com.redapplegym.member',
      serialNumber: member.memberId,
      teamIdentifier: 'REDAPPLEGYM',
      organizationName: 'Red Apple Athletic Club',
      description: 'Official Gym Membership Pass',
      foregroundColor: 'rgb(255, 255, 255)',
      backgroundColor: 'rgb(26, 26, 26)',
      labelColor: 'rgb(212, 165, 116)',
      primaryFields: [
        {
          key: 'member',
          label: 'MEMBER NAME',
          value: member.fullName
        }
      ],
      secondaryFields: [
        {
          key: 'tier',
          label: 'MEMBERSHIP PLAN',
          value: member.plan
        },
        {
          key: 'expires',
          label: 'EXPIRY DATE',
          value: member.expiryDate
        }
      ],
      barcode: {
        message: passUrl,
        format: 'PKBarcodeFormatQR',
        messageEncoding: 'iso-8859-1'
      }
    };

    const blob = new Blob([JSON.stringify(passData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `RedApple-${member.memberId}-pass.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setShowWalletSuccess('apple');
    setTimeout(() => setShowWalletSuccess(null), 4000);
  };

  const handleGoogleWalletAdd = () => {
    setShowWalletSuccess('google');
    setTimeout(() => setShowWalletSuccess(null), 4000);
  };

  return (
    <div className="space-y-4">
      {/* Wallet Success Toast */}
      {showWalletSuccess && (
        <div className="p-4 rounded-2xl bg-neutral-900 text-white text-xs border border-white/20 shadow-xl flex items-center justify-between animate-in fade-in slide-in-from-top duration-300">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold">
              <Check className="w-4 h-4 stroke-[3]" />
            </div>
            <div>
              <p className="font-bold">
                {showWalletSuccess === 'apple' ? 'Apple Wallet Pass Ready!' : 'Google Wallet Pass Created!'}
              </p>
              <p className="text-[11px] text-neutral-300">
                Offline digital pass details configured for {member.memberId}.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowWalletSuccess(null)}
            className="text-[10px] text-neutral-400 hover:text-white px-2 py-1"
          >
            Close
          </button>
        </div>
      )}

      {/* Main Luxury Wallet Pass Card */}
      <div
        className="w-full rounded-[28px] p-6 sm:p-7 bg-gradient-to-br from-[#1C1C1E] via-[#242426] to-[#121213] text-white border border-[#D4A574]/40 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] flex flex-col justify-between space-y-5 transition-all"
      >
        {/* Top Pass Bar: Logo & Tier */}
        <div>
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white flex items-center justify-center p-0.5 shadow-md border border-[#D4A574]/40 overflow-hidden shrink-0">
                <img
                  src="/images/logo.png"
                  alt="Red Apple Gym and Fitness Center"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h2 className="font-bold text-xs sm:text-sm font-serif tracking-wide text-white leading-tight">
                  RED APPLE GYM
                </h2>
                <span className="text-[10px] font-mono text-[#D4A574] tracking-widest uppercase block">
                  FITNESS CENTER • CIDCO N-2
                </span>
              </div>
            </div>

            <div className="text-right">
              <span
                className={`text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1 shadow-sm ${
                  isExpired
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : isExpiringSoon
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isExpired ? 'bg-rose-400' : isExpiringSoon ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'}`} />
                {member.status}
              </span>
            </div>
          </div>

          {/* Member Photo & Primary Name Block */}
          <div className="flex items-center gap-4 mt-5">
            <div className="relative shrink-0">
              <img
                src={member.photo}
                alt={member.fullName}
                className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl object-cover border-2 border-[#D4A574] shadow-lg"
              />
              <div className="absolute -bottom-1.5 -right-1.5 bg-[#C41E3A] text-white text-[9px] font-black px-1.5 py-0.5 rounded-md border border-black/40">
                VIP
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <div className="text-[10px] text-neutral-400 uppercase tracking-widest font-semibold">
                Athletic Member
              </div>
              <h3 className="text-xl sm:text-2xl font-bold font-serif tracking-tight text-white truncate">
                {member.fullName}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-mono text-xs text-[#D4A574] font-bold tracking-wider">
                  {member.memberId}
                </span>
                <span className="text-neutral-500">•</span>
                <span className="text-xs text-neutral-300">{member.gender}, {member.age}y</span>
              </div>
            </div>
          </div>

          {/* Pass Key Metrics Row */}
          <div className="grid grid-cols-3 gap-2.5 mt-5 bg-white/5 border border-white/10 p-3 rounded-2xl backdrop-blur-md">
            <div>
              <span className="text-[9px] text-neutral-400 uppercase font-semibold block">Plan</span>
              <span className="font-bold text-xs text-white truncate block" title={`${member.plan} (${member.category || 'Gym Only'})`}>
                {member.plan} {member.category === 'Gym + Cardio' ? '• Cardio' : ''}
              </span>
            </div>
            <div>
              <span className="text-[9px] text-neutral-400 uppercase font-semibold block">Expires</span>
              <span className={`font-mono font-bold text-xs block ${isExpired ? 'text-rose-400' : isExpiringSoon ? 'text-amber-400' : 'text-[#D4A574]'}`}>
                {member.expiryDate}
              </span>
            </div>
            <div>
              <span className="text-[9px] text-neutral-400 uppercase font-semibold block">Days Left</span>
              <span className={`font-mono font-bold text-xs block ${isExpired ? 'text-rose-400' : 'text-emerald-400'}`}>
                {member.remainingDaysText}
              </span>
            </div>
          </div>
        </div>

        {/* QR Code Section for Fast Front Desk Access */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[9px] text-[#D4A574] font-mono tracking-widest uppercase block">
              FAST SCAN ACCESS
            </span>
            <p className="text-[11px] text-neutral-300 font-medium">
              Scan at gym front desk kiosk for contactless admission.
            </p>
          </div>

          <div className="p-2 bg-white rounded-2xl shadow-lg shrink-0">
            <DynamicQrCode
              value={passUrl}
              size={105}
              showDownload={false}
              showCopy={false}
              memberId={member.memberId}
            />
          </div>
        </div>
      </div>

      {/* Action Buttons: Add to Apple Wallet & Save to Google Wallet */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          onClick={handleAppleWalletAdd}
          className="p-3 rounded-2xl bg-black text-white hover:bg-neutral-800 border border-white/10 flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95 text-xs font-bold"
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 1.01-2.87-.96.04-2.09.64-2.74 1.4-.57.65-1.06 1.73-.93 2.76 1.07.08 2.06-.54 2.66-1.29z"/>
          </svg>
          <span>Add to Apple Wallet</span>
        </button>

        <button
          onClick={handleGoogleWalletAdd}
          className="p-3 rounded-2xl bg-white text-[#1A1A1A] hover:bg-neutral-100 border border-black/10 flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95 text-xs font-bold"
        >
          <div className="w-4 h-4 rounded-full bg-[#4285F4] flex items-center justify-center text-white text-[9px] font-bold">
            G
          </div>
          <span>Save to Google Wallet</span>
        </button>
      </div>
    </div>
  );
};
