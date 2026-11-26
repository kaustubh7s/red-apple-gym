'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { Member } from '@/lib/types';
import {
  MessageSquare,
  Send,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Zap,
  Search,
  ExternalLink,
  MessageCircle,
  Users,
  Check
} from 'lucide-react';
import { BulkWhatsAppQueueModal, BulkQueueItem } from './BulkWhatsAppQueueModal';
import { generateShareablePassUrl } from '@/lib/passUtils';

type CadenceType = '3d' | '1d' | 'expiry_day' | 'welcome' | 'birthday';

export const WhatsAppAutomation: React.FC = () => {
  const { members, whatsAppLogs, sendWhatsAppMessage, generateWhatsAppLink } = useApp();

  const [cadence, setCadence] = useState<CadenceType>('3d');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState<string>(members[0]?.id || '');
  const [customEditableText, setCustomEditableText] = useState<string | null>(null);
  const [sentNotice, setSentNotice] = useState<string | null>(null);
  const [bulkQueueOpen, setBulkQueueOpen] = useState(false);
  const [bulkQueueItems, setBulkQueueItems] = useState<BulkQueueItem[]>([]);

  // Filter members for selection
  const filteredMembers = members.filter((m) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      m.fullName.toLowerCase().includes(q) ||
      m.memberId.toLowerCase().includes(q) ||
      m.mobile.includes(q)
    );
  });

  const activeMember = members.find((m) => m.id === selectedMemberId) || filteredMembers[0] || members[0];

  // Practical Templates
  const getTemplateText = (m: Member, c: CadenceType) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://redapplefitness.com';
    const passUrl = generateShareablePassUrl(m, baseUrl);

    switch (c) {
      case '3d':
        return `Hello ${m.fullName},\n\nYour Red Apple Gym membership expires in 3 days (${m.expiryDate}).\n\n📱 View your live QR pass:\n${passUrl}\n\nPlease renew early to ensure uninterrupted gym access!`;
      case '1d':
        return `Hello ${m.fullName},\n\nYour Red Apple Gym membership expires TOMORROW (${m.expiryDate})!\n\n📱 View your digital QR pass:\n${passUrl}\n\nRenew today to keep your access active.`;
      case 'expiry_day':
        return `Hello ${m.fullName},\n\nYour Red Apple Gym membership expires TODAY (${m.expiryDate}).\n\n📱 View your QR pass:\n${passUrl}\n\nPlease renew now to continue workouts without delay.`;
      case 'welcome':
        return `Hello ${m.fullName}! 🎉 Welcome to Red Apple Gym!\n\nMember ID: ${m.memberId}\nPlan: ${m.plan}\nValid Until: ${m.expiryDate}\n\n📱 Access your Digital Pass here:\n${passUrl}\n\nShow this pass at reception for instant check-in.`;
      case 'birthday':
        return `🎂 Happy Birthday ${m.fullName}! 🎉\n\nTeam Red Apple Gym wishes you a strong, healthy and power-packed year ahead! 🏋️‍♂️\n\n🎁 Exclusive Birthday Celebration Perk:\nGet an EXCLUSIVE +15 DAYS FREE on your next membership renewal!\n\nShow this message at the front desk to claim your perk.\n\nKeep crushing your fitness goals!\n- Red Apple Athletic Club, Cidco N-2`;
    }
  };

  const messageText = customEditableText !== null ? customEditableText : (activeMember ? getTemplateText(activeMember, cadence) : '');

  const handleSelectCadence = (c: CadenceType) => {
    setCadence(c);
    setCustomEditableText(null); // Reset to active template
  };

  const handleSelectMember = (id: string) => {
    setSelectedMemberId(id);
    setCustomEditableText(null);
  };

  // Direct 1-Click WhatsApp Dispatch
  const handleSendSingle = () => {
    if (!activeMember) return;
    sendWhatsAppMessage(
      activeMember.fullName,
      activeMember.whatsapp,
      'renewal_reminder',
      messageText
    );
    const link = generateWhatsAppLink(activeMember.whatsapp, messageText);
    window.open(link, '_blank');
    setSentNotice(`WhatsApp message sent to ${activeMember.fullName}!`);
    setTimeout(() => setSentNotice(null), 3500);
  };

  // 1-Click Blast to all members in current cadence
  const handleBlastCurrentCadence = () => {
    let targetMembers: Member[] = [];
    if (cadence === '3d') targetMembers = members.filter((m) => m.remainingDays >= 1 && m.remainingDays <= 3);
    if (cadence === '1d') targetMembers = members.filter((m) => m.remainingDays >= 0 && m.remainingDays <= 1);
    if (cadence === 'expiry_day') targetMembers = members.filter((m) => m.remainingDays <= 0);
    if (cadence === 'welcome') targetMembers = members.slice(0, 5);
    if (cadence === 'birthday') {
      const todayMMDD = `${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;
      targetMembers = members.filter((m) => m.dateOfBirth && m.dateOfBirth.slice(5) === todayMMDD);
      if (targetMembers.length === 0) {
        targetMembers = members.filter((m) => !!m.dateOfBirth).slice(0, 3);
      }
    }

    if (targetMembers.length === 0) {
      targetMembers = members.slice(0, 3);
    }

    const queue: BulkQueueItem[] = targetMembers.map((m) => ({
      id: m.id,
      name: m.fullName,
      mobile: m.whatsapp || m.mobile,
      message: getTemplateText(m, cadence),
      subtext: `${m.plan} • ${m.remainingDaysText}`,
      avatar: m.photo
    }));

    setBulkQueueItems(queue);
    setBulkQueueOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#1A1A1A] font-serif">
            WhatsApp Renewal Engine
          </h2>
          <p className="text-xs text-[#666666] mt-0.5">
            Simple 1-click WhatsApp reminders & automated birthday retention perks
          </p>
        </div>

        <button
          onClick={handleBlastCurrentCadence}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#C41E3A] hover:bg-[#8B1528] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs transition-all min-h-[44px] cursor-pointer active:scale-95"
        >
          <Zap className="w-4 h-4" />
          <span>Blast {cadence === '3d' ? '3-Day' : cadence === '1d' ? '1-Day' : cadence === 'birthday' ? 'Birthday +15D' : 'Cadence'} Alert</span>
        </button>
      </div>

      {sentNotice && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{sentNotice}</span>
        </div>
      )}

      {/* Cadence Selector Buttons (Horizontal swipe on mobile) */}
      <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar pb-1 sm:grid sm:grid-cols-5 scroll-smooth">
        {[
          { id: '3d' as CadenceType, label: '⏳ 3 Days Before', subtitle: 'Advance reminder' },
          { id: '1d' as CadenceType, label: '🚨 1 Day Before', subtitle: 'Expires tomorrow' },
          { id: 'expiry_day' as CadenceType, label: '⛔ On Expiry Date', subtitle: 'Expires today' },
          { id: 'welcome' as CadenceType, label: '🎟️ Welcome Pass', subtitle: 'New admission pass' },
          { id: 'birthday' as CadenceType, label: '🎂 Birthday Wish', subtitle: '+15 Days renewal perk' }
        ].map((tab) => {
          const isSelected = cadence === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleSelectCadence(tab.id)}
              className={`p-3.5 rounded-2xl border text-left transition-all min-w-[150px] shrink-0 sm:min-w-0 sm:shrink ${
                isSelected
                  ? 'bg-[#1A1A1A] text-white border-black/20 shadow-xs scale-[1.01]'
                  : 'bg-white border-black/10 text-[#4A4A4A] hover:bg-[#F8F6F4]'
              }`}
            >
              <div className="font-extrabold text-xs whitespace-nowrap">{tab.label}</div>
              <div className={`text-[10px] mt-0.5 truncate ${isSelected ? 'text-neutral-300' : 'text-[#71717A]'}`}>
                {tab.subtitle}
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Work Area: Left Selector & Editor + Right Live WhatsApp Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Select Member & Message */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 sm:p-6 rounded-3xl bg-white border border-black/10 space-y-4 shadow-xs">
            {/* Athlete Search & Selection */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#71717A] flex justify-between">
                <span>Select Athlete</span>
                <span className="text-[10px] text-[#A1A1AA] font-normal">Search by name or number</span>
              </label>

              <div className="relative">
                <Search className="w-4 h-4 text-[#8A8A8A] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Type name or phone (e.g. 'ka', 'moh', '98')..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F8F6F4] border border-black/10 text-xs text-[#1A1A1A] placeholder:text-[#A1A1AA] focus:outline-none focus:bg-white focus:border-[#C41E3A]"
                />
              </div>

              {/* Member Quick Buttons / Picker */}
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pt-1">
                {filteredMembers.map((m) => {
                  const isSelected = activeMember?.id === m.id;
                  const isDue = m.remainingDays <= 3;
                  return (
                    <button
                      key={m.id}
                      onClick={() => handleSelectMember(m.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                        isSelected
                          ? 'bg-[#C41E3A] text-white font-extrabold shadow-2xs'
                          : 'bg-[#F8F6F4] text-[#4A4A4A] hover:bg-neutral-200 border border-black/5'
                      }`}
                    >
                      <span>{m.fullName}</span>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                          isDue ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {m.remainingDaysText}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Recipient Details */}
            {activeMember && (
              <div className="p-3 rounded-2xl bg-[#F8F6F4] border border-black/5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <img
                    src={activeMember.photo}
                    alt={activeMember.fullName}
                    className="w-9 h-9 rounded-xl object-cover border border-black/10"
                  />
                  <div>
                    <div className="font-bold text-[#1A1A1A]">{activeMember.fullName}</div>
                    <div className="text-[10px] text-[#71717A] font-mono">
                      {activeMember.mobile} • {activeMember.plan}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      activeMember.remainingDays > 3
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-rose-100 text-rose-800 border border-rose-300'
                    }`}
                  >
                    {activeMember.remainingDaysText}
                  </div>
                  <div className="text-[10px] text-[#71717A] font-mono mt-0.5">
                    Expiry: {activeMember.expiryDate}
                  </div>
                </div>
              </div>
            )}

            {/* Message Editor */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#71717A] block">
                Message Content
              </label>
              <textarea
                rows={6}
                value={messageText}
                onChange={(e) => setCustomEditableText(e.target.value)}
                className="w-full p-3.5 rounded-2xl bg-[#F8F6F4] border border-black/10 text-[#1A1A1A] font-sans text-xs outline-none focus:bg-white focus:border-[#C41E3A] transition-all leading-relaxed resize-none"
              />
            </div>

            {/* Send Action */}
            <button
              onClick={handleSendSingle}
              disabled={!activeMember}
              className="w-full py-3.5 rounded-2xl bg-[#00C853] hover:bg-[#00B046] text-white font-bold text-xs uppercase tracking-wider shadow-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Send WhatsApp Directly to {activeMember?.fullName || 'Athlete'}</span>
            </button>
          </div>
        </div>

        {/* Right: Live WhatsApp Phone Mockup (Authentic Light WhatsApp theme) */}
        <div className="lg:col-span-5">
          <div className="p-5 rounded-3xl bg-white border border-black/10 shadow-xs space-y-3">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#71717A] flex items-center gap-1.5">
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>Live WhatsApp Message Preview</span>
            </div>

            {/* WhatsApp Chat Box */}
            <div className="rounded-2xl border border-black/10 overflow-hidden shadow-sm">
              {/* WhatsApp Header */}
              <div className="bg-[#075E54] px-3.5 py-2.5 flex items-center justify-between text-white">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-white text-[#075E54] flex items-center justify-center font-black text-[10px]">
                    RA
                  </div>
                  <div>
                    <div className="text-xs font-bold flex items-center gap-1">
                      <span>Red Apple Gym</span>
                      <Check className="w-3 h-3 text-emerald-300 stroke-[3]" />
                    </div>
                    <div className="text-[9px] text-emerald-100">Official Business Account</div>
                  </div>
                </div>
              </div>

              {/* WhatsApp Message Body */}
              <div className="p-4 min-h-56 flex flex-col justify-end bg-[#EFEAE2]">
                <div className="max-w-[90%] self-end bg-[#DCF8C6] text-[#111B21] p-3 rounded-2xl rounded-tr-none text-xs space-y-2 shadow-2xs border border-emerald-600/10">
                  <p className="whitespace-pre-line leading-relaxed text-[11px]">
                    {messageText || 'Select an athlete to preview message...'}
                  </p>
                  <div className="text-[9px] text-neutral-500 text-right font-mono flex items-center justify-end gap-1">
                    <span>Just now</span>
                    <span className="text-[#34B7F1] font-bold">✓✓</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* WhatsApp Logs Table */}
      <div className="p-5 rounded-3xl bg-white border border-black/10 space-y-3 shadow-xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
          Recent WhatsApp Delivery Audit Trail ({whatsAppLogs.length} Records)
        </h3>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8F6F4] text-[#71717A] uppercase text-[10px] font-bold tracking-wider border-b border-black/10">
              <tr>
                <th className="p-3">Sent At</th>
                <th className="p-3">Athlete</th>
                <th className="p-3">Mobile Number</th>
                <th className="p-3">Message Type</th>
                <th className="p-3">Delivery Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {whatsAppLogs.slice(0, 5).map((log, idx) => (
                <tr key={`${log.id}-${idx}`} className="hover:bg-black/[0.02]">
                  <td className="p-3 font-mono text-[#71717A] text-[11px]">{log.sentAt}</td>
                  <td className="p-3 font-bold text-[#1A1A1A]">{log.recipientName}</td>
                  <td className="p-3 font-mono text-[#4A4A4A] text-[11px]">{log.recipientMobile}</td>
                  <td className="p-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-black/5 text-[#4A4A4A]">
                      {log.messageType.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      ✓ Delivered
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View: Clean Delivery Cards */}
        <div className="md:hidden divide-y divide-black/5 -mx-2">
          {whatsAppLogs.slice(0, 5).map((log) => (
            <div key={log.id} className="p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#1A1A1A] text-sm">{log.recipientName}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  ✓ Delivered
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-[#71717A] font-mono">
                <span>{log.recipientMobile}</span>
                <span>{log.sentAt}</span>
              </div>
              <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded bg-black/5 text-[#4A4A4A]">
                {log.messageType.replace('_', ' ')}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Bulk Dispatch Runner Queue Modal */}
      <BulkWhatsAppQueueModal
        isOpen={bulkQueueOpen}
        onClose={() => setBulkQueueOpen(false)}
        title={`Bulk WhatsApp: ${
          cadence === '3d'
            ? '3-Day Advance Renewal Alert'
            : cadence === '1d'
            ? '1-Day Urgent Renewal Alert'
            : cadence === 'expiry_day'
            ? 'On-Expiry Alert'
            : cadence === 'welcome'
            ? 'New Member Welcome Passes'
            : 'Birthday Wishes & Renewal Perks'
        }`}
        subtitle={`Sending messages to ${bulkQueueItems.length} athletes on WhatsApp`}
        items={bulkQueueItems}
        messageType={cadence === 'birthday' ? 'birthday_wish' : 'renewal_reminder'}
      />
    </div>
  );
};
