'use client';

import React, { useState, useEffect } from 'react';
import { Member } from '@/lib/types';
import { useApp } from '@/lib/store';
import { QuickRenewModal } from './QuickRenewModal';
import { generateShareablePassUrl } from '@/lib/passUtils';
import {
  X,
  Clock,
  Calendar,
  Phone,
  Mail,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  MessageCircle,
  QrCode,
  ExternalLink,
  Copy,
  Check,
  Gift
} from 'lucide-react';

interface MemberProfileModalProps {
  member: Member;
  onClose: () => void;
  onOpenIdCard?: () => void;
  hideContactDetails?: boolean;
}

export const MemberProfileModal: React.FC<MemberProfileModalProps> = ({
  member,
  onClose,
  onOpenIdCard,
  hideContactDetails = false
}) => {
  const { trainer, generateWhatsAppLink } = useApp();
  const [quickRenewOpen, setQuickRenewOpen] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);

  const isExpired = member.status === 'Expired' || member.remainingDays <= 0;
  const isExpiringSoon = member.status === 'Expiring Soon' || (member.remainingDays > 0 && member.remainingDays <= 3);

  let bannerText = `Membership Active • ${member.remainingDaysText}`;
  let bannerClass = 'bg-emerald-50 border-emerald-200 text-emerald-900';
  let bannerIcon = CheckCircle2;

  if (isExpired) {
    bannerText = member.remainingDays === 0
      ? 'Membership Expires Today'
      : `Membership Expired (${member.remainingDaysText})`;
    bannerClass = 'bg-rose-50 border-rose-200 text-[#C41E3A]';
    bannerIcon = AlertTriangle;
  } else if (isExpiringSoon) {
    bannerText = `Membership Expiring Soon • ${member.remainingDaysText}`;
    bannerClass = 'bg-amber-50 border-amber-300 text-amber-900';
    bannerIcon = Clock;
  }

  const BannerIcon = bannerIcon;
  const [passUrl, setPassUrl] = useState(`https://redapplefitness.com/pass/${member.memberId}`);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPassUrl(generateShareablePassUrl(member, window.location.origin));
    }
  }, [member]);

  const handleCopyPass = () => {
    navigator.clipboard.writeText(passUrl);
    setCopiedPass(true);
    setTimeout(() => setCopiedPass(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-black/10 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 relative animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-black/10 pb-3">
          <div>
            <h3 className="text-lg font-bold text-[#1A1A1A] font-['Playfair_Display']">
              Member Profile
            </h3>
            <p className="text-xs text-[#71717A]">
              Member ID: <span className="font-mono font-semibold">{member.memberId}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#71717A] hover:text-[#1A1A1A] p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Highlighted Expiry Status Banner */}
        <div className={`p-4 rounded-xl border flex items-center justify-between gap-3 ${bannerClass}`}>
          <div className="flex items-center gap-3">
            <BannerIcon className="w-5 h-5 shrink-0" />
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                Membership Expiry
              </div>
              <div className="text-sm font-bold">
                {bannerText} (Expiry: {member.expiryDate})
              </div>
            </div>
          </div>

          <button
            onClick={() => setQuickRenewOpen(true)}
            className="px-3.5 py-1.5 rounded-lg bg-[#C41E3A] text-white font-semibold text-xs hover:bg-[#A3182E] shadow-2xs shrink-0 flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Renew</span>
          </button>
        </div>

        {/* Member Details */}
        <div className="flex items-start gap-4 p-4 rounded-xl bg-[#F8F6F4] border border-black/5">
          {member.photo ? (
            <img
              src={member.photo}
              alt={member.fullName}
              className="w-16 h-16 rounded-xl object-cover border border-black/10 shrink-0"
            />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-black/5 border border-black/10 flex items-center justify-center font-bold text-xl text-[#1A1A1A] shrink-0">
              {member.fullName.charAt(0)}
            </div>
          )}

          <div className="flex-1 space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-bold text-[#1A1A1A]">{member.fullName}</h4>
              <span className="font-mono text-[11px] text-[#71717A] bg-white px-2 py-0.5 rounded border border-black/10">
                {member.plan}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[#71717A] pt-1">
              {!hideContactDetails && (
                <>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#C41E3A]" />
                    <span className="font-mono text-[#1A1A1A]">{member.mobile}</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <Mail className="w-3.5 h-3.5 text-[#71717A]" />
                    <span className="truncate">{member.email}</span>
                  </div>
                </>
              )}

              <div>
                <span>Joined: </span>
                <span className="font-semibold text-[#1A1A1A]">{member.joinDate}</span>
              </div>
              <div>
                <span>Attendance: </span>
                <span className="font-semibold text-emerald-700">{member.attendancePercentage}%</span>
              </div>
              {member.dateOfBirth && (
                <div className="flex items-center gap-1.5 col-span-2 text-amber-900 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                  <Gift className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Date of Birth: <strong>{member.dateOfBirth}</strong> ({member.age} yrs)</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Digital Pass Link Box */}
        <div className="p-3.5 rounded-xl border border-black/10 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
          <div className="truncate">
            <span className="font-semibold text-[#1A1A1A] flex items-center gap-1.5">
              <QrCode className="w-3.5 h-3.5 text-[#C41E3A]" />
              Digital Member Pass:
            </span>
            <span className="text-[#71717A] font-mono text-[11px] block truncate mt-0.5">
              {passUrl}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopyPass}
              className="px-2.5 py-1 rounded-lg border border-black/10 text-xs font-semibold text-[#1A1A1A] hover:bg-black/5 flex items-center gap-1"
            >
              {copiedPass ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedPass ? 'Copied' : 'Copy'}</span>
            </button>
            <a
              href={`/pass/${member.memberId}`}
              target="_blank"
              rel="noreferrer"
              className="px-2.5 py-1 rounded-lg bg-black/5 hover:bg-black/10 text-xs font-semibold text-[#1A1A1A] flex items-center gap-1"
            >
              <span>View Pass</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-black/10 text-xs">
          {!hideContactDetails ? (
            <a
              href={generateWhatsAppLink(
                member.whatsapp,
                `Hello ${member.fullName},\n\nThis is a notification from Red Apple Gym (CIDCO N-2).\n\nYour ${member.plan} membership ${member.remainingDays <= 0 ? 'expired on' : 'expires on'} ${member.expiryDate} (${member.remainingDaysText}).\n\n📱 Member Pass: ${passUrl}\n\nPlease visit reception for renewals.\n\nRed Apple Gym Management`
              )}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#25D366]/40 text-[#128C7E] bg-[#25D366]/5 hover:bg-[#25D366]/10 font-semibold"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Send WhatsApp Reminder</span>
            </a>
          ) : (
            <div className="text-[11px] text-[#71717A] italic">
              Coach Review Mode
            </div>
          )}

          <div className="flex items-center gap-2">
            {onOpenIdCard && (
              <button
                type="button"
                onClick={onOpenIdCard}
                className="px-3 py-1.5 rounded-lg border border-black/10 text-xs font-semibold text-[#71717A] hover:bg-black/5"
              >
                Print Card
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-black/5 hover:bg-black/10 text-xs font-semibold text-[#1A1A1A]"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {quickRenewOpen && (
        <QuickRenewModal
          member={member}
          onClose={() => {
            setQuickRenewOpen(false);
            onClose();
          }}
        />
      )}
    </div>
  );
};
