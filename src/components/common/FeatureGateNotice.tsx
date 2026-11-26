'use client';

import React from 'react';
import { Lock, Sparkles, ShieldCheck } from 'lucide-react';
import { FeatureModule } from '@/lib/centralLicenseService';

interface FeatureGateNoticeProps {
  featureName: string;
  featureKey: FeatureModule;
  description?: string;
}

export const FeatureGateNotice: React.FC<FeatureGateNoticeProps> = ({
  featureName,
  featureKey,
  description = 'This operational module is not enabled in your current software license tier.'
}) => {
  return (
    <div className="min-h-[400px] flex items-center justify-center p-6 text-center animate-in fade-in">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-black/10 shadow-sm space-y-5">
        <div className="w-16 h-16 rounded-3xl bg-neutral-100 border border-black/10 text-neutral-500 flex items-center justify-center mx-auto shadow-xs">
          <Lock className="w-7 h-7 text-[#C41E3A]" />
        </div>

        <div className="space-y-1.5">
          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-amber-500/10 text-amber-700 border border-amber-500/20 font-mono">
            {featureKey}
          </span>
          <h2 className="text-xl font-bold text-[#1A1A1A] font-serif">
            {featureName} Locked
          </h2>
          <p className="text-xs text-[#666666] leading-relaxed">
            {description}
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-[#F8F6F4] border border-black/5 text-xs text-neutral-600 space-y-1 text-left">
          <div className="flex items-center gap-1.5 font-bold text-neutral-800">
            <Sparkles className="w-3.5 h-3.5 text-[#D4A574]" />
            <span>How to unlock:</span>
          </div>
          <p className="text-[11px] text-neutral-500">
            Contact your software vendor or administrator to enable this module in your central Neon license configuration.
          </p>
        </div>
      </div>
    </div>
  );
};
