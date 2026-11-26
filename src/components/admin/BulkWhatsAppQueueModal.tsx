'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import {
  X,
  Send,
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
  ChevronRight,
  Sparkles,
  Users,
  MessageCircle,
  RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';

export interface BulkQueueItem {
  id: string;
  name: string;
  mobile: string;
  message: string;
  subtext?: string;
  avatar?: string;
}

interface BulkWhatsAppQueueModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  items: BulkQueueItem[];
  messageType?: 'renewal_reminder' | 'birthday_wish' | 'custom';
}

export const BulkWhatsAppQueueModal: React.FC<BulkWhatsAppQueueModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  items,
  messageType = 'renewal_reminder'
}) => {
  const { sendWhatsAppMessage, generateWhatsAppLink } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sentMap, setSentMap] = useState<Record<string, boolean>>({});
  const [copiedAll, setCopiedAll] = useState(false);

  if (!isOpen || items.length === 0) return null;

  const currentItem = items[currentIndex] || items[0];
  const sentCount = Object.keys(sentMap).length;
  const progressPercent = Math.round((sentCount / items.length) * 100);

  const handleSendCurrentAndNext = () => {
    if (!currentItem) return;

    // Log in database
    sendWhatsAppMessage(currentItem.name, currentItem.mobile, messageType as any, currentItem.message);

    // Open WhatsApp
    const link = generateWhatsAppLink(currentItem.mobile, currentItem.message);
    window.open(link, '_blank');

    // Mark as sent
    setSentMap((prev) => ({ ...prev, [currentItem.id]: true }));

    // Confetti effect if final item
    if (currentIndex + 1 >= items.length) {
      confetti({
        particleCount: 90,
        spread: 90,
        origin: { y: 0.6 }
      });
    }

    // Auto-advance to next unsent item
    if (currentIndex + 1 < items.length) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleSendSpecific = (item: BulkQueueItem, index: number) => {
    sendWhatsAppMessage(item.name, item.mobile, messageType as any, item.message);
    const link = generateWhatsAppLink(item.mobile, item.message);
    window.open(link, '_blank');
    setSentMap((prev) => ({ ...prev, [item.id]: true }));
    setCurrentIndex(index);
  };

  const handleCopyBroadcastData = () => {
    const numbersList = items.map((i) => i.mobile).join(', ');
    const sampleMsg = items[0]?.message || '';
    const textToCopy = `ATHLETE NUMBERS:\n${numbersList}\n\nBROADCAST MESSAGE:\n${sampleMsg}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2500);
  };

  const isAllSent = sentCount === items.length;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-t-[28px] sm:rounded-3xl max-w-2xl w-full border border-black/10 shadow-2xl p-4 sm:p-6 space-y-4 sm:space-y-5 animate-in slide-in-from-bottom sm:zoom-in-95 duration-200 max-h-[92vh] sm:max-h-[90vh] flex flex-col pb-[max(1.2rem,env(safe-area-inset-bottom))] sm:pb-6">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-black/10">
          <div className="space-y-0.5 min-w-0 pr-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                <MessageCircle className="w-4 h-4" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#1A1A1A] font-serif truncate">
                {title}
              </h3>
            </div>
            <p className="text-xs text-[#71717A] truncate">
              {subtitle || `Ready to send to ${items.length} athletes without getting blocked by browser popups.`}
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-[#71717A] hover:text-[#1A1A1A] p-2 rounded-xl hover:bg-black/5 shrink-0 min-w-[36px] min-h-[36px] flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Bar Strip */}
        <div className="space-y-1.5 bg-[#F8F6F4] p-3 rounded-2xl border border-black/5">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-[#1A1A1A] flex items-center gap-1.5">
              <span>Queue Progress:</span>
              <strong className="text-emerald-700 font-mono">{sentCount} / {items.length} Sent</strong>
            </span>
            <span className="text-[#71717A] font-mono text-[11px]">{progressPercent}%</span>
          </div>
          <div className="w-full bg-neutral-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#00C853] h-full transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Active Athlete in Queue Card */}
        {!isAllSent && currentItem && (
          <div className="p-3.5 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-50/70 to-orange-50/40 border border-amber-200 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100/80 px-2.5 py-0.5 rounded-full border border-amber-300/60">
                Current in Line ({currentIndex + 1} of {items.length})
              </span>
              {sentMap[currentItem.id] && (
                <span className="text-emerald-700 font-bold text-xs flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Sent
                </span>
              )}
            </div>

            <div className="flex items-start gap-3">
              {currentItem.avatar ? (
                <img
                  src={currentItem.avatar}
                  alt={currentItem.name}
                  className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl object-cover border border-black/10 shrink-0"
                />
              ) : (
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#C41E3A] text-white flex items-center justify-center font-bold text-base shrink-0">
                  {currentItem.name.charAt(0)}
                </div>
              )}

              <div className="min-w-0 flex-1">
                <h4 className="text-sm sm:text-base font-bold text-[#1A1A1A] truncate">{currentItem.name}</h4>
                <div className="text-xs text-[#666666] font-mono mt-0.5 truncate">
                  {currentItem.mobile} {currentItem.subtext ? `• ${currentItem.subtext}` : ''}
                </div>
              </div>
            </div>

            {/* Message Preview Box */}
            <div className="p-3 bg-white rounded-xl border border-amber-200/80 text-xs text-[#1A1A1A] max-h-24 sm:max-h-32 overflow-y-auto whitespace-pre-line leading-relaxed font-sans shadow-3xs">
              {currentItem.message}
            </div>

            {/* Primary Action Button */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleSendCurrentAndNext}
                className="flex-1 py-3 px-3 sm:px-4 rounded-xl bg-[#00C853] hover:bg-[#00B046] text-white font-bold text-xs sm:text-sm tracking-wide flex items-center justify-center gap-1.5 sm:gap-2 shadow-sm transition-all active:scale-98 min-h-[44px]"
              >
                <Send className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline">
                  Open WhatsApp & Send to {currentItem.name} {currentIndex + 1 < items.length ? '→ Next' : '✓ Finish'}
                </span>
                <span className="sm:hidden truncate">
                  Send to {currentItem.name.split(' ')[0]} {currentIndex + 1 < items.length ? '→ Next' : '✓ Finish'}
                </span>
              </button>

              {currentIndex + 1 < items.length && (
                <button
                  onClick={() => setCurrentIndex(currentIndex + 1)}
                  className="px-3.5 py-3 rounded-xl border border-black/10 hover:bg-black/5 text-[#71717A] text-xs font-semibold min-h-[44px] shrink-0"
                >
                  Skip
                </button>
              )}
            </div>
          </div>
        )}

        {isAllSent && (
          <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h4 className="text-base font-bold text-[#1A1A1A]">All Bulk Messages Dispatched!</h4>
            <p className="text-xs text-[#666666]">
              Successfully triggered WhatsApp messages for all {items.length} athletes.
            </p>
          </div>
        )}

        {/* All Recipients Roster List */}
        <div className="space-y-2 flex-1 overflow-y-auto pr-1">
          <div className="flex items-center justify-between text-xs font-bold text-[#71717A] px-1">
            <span>Recipient Queue ({items.length})</span>
            <button
              onClick={handleCopyBroadcastData}
              className="text-xs text-[#C41E3A] hover:underline flex items-center gap-1 font-semibold"
            >
              {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedAll ? 'Copied All to Clipboard' : 'Copy All Numbers & Text'}</span>
            </button>
          </div>

          <div className="divide-y divide-black/5 border border-black/10 rounded-2xl overflow-hidden max-h-36 sm:max-h-52 overflow-y-auto bg-white">
            {items.map((item, idx) => {
              const isCurrent = idx === currentIndex && !isAllSent;
              const isSent = !!sentMap[item.id];

              return (
                <div
                  key={item.id}
                  className={`p-3 flex items-center justify-between gap-3 text-xs transition-colors ${
                    isCurrent ? 'bg-amber-50/70 font-semibold' : 'hover:bg-neutral-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="font-mono text-[10px] text-[#8A8A8A] w-5 text-center shrink-0">
                      #{idx + 1}
                    </span>
                    <div className="truncate">
                      <span className="font-bold text-[#1A1A1A] truncate block">{item.name}</span>
                      <span className="text-[11px] text-[#71717A] font-mono truncate block">{item.mobile}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isSent ? (
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-[11px] font-bold flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Sent
                      </span>
                    ) : (
                      <button
                        onClick={() => handleSendSpecific(item, idx)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-[#00C853] hover:text-white border border-emerald-300 font-bold text-[11px] transition-colors flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Send Now
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-black/5">
          <span className="text-[11px] text-[#71717A]">
            Opens WhatsApp Web / Mobile directly with pre-filled message
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-black/10 text-xs font-semibold text-[#71717A] hover:bg-black/5"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
