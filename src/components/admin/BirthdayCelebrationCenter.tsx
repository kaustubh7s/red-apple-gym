'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/lib/store';
import { Member } from '@/lib/types';
import {
  Cake,
  Gift,
  PartyPopper,
  Calendar,
  Clock,
  Search,
  MessageSquare,
  Sparkles,
  Phone,
  RefreshCw,
  CheckCircle2,
  Filter,
  UserCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { BulkWhatsAppQueueModal, BulkQueueItem } from './BulkWhatsAppQueueModal';

export const BirthdayCelebrationCenter: React.FC = () => {
  const { members, sendWhatsAppMessage, generateWhatsAppLink, updateMember } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'today' | 'tomorrow' | 'week' | 'month' | 'all'>('today');
  const [wishedMemberIds, setWishedMemberIds] = useState<Record<string, boolean>>({});
  const [customPerkText, setCustomPerkText] = useState('+15 extra days on your next renewal');
  const [bulkQueueOpen, setBulkQueueOpen] = useState(false);
  const [bulkQueueItems, setBulkQueueItems] = useState<BulkQueueItem[]>([]);

  const now = useMemo(() => new Date(), []);
  const todayMM = String(now.getMonth() + 1).padStart(2, '0');
  const todayDD = String(now.getDate()).padStart(2, '0');
  const todayMMDD = `${todayMM}-${todayDD}`;

  const tomorrow = useMemo(() => {
    const d = new Date(now);
    d.setDate(d.getDate() + 1);
    return d;
  }, [now]);
  const tomorrowMMDD = `${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;

  // Next 7 days list
  const next7DaysMMDD = useMemo(() => {
    const list: string[] = [];
    for (let i = 2; i <= 7; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() + i);
      list.push(`${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
    }
    return list;
  }, [now]);

  // Calculations for groups
  const todayBirthdays = useMemo(() => {
    return members.filter((m) => {
      if (!m.dateOfBirth) return false;
      const parts = m.dateOfBirth.split('-');
      return parts.length === 3 && `${parts[1]}-${parts[2]}` === todayMMDD;
    });
  }, [members, todayMMDD]);

  const tomorrowBirthdays = useMemo(() => {
    return members.filter((m) => {
      if (!m.dateOfBirth) return false;
      const parts = m.dateOfBirth.split('-');
      return parts.length === 3 && `${parts[1]}-${parts[2]}` === tomorrowMMDD;
    });
  }, [members, tomorrowMMDD]);

  const thisWeekBirthdays = useMemo(() => {
    return members.filter((m) => {
      if (!m.dateOfBirth) return false;
      const parts = m.dateOfBirth.split('-');
      return parts.length === 3 && next7DaysMMDD.includes(`${parts[1]}-${parts[2]}`);
    });
  }, [members, next7DaysMMDD]);

  const thisMonthBirthdays = useMemo(() => {
    return members.filter((m) => {
      if (!m.dateOfBirth) return false;
      const parts = m.dateOfBirth.split('-');
      return parts.length === 3 && parts[1] === todayMM;
    });
  }, [members, todayMM]);

  // Filtered members according to active tab
  const displayedMembers = useMemo(() => {
    let list: { member: Member; timing: 'today' | 'tomorrow' | 'week' | 'month' | 'other' }[] = [];

    if (activeTab === 'today') {
      list = todayBirthdays.map((m) => ({ member: m, timing: 'today' }));
    } else if (activeTab === 'tomorrow') {
      list = tomorrowBirthdays.map((m) => ({ member: m, timing: 'tomorrow' }));
    } else if (activeTab === 'week') {
      list = thisWeekBirthdays.map((m) => ({ member: m, timing: 'week' }));
    } else if (activeTab === 'month') {
      list = thisMonthBirthdays.map((m) => {
        const parts = m.dateOfBirth!.split('-');
        const mmdd = `${parts[1]}-${parts[2]}`;
        const timing = mmdd === todayMMDD ? 'today' : mmdd === tomorrowMMDD ? 'tomorrow' : 'month';
        return { member: m, timing };
      });
    } else {
      list = members.map((m) => {
        if (!m.dateOfBirth) return { member: m, timing: 'other' };
        const parts = m.dateOfBirth.split('-');
        const mmdd = `${parts[1]}-${parts[2]}`;
        let timing: 'today' | 'tomorrow' | 'week' | 'month' | 'other' = 'other';
        if (mmdd === todayMMDD) timing = 'today';
        else if (mmdd === tomorrowMMDD) timing = 'tomorrow';
        else if (next7DaysMMDD.includes(mmdd)) timing = 'week';
        else if (parts[1] === todayMM) timing = 'month';
        return { member: m, timing };
      });
    }

    if (!searchQuery.trim()) return list;

    const q = searchQuery.toLowerCase();
    return list.filter(
      (item) =>
        item.member.fullName.toLowerCase().includes(q) ||
        item.member.memberId.toLowerCase().includes(q) ||
        item.member.mobile.includes(q)
    );
  }, [activeTab, todayBirthdays, tomorrowBirthdays, thisWeekBirthdays, thisMonthBirthdays, members, searchQuery, todayMMDD, tomorrowMMDD, next7DaysMMDD, todayMM]);

  const generateWishMessage = (m: Member, timing: string) => {
    const birthYear = m.dateOfBirth ? Number(m.dateOfBirth.split('-')[0]) : now.getFullYear() - m.age;
    const turningAge = now.getFullYear() - birthYear;

    let greetingLine = `🎂 Happy Birthday ${m.fullName}! 🎉`;
    let timingSubtext = `on turning ${turningAge}! 🏋️‍♂️`;

    if (timing === 'tomorrow') {
      greetingLine = `🎂 Advance Happy Birthday ${m.fullName}! 🎉`;
      timingSubtext = `on turning ${turningAge} tomorrow! 🏋️‍♂️`;
    } else if (timing === 'week') {
      greetingLine = `🎂 Early Birthday Wishes from Red Apple Gym, ${m.fullName}! 🎉`;
      timingSubtext = `on your upcoming birthday! 🏋️‍♂️`;
    }

    return `${greetingLine}\n\nTeam Red Apple Gym wishes you a strong, healthy and power-packed year ahead ${timingSubtext}\n\n🎁 Exclusive Birthday Celebration Gift:\nYou have unlocked ${customPerkText}!\n\nShow this message at the front desk to claim your perk.\n\nKeep crushing your fitness goals!\n- Red Apple Athletic Club, Cidco N-2`;
  };

  const handleSendWish = (m: Member, timing: string) => {
    const message = generateWishMessage(m, timing);

    sendWhatsAppMessage(m.fullName, m.whatsapp || m.mobile, 'birthday_wish', message);
    const link = generateWhatsAppLink(m.whatsapp || m.mobile, message);
    window.open(link, '_blank');

    setWishedMemberIds((prev) => ({ ...prev, [m.id]: true }));

    confetti({
      particleCount: 85,
      spread: 85,
      origin: { y: 0.6 }
    });
  };

  const handleLaunchBulkWishes = () => {
    if (displayedMembers.length === 0) return;
    const items: BulkQueueItem[] = displayedMembers.map(({ member, timing }) => ({
      id: member.id,
      name: member.fullName,
      mobile: member.whatsapp || member.mobile,
      message: generateWishMessage(member, timing),
      subtext: `${member.memberId} • ${member.plan} • ${timing.toUpperCase()}`,
      avatar: member.photo
    }));
    setBulkQueueItems(items);
    setBulkQueueOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-amber-50 via-rose-50/50 to-orange-50/40 rounded-3xl p-6 sm:p-8 border border-amber-200/80 shadow-xs relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold">
              <Cake className="w-3.5 h-3.5 text-amber-600" />
              <span>Birthday & Anniversary Automation</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] font-serif tracking-tight">
              Birthday Celebrations & Perks
            </h1>
            <p className="text-xs sm:text-sm text-[#666666] max-w-2xl leading-relaxed">
              Automate member joy and loyalty. Alert front desk on birthdays today and tomorrow, and send personalized
              1-click WhatsApp wishes with exclusive membership renewal incentives.
            </p>
          </div>

          {/* Quick Stat Counter Badges (Clean 3-column mobile grid) */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full md:w-auto shrink-0">
            <div className="px-2.5 sm:px-4 py-2.5 sm:py-3 rounded-2xl bg-white border border-amber-300 shadow-2xs text-center">
              <span className="text-[9px] sm:text-[10px] uppercase font-bold text-amber-800 tracking-wider block">Today</span>
              <span className="text-xl sm:text-2xl font-extrabold text-[#1A1A1A] font-serif">{todayBirthdays.length}</span>
            </div>
            <div className="px-2.5 sm:px-4 py-2.5 sm:py-3 rounded-2xl bg-white border border-orange-200 shadow-2xs text-center">
              <span className="text-[9px] sm:text-[10px] uppercase font-bold text-orange-800 tracking-wider block">Tomorrow</span>
              <span className="text-xl sm:text-2xl font-extrabold text-[#1A1A1A] font-serif">{tomorrowBirthdays.length}</span>
            </div>
            <div className="px-2.5 sm:px-4 py-2.5 sm:py-3 rounded-2xl bg-white border border-amber-200 shadow-2xs text-center">
              <span className="text-[9px] sm:text-[10px] uppercase font-bold text-neutral-600 tracking-wider block">This Week</span>
              <span className="text-xl sm:text-2xl font-extrabold text-[#1A1A1A] font-serif">{thisWeekBirthdays.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Perk Configuration Strip */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-black/10 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold shrink-0">
            <Gift className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-[#1A1A1A] block">Exclusive Renewal Perk</span>
            <span className="text-[#666666]">Incentive automatically appended to WhatsApp wishes:</span>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            value={customPerkText}
            onChange={(e) => setCustomPerkText(e.target.value)}
            className="w-full sm:w-auto sm:min-w-[280px] px-3.5 py-2.5 rounded-xl border border-black/10 bg-[#F8F6F4] text-[#1A1A1A] font-semibold text-xs focus:outline-none focus:ring-1 focus:ring-[#C41E3A]"
          />
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white rounded-2xl p-3 sm:p-4 border border-black/10 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Timing Tabs (Smooth horizontal swipe on mobile) */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0 w-full lg:w-auto scroll-smooth">
          <button
            onClick={() => setActiveTab('today')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeTab === 'today'
                ? 'bg-[#1A1A1A] text-white shadow-2xs'
                : 'bg-[#F8F6F4] hover:bg-neutral-200 text-[#4A4A4A]'
            }`}
          >
            <span>🎂 Today</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeTab === 'today' ? 'bg-amber-400 text-black font-extrabold' : 'bg-amber-100 text-amber-900'
              }`}
            >
              {todayBirthdays.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('tomorrow')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeTab === 'tomorrow'
                ? 'bg-[#1A1A1A] text-white shadow-2xs'
                : 'bg-[#F8F6F4] hover:bg-neutral-200 text-[#4A4A4A]'
            }`}
          >
            <span>⏰ Tomorrow</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeTab === 'tomorrow' ? 'bg-amber-400 text-black font-extrabold' : 'bg-orange-100 text-orange-900'
              }`}
            >
              {tomorrowBirthdays.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('week')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeTab === 'week'
                ? 'bg-[#1A1A1A] text-white shadow-2xs'
                : 'bg-[#F8F6F4] hover:bg-neutral-200 text-[#4A4A4A]'
            }`}
          >
            <span>📅 Next 7 Days</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeTab === 'week' ? 'bg-amber-400 text-black font-extrabold' : 'bg-neutral-200 text-neutral-700'
              }`}
            >
              {thisWeekBirthdays.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('month')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeTab === 'month'
                ? 'bg-[#1A1A1A] text-white shadow-2xs'
                : 'bg-[#F8F6F4] hover:bg-neutral-200 text-[#4A4A4A]'
            }`}
          >
            <span>🗓️ This Month</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeTab === 'month' ? 'bg-amber-400 text-black font-extrabold' : 'bg-neutral-200 text-neutral-700'
              }`}
            >
              {thisMonthBirthdays.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeTab === 'all'
                ? 'bg-[#1A1A1A] text-white shadow-2xs'
                : 'bg-[#F8F6F4] hover:bg-neutral-200 text-[#4A4A4A]'
            }`}
          >
            <span>All Athletes</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeTab === 'all' ? 'bg-amber-400 text-black font-extrabold' : 'bg-neutral-200 text-neutral-700'
              }`}
            >
              {members.length}
            </span>
          </button>
        </div>

        {/* Search Input and Bulk Wish Action */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full lg:w-auto">
          <div className="relative flex-1 sm:w-60">
            <Search className="w-4 h-4 text-[#8A8A8A] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search athlete by name, ID..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-black/10 bg-[#F8F6F4] text-[#1A1A1A] text-xs focus:outline-none focus:ring-1 focus:ring-[#C41E3A] focus:bg-white"
            />
          </div>

          {displayedMembers.length > 0 && (
            <button
              onClick={handleLaunchBulkWishes}
              className="px-3.5 py-2 rounded-xl bg-[#00C853] hover:bg-[#00B046] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 shrink-0 active:scale-95 cursor-pointer min-h-[38px]"
            >
              <PartyPopper className="w-3.5 h-3.5" />
              <span>Bulk Wish ({displayedMembers.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Member Cards Grid */}
      {displayedMembers.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-black/10 shadow-xs space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto">
            <Cake className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-base text-[#1A1A1A]">No Birthdays in Selected Range</h3>
          <p className="text-xs text-[#666666] max-w-md mx-auto">
            {activeTab === 'today'
              ? 'No member birthdays registered for today. Check tomorrow or upcoming week to view scheduled celebrations.'
              : 'Try selecting a different filter or search for an athlete.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayedMembers.map(({ member: m, timing }) => {
            const birthYear = m.dateOfBirth ? Number(m.dateOfBirth.split('-')[0]) : now.getFullYear() - m.age;
            const turningAge = now.getFullYear() - birthYear;
            const hasWished = wishedMemberIds[m.id];

            let badgeText = `Turning ${turningAge} Today!`;
            let badgeStyle = 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse';
            let actionLabel = 'Wish on WhatsApp';

            if (timing === 'tomorrow') {
              badgeText = `Tomorrow • Turning ${turningAge}`;
              badgeStyle = 'bg-orange-100 text-orange-900 border-orange-300';
              actionLabel = 'Advance Wish on WhatsApp';
            } else if (timing === 'week') {
              badgeText = `This Week (${m.dateOfBirth ? m.dateOfBirth.slice(5) : ''}) • Turning ${turningAge}`;
              badgeStyle = 'bg-sky-100 text-sky-900 border-sky-300';
              actionLabel = 'Early Wish on WhatsApp';
            } else if (timing === 'month') {
              badgeText = `DOB: ${m.dateOfBirth ? m.dateOfBirth.slice(5) : ''} • Turning ${turningAge}`;
              badgeStyle = 'bg-purple-100 text-purple-900 border-purple-200';
              actionLabel = 'Wish on WhatsApp';
            } else {
              badgeText = m.dateOfBirth ? `DOB: ${m.dateOfBirth} (${m.age} yrs)` : 'No DOB Set';
              badgeStyle = 'bg-neutral-100 text-neutral-800 border-neutral-200';
              actionLabel = 'Send Birthday Perk';
            }

            return (
              <div
                key={m.id}
                className="bg-white rounded-2xl p-5 border border-black/10 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative shrink-0">
                      {m.photo ? (
                        <img
                          src={m.photo}
                          alt={m.fullName}
                          className="w-12 h-12 rounded-2xl object-cover border border-black/10"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-2xl bg-black/5 flex items-center justify-center font-bold text-sm text-[#1A1A1A]">
                          {m.fullName.charAt(0)}
                        </div>
                      )}
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] shadow-xs">
                        🎂
                      </div>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-sm text-[#1A1A1A] truncate">{m.fullName}</h4>
                        <span className={`text-[10px] font-bold px-2 py-0.2 rounded border shrink-0 ${badgeStyle}`}>
                          {badgeText}
                        </span>
                      </div>
                      <div className="text-xs text-[#666666] mt-0.5 font-mono">
                        <span className="text-[#C41E3A] font-semibold">{m.memberId}</span> • {m.mobile} • {m.plan}
                      </div>
                    </div>
                  </div>

                  <span className="font-mono text-[11px] text-[#71717A] bg-black/5 px-2 py-0.5 rounded shrink-0">
                    {m.dateOfBirth || 'Set DOB'}
                  </span>
                </div>

                {/* Perk Strip */}
                <div className="p-3 rounded-xl bg-[#F8F6F4] border border-black/5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-emerald-800 font-medium truncate">
                    <Gift className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">Reward: {customPerkText}</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded shrink-0">
                    Ready
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between gap-3 pt-1">
                  <div className="text-[11px] text-[#71717A]">
                    {hasWished ? (
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Wish sent today</span>
                      </span>
                    ) : (
                      <span>WhatsApp greeting ready</span>
                    )}
                  </div>

                  <button
                    onClick={() => handleSendWish(m, timing)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 active:scale-95 ${
                      hasWished
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                        : 'bg-[#00C853] hover:bg-[#00B046] text-white'
                    }`}
                  >
                    <PartyPopper className="w-3.5 h-3.5" />
                    <span>{hasWished ? 'Wished (Resend)' : actionLabel}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 1-Click Interactive Bulk WhatsApp Queue Runner Modal */}
      <BulkWhatsAppQueueModal
        isOpen={bulkQueueOpen}
        onClose={() => setBulkQueueOpen(false)}
        title={`Birthday Wishes (${activeTab.toUpperCase()})`}
        subtitle="1-click step-through sender to celebrate members without getting blocked by browser popup blockers."
        items={bulkQueueItems}
        messageType="birthday_wish"
      />
    </div>
  );
};
