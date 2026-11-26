'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { MessageCircle, X, Send, Sparkles, Dumbbell } from 'lucide-react';

export const WhatsAppWidget: React.FC = () => {
  const { gymSettings, generateWhatsAppLink } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [customMsg, setCustomMsg] = useState('');

  const quickPrompts = [
    'I want to inquire about Membership Packages & Pricing 🎟️',
    'I want to book personal training with Coach Mohaseen Subedar 🏋️',
    'What are the morning and evening batch timings? ⏰'
  ];

  const handleSendPrompt = (text: string) => {
    const link = generateWhatsAppLink(gymSettings.whatsapp, text);
    window.open(link, '_blank');
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
      {/* Interactive Chat Popup */}
      {isOpen && (
        <div className="mb-3 w-[calc(100vw-2rem)] sm:w-88 max-w-sm rounded-3xl bg-white border border-black/10 shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="bg-[#25D366] p-4 text-white flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold">
                <Dumbbell className="w-5 h-5 text-white -rotate-45" />
              </div>
              <div>
                <h4 className="font-bold text-sm font-serif leading-tight">
                  Red Apple VIP Concierge
                </h4>
                <span className="text-[11px] font-medium text-white/90 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  Online • Replies in &lt; 5 mins
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 space-y-3 max-h-72 overflow-y-auto bg-[#F8F6F4]">
            {/* Assistant message */}
            <div className="p-3.5 rounded-2xl bg-white border border-black/5 text-xs text-[#1A1A1A] leading-relaxed shadow-sm">
              Namaste! 🙏 Welcome to <strong className="text-[#C41E3A]">Red Apple Gym (रेड ॲपल जिम)</strong>. How can our concierge assist your fitness journey in Cidco N-2 today?
            </div>

            {/* Quick action buttons */}
            <div className="space-y-1.5 pt-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#8A8A8A]">
                Quick Inquiries:
              </div>
              {quickPrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSendPrompt(prompt)}
                  className="w-full text-left p-2.5 rounded-xl bg-white hover:bg-[#C41E3A]/5 hover:border-[#C41E3A]/30 border border-black/5 text-xs text-[#4A4A4A] hover:text-[#C41E3A] transition-all shadow-2xs"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Footer Input */}
          <div className="p-3 bg-white border-t border-black/5 flex items-center gap-2">
            <input
              type="text"
              placeholder="Type your message..."
              value={customMsg}
              onChange={(e) => setCustomMsg(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && customMsg.trim()) {
                  handleSendPrompt(customMsg);
                  setCustomMsg('');
                }
              }}
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#F8F6F4] border border-black/10 text-xs text-[#1A1A1A] placeholder-neutral-400 focus:outline-none focus:border-[#C41E3A]"
            />
            <button
              onClick={() => {
                if (customMsg.trim()) {
                  handleSendPrompt(customMsg);
                  setCustomMsg('');
                }
              }}
              className="p-2.5 rounded-xl bg-[#25D366] text-white hover:bg-[#1EBE5D] shadow-sm transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-[0_10px_30px_rgba(37,211,102,0.4)] hover:scale-110 active:scale-95 transition-all group relative"
        aria-label="Open WhatsApp Concierge"
      >
        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#C41E3A] border-2 border-white flex items-center justify-center text-[9px] font-bold text-white">
          1
        </span>
        {isOpen ? (
          <X className="w-7 h-7 text-white transition-transform duration-300" />
        ) : (
          <MessageCircle className="w-7 h-7 text-white fill-white/20 group-hover:rotate-12 transition-transform duration-300" />
        )}
      </button>
    </div>
  );
};
