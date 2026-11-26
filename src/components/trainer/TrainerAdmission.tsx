'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import {
  Share2,
  Copy,
  Check,
  MessageCircle,
  TrendingUp,
  Award,
  Users,
  Sparkles,
  QrCode
} from 'lucide-react';

export const TrainerAdmission: React.FC = () => {
  const { trainer, leads, members, generateWhatsAppLink } = useApp();

  const [copied, setCopied] = useState(false);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://redapplefitness.com';
  const trainerReferralUrl = `${baseUrl}/admission?ref=${trainer.trainerId}`;

  const defaultMsg = `Hello. Thank you for your interest in joining our gym. Please complete the admission form using the link below:\n\n${trainerReferralUrl}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(trainerReferralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-white font-['Space_Grotesk']">
          Head Coach Admission Link & WhatsApp Pipeline
        </h2>
        <p className="text-xs text-neutral-400">
          Share your direct admission link with prospective athletes. Leads automatically assign under your master program.
        </p>
      </div>

      {/* 3 Metric Cards for Trainer */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[#11131A] border border-white/10 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Total Inbound Leads
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white font-['Space_Grotesk']">
            {leads.length} Leads
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">
            Registered via online admission form
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#11131A] border border-[#00F59B]/30 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Active Athletes Coached
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#00F59B]/10 text-[#00F59B] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-[#00F59B] font-['Space_Grotesk']">
            {members.length} Athletes
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">
            Active paid enrollments
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#11131A] border border-purple-500/30 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Conversion Efficiency
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-purple-400 font-['Space_Grotesk']">
            92%
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">
            Lead-to-membership conversion rate
          </div>
        </div>
      </div>

      {/* Share Link Tool Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#11131A] border border-white/10 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-blue-400" />
            <h3 className="text-base font-bold text-white font-['Space_Grotesk']">
              Official Coach Admission Form Link
            </h3>
          </div>
          <span className="text-xs font-mono text-blue-400 font-bold">
            Coach Tag: {trainer.trainerId}
          </span>
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-1.5">
            Admission URL
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={trainerReferralUrl}
              className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-xs text-[#00F59B] font-mono outline-none"
            />
            <button
              onClick={handleCopy}
              className="px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white flex items-center gap-1.5 transition-colors shrink-0"
            >
              {copied ? <Check className="w-4 h-4 text-[#00F59B]" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied' : 'Copy Link'}</span>
            </button>
          </div>
        </div>

        {/* WhatsApp Share Box */}
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="text-xs text-neutral-300">
            <strong className="text-white block font-bold mb-0.5">Pre-Formatted WhatsApp Message:</strong>
            <span className="italic text-neutral-400">
              "Hello. Thank you for your interest in joining our gym. Please complete the admission form using the link below."
            </span>
          </div>

          <a
            href={generateWhatsAppLink('', defaultMsg)}
            target="_blank"
            rel="noreferrer"
            className="px-6 py-3 rounded-xl bg-[#00F59B] text-black font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 hover:brightness-110 shadow-lg shadow-[#00F59B]/20 shrink-0"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Send via WhatsApp</span>
          </a>
        </div>
      </div>

      {/* Leads Table */}
      <div className="rounded-3xl bg-[#11131A] border border-white/10 overflow-hidden shadow-2xl p-6 space-y-4">
        <div className="border-b border-white/10 pb-3">
          <h3 className="text-base font-bold text-white font-['Space_Grotesk']">
            Prospective Athlete Applicants ({leads.length} Leads)
          </h3>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#151824] text-neutral-400 uppercase text-[10px] font-extrabold tracking-wider border-b border-white/10">
              <tr>
                <th className="p-3">Applicant</th>
                <th className="p-3">Mobile</th>
                <th className="p-3">Target Goal</th>
                <th className="p-3">Preferred Tier</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Direct WhatsApp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {leads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-neutral-500">
                    No leads generated yet. Share your admission link above!
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-white/[0.02]">
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={lead.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80'}
                          alt={lead.fullName}
                          className="w-9 h-9 rounded-lg object-cover border border-white/10 shrink-0"
                        />
                        <div className="font-bold text-white font-['Space_Grotesk']">{lead.fullName}</div>
                      </div>
                    </td>
                    <td className="p-3 font-mono text-neutral-300">{lead.mobile}</td>
                    <td className="p-3 text-neutral-300">{lead.goal}</td>
                    <td className="p-3 font-semibold text-white">{lead.preferredPlan} Plan</td>
                    <td className="p-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30">
                        {lead.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <a
                        href={generateWhatsAppLink(
                          lead.whatsapp,
                          `Hello ${lead.fullName}! Coach ${trainer.fullName.split(' ')[0]} here. Thanks for applying to RedApple Gym! When can we schedule your biometric assessment?`
                        )}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-[#00F59B] border border-emerald-500/30 inline-block"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View: Clean Applicant Cards */}
        <div className="md:hidden divide-y divide-white/10 -mx-2">
          {leads.length === 0 ? (
            <div className="p-8 text-center text-neutral-500 text-xs">
              No leads generated yet.
            </div>
          ) : (
            leads.map((lead) => (
              <div key={lead.id} className="p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={lead.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80'}
                      alt={lead.fullName}
                      className="w-10 h-10 rounded-lg object-cover border border-white/10 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="font-bold text-white text-sm truncate">{lead.fullName}</div>
                      <div className="text-[11px] text-neutral-400 font-mono">{lead.mobile}</div>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30 shrink-0">
                    {lead.status}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-neutral-400 bg-white/5 px-3 py-2 rounded-xl">
                  <span>Plan: <strong className="text-white">{lead.preferredPlan}</strong></span>
                  <a
                    href={generateWhatsAppLink(
                      lead.whatsapp,
                      `Hello ${lead.fullName}! Coach ${trainer.fullName.split(' ')[0]} here. Thanks for applying to Red Apple Gym! When can we schedule your biometric assessment?`
                    )}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 px-3 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-[#00F59B] border border-emerald-500/30 font-semibold text-xs flex items-center gap-1"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
