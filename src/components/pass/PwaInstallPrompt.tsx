'use client';

import React, { useState, useEffect } from 'react';
import { Download, Smartphone, Share, PlusSquare, X, Check, ShieldCheck } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PwaInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const isInStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      Boolean((navigator as unknown as { standalone?: boolean }).standalone);
    setIsStandalone(isInStandaloneMode);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      setShowIosGuide(true);
    }
  };

  if (isStandalone || dismissed) {
    return null;
  }

  return (
    <>
      <div className="p-4 rounded-3xl bg-gradient-to-r from-[#1A1A1A] to-[#2B2B2B] text-white border border-[#D4A574]/40 shadow-lg flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#C41E3A] flex items-center justify-center text-white shrink-0 shadow-md">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold font-serif flex items-center gap-1.5">
              <span>Install Pass on Home Screen</span>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                OFFLINE READY
              </span>
            </div>
            <p className="text-[11px] text-neutral-300 mt-0.5">
              Launch directly from your home screen for rapid front desk QR check-in.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleInstallClick}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-neutral-100 text-[#1A1A1A] text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-transform"
          >
            <Download className="w-3.5 h-3.5 text-[#C41E3A]" />
            <span>Install</span>
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-neutral-400 hover:text-white flex items-center justify-center text-xs"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {showIosGuide && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-black/10 space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#C41E3A] text-white flex items-center justify-center mx-auto shadow-md">
              <Smartphone className="w-6 h-6" />
            </div>

            <div>
              <h4 className="font-bold text-base font-serif text-[#1A1A1A]">
                Add Pass to iPhone Home Screen
              </h4>
              <p className="text-xs text-[#666666] mt-1">
                Install as a standalone app on your Apple device in 2 easy steps:
              </p>
            </div>

            <div className="space-y-3 text-left text-xs bg-[#F8F6F4] p-4 rounded-2xl border border-black/5">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center text-xs font-bold shrink-0">
                  1
                </div>
                <div>
                  <p className="font-bold text-[#1A1A1A] flex items-center gap-1">
                    Tap the Share Button <Share className="w-3.5 h-3.5 text-[#C41E3A] inline" />
                  </p>
                  <p className="text-[11px] text-[#666666]">
                    Located at the bottom bar in Safari.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center text-xs font-bold shrink-0">
                  2
                </div>
                <div>
                  <p className="font-bold text-[#1A1A1A] flex items-center gap-1">
                    Select "Add to Home Screen" <PlusSquare className="w-3.5 h-3.5 text-emerald-600 inline" />
                  </p>
                  <p className="text-[11px] text-[#666666]">
                    Scroll down in the menu and tap 'Add'.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIosGuide(false)}
              className="w-full py-3 rounded-2xl bg-[#1A1A1A] hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </>
  );
};
