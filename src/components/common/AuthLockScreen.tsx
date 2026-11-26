'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Dumbbell, Lock, Key, Eye, EyeOff, ShieldCheck, ArrowRight, AlertCircle, Home } from 'lucide-react';

interface AuthLockScreenProps {
  portalType: 'admin' | 'trainer';
  title: string;
  subtitle: string;
  onLogin: (password: string) => boolean | Promise<boolean>;
}

export const AuthLockScreen: React.FC<AuthLockScreenProps> = ({
  portalType,
  title,
  subtitle,
  onLogin
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!password.trim()) {
      setError('Please enter your portal password.');
      return;
    }

    setLoading(true);
    try {
      const success = await Promise.resolve(onLogin(password.trim()));
      if (!success) {
        setError('Incorrect authorization password. Access denied.');
        setLoading(false);
      }
    } catch (err) {
      setError('Incorrect authorization password. Access denied.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F6F4] text-[#1A1A1A] flex flex-col items-center justify-center p-4 relative overflow-hidden selection:bg-[#C41E3A] selection:text-white">
      {/* Radiant Background Aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-[#D4A574]/20 via-[#C41E3A]/10 to-transparent rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-md w-full relative z-10 space-y-6">
        {/* Gym Brand Icon Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-1 rounded-3xl bg-white shadow-xl shadow-[#C41E3A]/15 border border-[#D4A574]/40">
            <div className="w-16 h-16 rounded-[20px] bg-white flex items-center justify-center overflow-hidden">
              <img
                src="/images/logo.png"
                alt="Red Apple Gym and Fitness Center"
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#1A1A1A] font-serif tracking-tight">
              RED APPLE GYM
            </h1>
            <p className="text-xs text-[#8B1528] font-bold uppercase tracking-wider mt-0.5">
              AND FITNESS CENTER • CIDCO N-2
            </p>
          </div>
        </div>

        {/* Login Card */}
        <div className="p-7 sm:p-8 rounded-3xl bg-white border border-black/10 shadow-[0_20px_50px_rgba(0,0,0,0.08)] space-y-6">
          <div className="space-y-1.5 text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F8F6F4] border border-[#D4A574]/40 text-[#9E6B32] text-[11px] font-bold uppercase tracking-wider">
              <Lock className="w-3.5 h-3.5 text-[#C41E3A]" />
              <span>{portalType === 'admin' ? 'Owner & Executive Protected' : 'Coach Protected Area'}</span>
            </div>
            <h2 className="text-xl font-bold text-[#1A1A1A] font-serif">
              {title}
            </h2>
            <p className="text-xs text-[#666666]">
              {subtitle}
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#4A4A4A] block">
                <span>Enter Password</span>
              </label>

              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A8A8A]">
                  <Key className="w-4 h-4 text-[#C41E3A]" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter authorization password..."
                  autoFocus
                  className="w-full pl-10 pr-11 py-3.5 rounded-2xl bg-[#F8F6F4] border border-black/10 text-[#1A1A1A] text-sm font-mono placeholder:text-neutral-400 outline-none focus:border-[#C41E3A] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-[#1A1A1A] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#C41E3A] to-[#8B1528] text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-[#C41E3A]/25 hover:shadow-lg hover:shadow-[#C41E3A]/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{loading ? 'Verifying...' : 'Unlock Portal'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-2 border-t border-black/5 flex items-center justify-between text-[11px] text-[#8A8A8A]">
            <span>Red Apple Gym Security</span>
            <Link
              href="/"
              className="hover:text-[#1A1A1A] flex items-center gap-1 text-[#8B1528] font-semibold"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Back to Website</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
