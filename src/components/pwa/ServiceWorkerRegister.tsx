'use client';

import React, { useEffect, useState } from 'react';
import { Download, X, Smartphone, Wifi, WifiOff } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const ServiceWorkerRegister: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPromptBanner, setShowPromptBanner] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // 1. Service Worker Management
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // In local development, unregister any stale service workers to prevent Turbopack chunk collisions
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const registration of registrations) {
            registration.unregister();
          }
        });
        if ('caches' in window) {
          caches.keys().then((keys) => {
            for (const key of keys) {
              if (key.includes('redapple-pwa')) {
                caches.delete(key);
              }
            }
          });
        }
        return;
      }

      // Register service worker after window load for optimal page load performance
      const handleLoad = () => {
        navigator.serviceWorker
          .register('/sw.js', { scope: '/' })
          .then((registration) => {
            console.log('[PWA] Service Worker registered successfully with scope:', registration.scope);

            // Handle SW updates
            registration.onupdatefound = () => {
              const installingWorker = registration.installing;
              if (installingWorker) {
                installingWorker.onstatechange = () => {
                  if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    console.log('[PWA] New content is available; please refresh.');
                  }
                };
              }
            };
          })
          .catch((error) => {
            console.warn('[PWA] Service Worker registration failed:', error);
          });
      };

      if (document.readyState === 'complete') {
        handleLoad();
      } else {
        window.addEventListener('load', handleLoad);
      }
    }

    // 2. Check standalone mode (already installed)
    const checkStandalone = () => {
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        Boolean((navigator as unknown as { standalone?: boolean }).standalone);
      setIsInstalled(isStandalone);
    };
    checkStandalone();

    // 3. Network status listeners
    setIsOffline(!navigator.onLine);
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 4. Capture beforeinstallprompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Check if user has previously dismissed within the last 7 days
      const lastDismissed = localStorage.getItem('redapple_pwa_dismissed');
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      if (!lastDismissed || parseInt(lastDismissed, 10) < sevenDaysAgo) {
        // Show after a brief 3 second delay to not disrupt initial page view
        const timer = setTimeout(() => {
          setShowPromptBanner(true);
        }, 3000);
        return () => clearTimeout(timer);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Handle app installed event
    const handleAppInstalled = () => {
      setShowPromptBanner(false);
      setDeferredPrompt(null);
      setIsInstalled(true);
      console.log('[PWA] App successfully installed on device');
    };
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      setShowPromptBanner(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPromptBanner(false);
    localStorage.setItem('redapple_pwa_dismissed', Date.now().toString());
  };

  return (
    <>
      {/* Offline Alert Strip */}
      {isOffline && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-[#C41E3A] text-white text-xs font-semibold py-2 px-4 text-center flex items-center justify-center gap-2 shadow-lg animate-in slide-in-from-top">
          <WifiOff className="w-3.5 h-3.5" />
          <span>You are currently browsing offline. Pass check-ins remain operational.</span>
        </div>
      )}

      {/* Floating Bottom PWA Install Banner */}
      {!isInstalled && showPromptBanner && deferredPrompt && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-md z-50 bg-[#1A1A1A]/95 backdrop-blur-xl text-white border border-[#D4A574]/40 p-4 rounded-3xl shadow-2xl animate-in slide-in-from-bottom duration-300">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white p-1 flex items-center justify-center shrink-0 shadow-lg border border-[#D4A574]/40 overflow-hidden">
              <img
                src="/images/logo.png"
                alt="Red Apple Gym and Fitness Center"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="flex-1 min-w-0 pr-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs tracking-wide font-serif text-white truncate">
                  RED APPLE GYM &amp; FITNESS
                </span>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                  PWA
                </span>
              </div>
              <p className="text-[11px] text-neutral-300 mt-0.5 leading-snug">
                Install for instant QR check-in, offline digital pass &amp; fast launch from your home screen.
              </p>

              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={handleInstallClick}
                  className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-neutral-100 active:scale-95 text-[#1A1A1A] text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Download className="w-3.5 h-3.5 text-[#C41E3A]" />
                  <span>Install App</span>
                </button>
                <button
                  onClick={handleDismiss}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-neutral-400 hover:text-white text-xs font-medium transition-colors"
                >
                  Not Now
                </button>
              </div>
            </div>

            <button
              onClick={handleDismiss}
              aria-label="Close"
              className="text-neutral-400 hover:text-white p-1 rounded-full hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

