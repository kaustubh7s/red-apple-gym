'use client';

import React from 'react';
import { Member } from '@/lib/types';
import { useApp } from '@/lib/store';
import { DynamicQrCode } from '@/components/common/DynamicQrCode';
import { generateShareablePassUrl } from '@/lib/passUtils';
import {
  X,
  Printer,
  Dumbbell,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Share2,
  MessageCircle
} from 'lucide-react';

interface MemberIdCardModalProps {
  member: Member;
  onClose: () => void;
}

export const MemberIdCardModal: React.FC<MemberIdCardModalProps> = ({ member, onClose }) => {
  const { gymSettings, trainer, generateWhatsAppLink } = useApp();

  const [passUrl, setPassUrl] = React.useState(`https://redapplefitness.com/pass/${member.memberId}`);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setPassUrl(generateShareablePassUrl(member, window.location.origin));
    }
  }, [member]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white border border-black/10 rounded-3xl max-w-lg w-full p-5 sm:p-8 shadow-2xl space-y-6 relative animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-black/10 pb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#C41E3A]" />
            <h3 className="text-lg font-bold text-[#1A1A1A] font-['Space_Grotesk']">
              Official Athlete Holographic ID Card & Real QR Pass
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F8F6F4] hover:bg-[#EFECE8] flex items-center justify-center text-[#71717A] hover:text-[#1A1A1A] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Holographic ID Badge - Printable Area */}
        <div className="printable-area max-w-md mx-auto rounded-3xl p-7 hologram-effect border-2 border-[#00F59B]/50 shadow-2xl bg-gradient-to-br from-[#131622] via-[#0E1018] to-[#0A0B10] text-white relative overflow-hidden">
          {/* Top Club Branding */}
          <div className="flex items-center justify-between border-b border-white/15 pb-4 mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#00F59B] text-black flex items-center justify-center font-bold">
                <Dumbbell className="w-4 h-4 -rotate-45" />
              </div>
              <div>
                <span className="font-extrabold text-sm tracking-tight text-white font-['Space_Grotesk'] block leading-none">
                  REDAPPLE
                </span>
                <span className="text-[9px] text-neutral-400 tracking-wider">
                  LUXURY ATHLETICS
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#00F59B] text-black uppercase tracking-wider block">
                {member.status.toUpperCase()}
              </span>
              <span className="text-[9px] text-[#00F59B] font-mono font-bold">
                {member.remainingDaysText}
              </span>
            </div>
          </div>

          {/* Member Photo & Core Info */}
          <div className="flex items-center gap-4 mb-5">
            <div className="relative">
              <img
                src={member.photo}
                alt={member.fullName}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-[#00F59B] shadow-lg"
              />
              <div className="absolute -bottom-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#00F59B] text-black flex items-center justify-center">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-extrabold text-white font-['Space_Grotesk'] leading-tight truncate">
                {member.fullName}
              </h2>
              <div className="text-xs text-[#00F59B] font-mono font-bold mt-0.5">
                ID: {member.memberId}
              </div>
              <div className="text-[11px] text-neutral-300 mt-1">
                Tier: <strong className="text-white">{member.plan} Plan{member.category ? ` • ${member.category}` : ''}</strong>
              </div>
            </div>
          </div>

          {/* Details Table */}
          <div className="grid grid-cols-2 gap-2 text-xs bg-black/50 p-3.5 rounded-2xl border border-white/10 mb-5">
            <div>
              <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Join Date</span>
              <span className="font-bold text-white font-mono">{member.joinDate}</span>
            </div>
            <div>
              <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Renewal Date</span>
              <span className="font-bold text-[#00F59B] font-mono">{member.expiryDate}</span>
            </div>
            <div>
              <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Blood Group</span>
              <span className="font-bold text-white">{member.bloodGroup || 'O+'}</span>
            </div>
            <div>
              <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Validity</span>
              <span className="font-bold text-[#00F59B] font-mono">{member.remainingDaysText}</span>
            </div>
            <div className="col-span-2 pt-1 border-t border-white/5 flex items-center justify-between">
              <span className="text-neutral-400 text-[10px] uppercase">Head Master Coach:</span>
              <span className="font-bold text-[#00F59B] text-xs">{trainer.fullName}</span>
            </div>
          </div>

          {/* Bottom Bar: Real Dynamic Scannable QR Code */}
          <div className="flex items-center justify-between pt-1">
            <div className="space-y-0.5">
              <div className="text-[9px] text-neutral-400 uppercase font-mono">
                Access Code: {member.memberId}-24/7
              </div>
              <div className="text-[9px] text-neutral-500">
                Authorized Biometric Identity Pass
              </div>
            </div>
            <div className="shrink-0">
              <DynamicQrCode
                value={passUrl}
                size={85}
                showDownload={false}
                memberId={member.memberId}
              />
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <a
            href={generateWhatsAppLink(
              member.whatsapp,
              `Hello ${member.fullName}! Here is your official RedApple membership digital QR pass.\n\nRenewal Date: ${member.expiryDate} (${member.remainingDaysText})\n\n📱 Open and scan your dynamic QR pass here:\n${passUrl}`
            )}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2.5 rounded-xl bg-[#00C853]/10 hover:bg-[#00C853]/20 text-[#00C853] border border-[#00C853]/30 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Send QR Pass via WhatsApp</span>
          </a>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-[#F8F6F4] hover:bg-[#EFECE8] border border-black/10 text-xs font-bold text-[#1A1A1A] transition-colors"
            >
              Close
            </button>
            <button
              onClick={handlePrint}
              className="px-6 py-2.5 rounded-xl bg-[#C41E3A] text-white font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-[#A3182E] shadow-sm transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Print Badge</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
