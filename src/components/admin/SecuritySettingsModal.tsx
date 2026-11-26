'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { Lock, Key, ShieldCheck, Check, AlertCircle, X, Eye, EyeOff } from 'lucide-react';

interface SecuritySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SecuritySettingsModal: React.FC<SecuritySettingsModalProps> = ({
  isOpen,
  onClose
}) => {
  const {
    adminPassword,
    trainerPassword,
    updateAdminPassword,
    updateTrainerPassword
  } = useApp();

  const [activeTab, setActiveTab] = useState<'admin' | 'trainer'>('admin');

  // Form states
  const [currentOrMasterKey, setCurrentOrMasterKey] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!currentOrMasterKey.trim()) {
      setFeedback({ type: 'error', message: 'Current password or master key is required.' });
      return;
    }

    if (!newPassword.trim() || newPassword.length < 4) {
      setFeedback({ type: 'error', message: 'New password must be at least 4 characters long.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setFeedback({ type: 'error', message: 'New passwords do not match.' });
      return;
    }

    setIsSaving(true);
    try {
      if (activeTab === 'admin') {
        const res = await updateAdminPassword(currentOrMasterKey.trim(), newPassword.trim());
        if (res.success) {
          setFeedback({ type: 'success', message: res.message });
          setCurrentOrMasterKey('');
          setNewPassword('');
          setConfirmPassword('');
        } else {
          setFeedback({ type: 'error', message: res.message });
        }
      } else {
        const res = await updateTrainerPassword(currentOrMasterKey.trim(), newPassword.trim());
        if (res.success) {
          setFeedback({ type: 'success', message: res.message });
          setCurrentOrMasterKey('');
          setNewPassword('');
          setConfirmPassword('');
        } else {
          setFeedback({ type: 'error', message: res.message });
        }
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Failed to update password.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-3xl bg-white border border-black/10 p-6 sm:p-8 shadow-2xl space-y-6 relative">
        <div className="flex items-center justify-between border-b border-black/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#C41E3A] text-white flex items-center justify-center font-bold shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-[#1A1A1A] text-base font-['Space_Grotesk']">
                Portal Password Management
              </h3>
              <p className="text-[11px] text-[#71717A]">Change Admin & Trainer Passwords</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F8F6F4] hover:bg-[#EFECE8] flex items-center justify-center text-[#71717A] hover:text-[#1A1A1A] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-[#F8F6F4] border border-black/10 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setActiveTab('admin');
              setFeedback(null);
            }}
            className={`py-2.5 rounded-xl transition-all ${
              activeTab === 'admin'
                ? 'bg-[#C41E3A] text-white shadow-xs'
                : 'text-[#71717A] hover:text-[#1A1A1A]'
            }`}
          >
            Admin Password
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('trainer');
              setFeedback(null);
            }}
            className={`py-2.5 rounded-xl transition-all ${
              activeTab === 'trainer'
                ? 'bg-[#C41E3A] text-white shadow-xs'
                : 'text-[#71717A] hover:text-[#1A1A1A]'
            }`}
          >
            Trainer Password
          </button>
        </div>

        {feedback && (
          <div
            className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2.5 ${
              feedback.type === 'success'
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-800'
                : 'bg-rose-500/10 border border-rose-500/30 text-rose-800'
            }`}
          >
            {feedback.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-extrabold uppercase tracking-wider text-[#71717A] block">
              <span>Current Authorization Password</span>
            </label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={currentOrMasterKey}
                onChange={(e) => setCurrentOrMasterKey(e.target.value)}
                placeholder="Enter current authorization password"
                className="w-full px-4 py-3 rounded-2xl bg-[#F8F6F4] border border-black/10 text-[#1A1A1A] font-mono outline-none focus:border-[#C41E3A] focus:bg-white transition-all placeholder:text-[#A1A1AA]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-extrabold uppercase tracking-wider text-[#71717A]">
              New {activeTab === 'admin' ? 'Admin' : 'Trainer'} Password
            </label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min 4 chars)"
                className="w-full px-4 py-3 rounded-2xl bg-[#F8F6F4] border border-black/10 text-[#1A1A1A] font-mono outline-none focus:border-[#C41E3A] focus:bg-white transition-all placeholder:text-[#A1A1AA]"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#71717A] hover:text-[#1A1A1A]"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-extrabold uppercase tracking-wider text-[#71717A]">
              Confirm New Password
            </label>
            <input
              type={showPass ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full px-4 py-3 rounded-2xl bg-[#F8F6F4] border border-black/10 text-[#1A1A1A] font-mono outline-none focus:border-[#C41E3A] focus:bg-white transition-all placeholder:text-[#A1A1AA]"
            />
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-3.5 rounded-2xl bg-[#C41E3A] hover:bg-[#A3182E] disabled:opacity-60 text-white font-black uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <span>Syncing with Cloud...</span>
            ) : (
              <span>Save &amp; Sync New {activeTab === 'admin' ? 'Admin' : 'Trainer'} Password</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
