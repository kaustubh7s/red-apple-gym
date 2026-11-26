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

  return null;
};

