'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { QrCode, ShieldCheck, Dumbbell, ArrowRight, X } from 'lucide-react';

export const PwaSmartRouter: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();

  const [deviceRole, setDeviceRole] = useState<string | null>(null);
  const [savedPassId, setSavedPassId] = useState<string | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showQuickBanner, setShowQuickBanner] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if launched from Home Screen as standalone PWA
    const standaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      Boolean((navigator as unknown as { standalone?: boolean }).standalone);
    setIsStandalone(standaloneMode);

    try {
      const role = localStorage.getItem('redapple_device_role');
      const passId = localStorage.getItem('redapple_saved_pass_id');
      const validPassId = passId && passId !== '[id]' && !passId.includes('[') ? passId : null;
      if (passId === '[id]') {
        localStorage.removeItem('redapple_saved_pass_id');
      }
      setDeviceRole(role);
      setSavedPassId(validPassId);

      // If launched from Home Screen PWA icon onto the root page ('/'),
      // automatically route straight to their respective destination!
      if (standaloneMode && pathname === '/') {
        if (role === 'admin') {
          router.replace('/admin');
          return;
        }
        if (role === 'trainer') {
          router.replace('/trainer');
          return;
        }
        if (role === 'member' && validPassId) {
          router.replace(`/pass/${validPassId}`);
          return;
        }
      }
    } catch (e) {
      console.warn('Smart PWA router initialization notice:', e);
    }
  }, [pathname, router]);

  // If already navigated away from root page, do not render banner
  if (pathname !== '/' || !showQuickBanner) {
    return null;
  }

  // Quick Resume Toast for regular browser visitors who have an active role / pass
  if (deviceRole === 'member' && savedPassId) {
    return (
      <div className="fixed top-20 right-4 z-40 max-w-sm bg-neutral-900/95 backdrop-blur-xl border border-[#D4A574]/40 text-white p-3 rounded-2xl shadow-2xl flex items-center justify-between gap-3 animate-in slide-in-from-top-4">
        <Link
          href={`/pass/${savedPassId}`}
          className="flex items-center gap-2.5 min-w-0 group"
        >
          <div className="w-8 h-8 rounded-xl bg-[#C41E3A] flex items-center justify-center text-white shrink-0 shadow-sm group-hover:scale-105 transition-transform">
            <QrCode className="w-4 h-4" />
          </div>
          <div className="truncate">
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Your Digital Pass</span>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300">
                ACTIVE
              </span>
            </div>
            <p className="text-[10px] text-neutral-300 truncate">Tap for instant front desk QR check-in</p>
          </div>
        </Link>

        <button
          onClick={() => setShowQuickBanner(false)}
          className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 shrink-0"
          title="Dismiss"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  if (deviceRole === 'admin') {
    return (
      <div className="fixed top-20 right-4 z-40 max-w-sm bg-neutral-900/95 backdrop-blur-xl border border-red-500/40 text-white p-3 rounded-2xl shadow-2xl flex items-center justify-between gap-3 animate-in slide-in-from-top-4">
        <Link href="/admin" className="flex items-center gap-2.5 min-w-0 group">
          <div className="w-8 h-8 rounded-xl bg-[#C41E3A] flex items-center justify-center text-white shrink-0 shadow-sm group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-4 h-4 text-white" />
          </div>
          <div className="truncate">
            <div className="text-xs font-bold text-white">Admin Operations</div>
            <p className="text-[10px] text-neutral-300 truncate">Tap to resume admin dashboard</p>
          </div>
        </Link>

        <button
          onClick={() => setShowQuickBanner(false)}
          className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 shrink-0"
          title="Dismiss"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return null;
};

