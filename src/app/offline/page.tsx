'use client';

import React from 'react';
import Link from 'next/link';
import { WifiOff, RefreshCw, QrCode, Phone, Home, Dumbbell, ShieldCheck } from 'lucide-react';

export default function OfflinePage() {
  const handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-white flex flex-col justify-between p-4 sm:p-6 selection:bg-[#C41E3A] selection:text-white">
      {/* Top Header */}
      <header className="max-w-md mx-auto w-full pt-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-white p-0.5 flex items-center justify-center shadow-lg border border-[#D4A574]/40 overflow-hidden shrink-0">
            <img src="/images/logo.png" alt="Red Apple Gym and Fitness Center" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="text-xs sm:text-sm font-bold font-serif tracking-tight">RED APPLE GYM</div>
            <div className="text-[9px] text-[#D4A574] font-semibold uppercase tracking-wider">AND FITNESS CENTER • CIDCO N-2</div>
          </div>
        </Link>

        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-mono font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
          OFFLINE MODE
        </span>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto w-full py-8 space-y-6 text-center">
        <div className="relative mx-auto w-24 h-24 rounded-3xl bg-neutral-900 border border-white/10 flex items-center justify-center shadow-2xl">
          <div className="absolute inset-0 rounded-3xl bg-[#C41E3A]/10 animate-pulse" />
          <WifiOff className="w-10 h-10 text-amber-400 relative z-10" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold font-serif tracking-tight">
            You are currently offline
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 max-w-xs mx-auto leading-relaxed">
            No internet connection detected. But don&apos;t worry — your cached member passes and check-in QR codes still work at the gym desk!
          </p>
        </div>

        {/* Action Cards */}
        <div className="space-y-3 pt-2 text-left">
          <div className="p-4 rounded-2xl bg-neutral-900/90 border border-white/10 shadow-lg space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#C41E3A]/20 border border-[#C41E3A]/40 text-[#E52D4A] flex items-center justify-center shrink-0">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-white font-serif">Front Desk QR Pass</h2>
                <p className="text-[11px] text-neutral-400">Open your last viewed pass to scan in</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <Link
                href="/pass/RAG-2024-001"
                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-medium text-center border border-white/10 transition-colors"
              >
                Pass #1 (Aarav)
              </Link>
              <Link
                href="/pass/RAG-2024-002"
                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-medium text-center border border-white/10 transition-colors"
              >
                Pass #2 (Pooja)
              </Link>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-neutral-900/60 border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-neutral-300">Front Desk Support Line</span>
            </div>
            <a
              href="tel:+919890250000"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call Gym</span>
            </a>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
          <button
            onClick={handleReload}
            className="w-full py-3 px-4 rounded-xl bg-[#C41E3A] hover:bg-[#8B1528] active:scale-98 transition-all text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#C41E3A]/25"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Reconnecting</span>
          </button>
          <Link
            href="/"
            className="w-full py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 active:scale-98 transition-all text-white text-xs font-semibold flex items-center justify-center gap-2 border border-white/10"
          >
            <Home className="w-4 h-4" />
            <span>Go to Homepage</span>
          </Link>
        </div>
      </main>

      {/* Footer Info */}
      <footer className="max-w-md mx-auto w-full pb-4 text-center">
        <p className="text-[10px] text-neutral-500">
          Red Apple Athletic Club • Ram Nagar, Cidco N-2, Chhatrapati Sambhajinagar
        </p>
      </footer>
    </div>
  );
}

