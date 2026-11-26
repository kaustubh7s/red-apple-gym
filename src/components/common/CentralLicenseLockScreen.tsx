'use client';

import React, { useState } from 'react';
import {
  ShieldAlert,
  Key,
  Lock,
  ArrowRight,
  AlertTriangle,
  BadgeCheck,
  Building2,
  Sparkles,
  PhoneCall,
  RefreshCw
} from 'lucide-react';
import {
  verifyLicenseWithNeon,
  saveStoredCentralLicense,
  CentralLicense
} from '@/lib/centralLicenseService';

interface CentralLicenseLockScreenProps {
  onActivated: (license: CentralLicense) => void;
  isSuspendedMode?: boolean;
  suspendedLicense?: CentralLicense | null;
  onRetryHeartbeat?: () => void;
  initialErrorMessage?: string | null;
}

export const CentralLicenseLockScreen: React.FC<CentralLicenseLockScreenProps> = ({
  onActivated,
  isSuspendedMode = false,
  suspendedLicense,
  onRetryHeartbeat,
  initialErrorMessage
}) => {
  const [licenseKeyInput, setLicenseKeyInput] = useState('');
  const [errorMsg, setErrorMsg] = useState(initialErrorMessage || '');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuspended, setIsSuspended] = useState(isSuspendedMode);
  const [verifiedLic, setVerifiedLic] = useState<CentralLicense | null>(null);

  React.useEffect(() => {
    if (initialErrorMessage) {
      setErrorMsg(initialErrorMessage);
    }
  }, [initialErrorMessage]);

  const handleActivate = async (keyToVerify?: string) => {
    setErrorMsg('');
    const targetKey = keyToVerify || licenseKeyInput;

    if (!targetKey.trim()) {
      setErrorMsg('Please enter your software License Key.');
      return;
    }

    setIsVerifying(true);
    try {
      const res = await verifyLicenseWithNeon(targetKey);

      if (res.valid && res.license) {
        saveStoredCentralLicense(res.license);
        setVerifiedLic(res.license);
        setTimeout(() => {
          setIsVerifying(false);
          onActivated(res.license!);
        }, 1200);
      } else if (res.isSuspended) {
        setIsVerifying(false);
        setIsSuspended(true);
        setErrorMsg('License suspended. Contact software provider.');
      } else {
        setIsVerifying(false);
        setErrorMsg(res.error || 'Invalid license key.');
      }
    } catch (err: any) {
      setIsVerifying(false);
      setErrorMsg('Network error connecting to central licensing registry.');
    }
  };

  // If License is Suspended centrally
  if (isSuspended || isSuspendedMode) {
    return (
      <div className="fixed inset-0 z-999 bg-neutral-950 text-white flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        <div className="relative w-full max-w-lg bg-neutral-900/90 rounded-3xl p-6 sm:p-8 border border-rose-500/30 shadow-2xl text-center space-y-6 backdrop-blur-xl animate-in fade-in zoom-in-95">
          <div className="w-16 h-16 rounded-3xl bg-rose-500/10 border-2 border-rose-500/30 text-rose-500 flex items-center justify-center mx-auto shadow-lg shadow-rose-950/40">
            <ShieldAlert className="w-9 h-9" />
          </div>

          <div className="space-y-2">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30">
              Access Restricted
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif font-black tracking-tight text-white">
              License Suspended
            </h1>
            <p className="text-sm text-neutral-300 max-w-md mx-auto leading-relaxed">
              License suspended. Contact software provider.
            </p>
          </div>

          {/* Details & Support Contact */}
          <div className="p-4 rounded-2xl bg-neutral-950/60 border border-white/5 text-left space-y-2 text-xs">
            <div className="flex items-center justify-between text-neutral-400">
              <span>Client Entity:</span>
              <span className="font-bold text-white">
                {suspendedLicense?.client_name || 'Red Apple Gym'}
              </span>
            </div>
            <div className="flex items-center justify-between text-neutral-400">
              <span>License Key:</span>
              <span className="font-mono text-neutral-300 font-bold">
                {suspendedLicense?.key || 'GYMX-••••-••••'}
              </span>
            </div>
            <div className="flex items-center justify-between text-neutral-400">
              <span>Status:</span>
              <span className="font-bold text-rose-400 uppercase">Suspended</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            {onRetryHeartbeat && (
              <button
                type="button"
                onClick={onRetryHeartbeat}
                className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Re-Check Status</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setIsSuspended(false);
                setErrorMsg('');
              }}
              className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-rose-900/30"
            >
              <Key className="w-4 h-4" />
              <span>Enter Another Key</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 1st-Time Activation Lock Screen
  return (
    <div className="fixed inset-0 z-999 bg-neutral-950 text-white flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Background Ambience */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-[#C41E3A]/15 rounded-full blur-[130px] pointer-events-none" />

      <div className="relative w-full max-w-lg bg-neutral-900/90 rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl space-y-6 backdrop-blur-xl animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-[#C41E3A]/15 border border-[#C41E3A]/30 text-[#C41E3A] flex items-center justify-center mx-auto shadow-md">
            <Lock className="w-7 h-7 text-[#D4A574]" />
          </div>
          <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-[#D4A574]/15 text-[#D4A574] border border-[#D4A574]/30">
            Central Licensing Registry
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-black tracking-tight text-white">
            System Activation Required
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 max-w-sm mx-auto">
            Please enter your software License Key to activate this system.
          </p>
        </div>

        {verifiedLic ? (
          <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2 animate-in fade-in">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <BadgeCheck className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-emerald-300 text-base">
              License Verified &amp; Activated!
            </h3>
            <p className="text-xs text-neutral-300">
              Client: <span className="font-bold text-white">{verifiedLic.client_name}</span> ({verifiedLic.tier} Tier)
            </p>
            <p className="text-[11px] text-emerald-400 font-medium">
              Unlocking licensed gym modules...
            </p>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleActivate();
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-300 flex items-center justify-between">
                <span>License Key</span>
                <span className="text-[10px] text-neutral-500 font-mono">
                  Registry: Neon Central DB
                </span>
              </label>

              <div className="relative">
                <input
                  type="text"
                  value={licenseKeyInput}
                  onChange={(e) => {
                    setLicenseKeyInput(e.target.value);
                    setErrorMsg('');
                  }}
                  placeholder="GYMX-XXXX-XXXX-XXXX-XXXX"
                  className="w-full pl-4 pr-11 py-3.5 rounded-xl border border-white/15 bg-neutral-950/70 focus:bg-neutral-950 focus:border-[#C41E3A] focus:ring-2 focus:ring-[#C41E3A]/30 text-sm font-mono font-bold tracking-wider uppercase text-white placeholder-neutral-600 transition-all outline-none"
                  autoFocus
                />
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500">
                  <Key className="w-4 h-4" />
                </div>
              </div>

              {errorMsg && (
                <div className="flex items-center gap-1.5 text-xs text-rose-400 font-semibold p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              disabled={isVerifying}
              className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-[#C41E3A] to-[#8B1528] hover:from-[#D42240] hover:to-[#9C182E] text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#C41E3A]/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying Against Central Registry...</span>
                </>
              ) : (
                <>
                  <span>Activate System</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Footer info */}
        <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-neutral-500">
          <span>Database: Supabase (Unchanged)</span>
          <span>Licensing: Neon Cloud Guard</span>
        </div>
      </div>
    </div>
  );
};
