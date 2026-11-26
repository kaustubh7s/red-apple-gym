'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/lib/store';
import { AdminTab } from './AdminSidebar';
import { QuickRenewModal } from './QuickRenewModal';
import { MemberProfileModal } from './MemberProfileModal';
import { Member, AdmissionLead, MembershipPlanType, PaymentMode } from '@/lib/types';
import { calculateMembershipCountdown, formatFriendlyDate, calculateDaysAbsent } from '@/lib/dateUtils';
import {
  Users,
  UserCheck,
  Clock,
  AlertTriangle,
  CreditCard,
  IndianRupee,
  RefreshCw,
  MessageCircle,
  Eye,
  CheckCircle2,
  X,
  ChevronRight,
  Sparkles,
  Calendar,
  AlertCircle,
  Cake,
  Gift,
  PartyPopper
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface DashboardOverviewProps {
  onNavigateTab: (tab: AdminTab) => void;
  onOpenAddMember: () => void;
  onOpenQuickCheckIn: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  onNavigateTab
}) => {
  const {
    members,
    payments,
    leads,
    attendanceRecords,
    generateWhatsAppLink,
    sendWhatsAppMessage,
    convertLeadToMember,
    updateLeadStatus
  } = useApp();

  const [renewModalMember, setRenewModalMember] = useState<Member | null>(null);
  const [profileModalMember, setProfileModalMember] = useState<Member | null>(null);
  const [wishedMemberIds, setWishedMemberIds] = useState<Record<string, boolean>>({});

  // Quick admission conversion state
  const [reviewLead, setReviewLead] = useState<AdmissionLead | null>(null);
  const [activatePlan, setActivatePlan] = useState<MembershipPlanType>('Annual');
  const [activateFee, setActivateFee] = useState<number>(7000);
  const [activatePaid, setActivatePaid] = useState<number>(7000);
  const [activatePaymentMode, setActivatePaymentMode] = useState<PaymentMode>('UPI');

  // Revenue chart view toggle
  const [chartView, setChartView] = useState<'monthly' | 'yearly'>('monthly');

  // Attention category filter tab (Only Expired, 1-3 Days, Today, Admissions, Irregular/Absent >7d)
  const [attentionFilter, setAttentionFilter] = useState<'expired' | '3d' | 'today' | 'leads' | 'absent'>('expired');

  // Current year & month for real calculations
  const now = new Date();
  const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const currentYear = `${now.getFullYear()}`;

  // 1. Calculate KPI Metrics from real database
  const totalMembers = members.length;
  const activeMembers = members.filter((m) => m.status === 'Active').length;
  const expiringSoonMembers = members.filter((m) => m.remainingDays > 0 && m.remainingDays <= 7);
  const expiredMembers = members.filter((m) => m.remainingDays <= 0 || m.status === 'Expired');
  const duesMembers = members.filter((m) => m.dueAmount > 0);
  const totalDuesAmount = duesMembers.reduce((sum, m) => sum + (m.dueAmount || 0), 0);

  const thisMonthRevenue = useMemo(() => {
    return payments
      .filter((p) => p.paymentDate && p.paymentDate.startsWith(currentYearMonth))
      .reduce((sum, p) => sum + (p.amount || 0), 0);
  }, [payments, currentYearMonth]);

  // Birthday & Anniversary Calculations (Today, Tomorrow, Upcoming)
  const todayMMDD = `${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  
  const tomorrow = useMemo(() => {
    const d = new Date(now);
    d.setDate(d.getDate() + 1);
    return d;
  }, [now]);
  const tomorrowMMDD = `${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;

  const [birthdayFilter, setBirthdayFilter] = useState<'today' | 'tomorrow' | 'upcoming' | 'all'>('today');

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

  const upcomingBirthdays = useMemo(() => {
    const nextDates: string[] = [];
    for (let i = 2; i <= 7; i++) {
      const future = new Date(now);
      future.setDate(future.getDate() + i);
      nextDates.push(`${String(future.getMonth() + 1).padStart(2, '0')}-${String(future.getDate()).padStart(2, '0')}`);
    }

    return members.filter((m) => {
      if (!m.dateOfBirth) return false;
      const parts = m.dateOfBirth.split('-');
      return parts.length === 3 && nextDates.includes(`${parts[1]}-${parts[2]}`);
    });
  }, [members, now]);

  const displayedBirthdays = useMemo(() => {
    if (birthdayFilter === 'today') {
      return todayBirthdays.map((m) => ({ member: m, timing: 'today' as const }));
    }
    if (birthdayFilter === 'tomorrow') {
      return tomorrowBirthdays.map((m) => ({ member: m, timing: 'tomorrow' as const }));
    }
    if (birthdayFilter === 'upcoming') {
      return upcomingBirthdays.map((m) => ({ member: m, timing: 'upcoming' as const }));
    }
    return [
      ...todayBirthdays.map((m) => ({ member: m, timing: 'today' as const })),
      ...tomorrowBirthdays.map((m) => ({ member: m, timing: 'tomorrow' as const })),
      ...upcomingBirthdays.map((m) => ({ member: m, timing: 'upcoming' as const }))
    ];
  }, [birthdayFilter, todayBirthdays, tomorrowBirthdays, upcomingBirthdays]);

  const handleSendBirthdayWish = (m: Member, timing: 'today' | 'tomorrow' | 'upcoming' = 'today') => {
    const birthYear = m.dateOfBirth ? Number(m.dateOfBirth.split('-')[0]) : (now.getFullYear() - m.age);
    const turningAge = now.getFullYear() - birthYear;
    
    let message = '';
    if (timing === 'tomorrow') {
      message = `🎂 Advance Happy Birthday ${m.fullName}! 🎉\n\nTeam Red Apple Gym wishes you a strong, healthy and power-packed year ahead on turning ${turningAge} tomorrow! 🏋️‍♂️\n\n🎁 Exclusive Birthday Celebration Gift:\nYou have unlocked +15 DAYS FREE on your next membership renewal!\n\nShow this message at the front desk to claim your perk.\n\nKeep crushing your fitness goals!\n- Red Apple Athletic Club, Cidco N-2`;
    } else if (timing === 'upcoming') {
      message = `🎂 Early Birthday Wishes from Red Apple Gym, ${m.fullName}! 🎉\n\nTeam Red Apple Gym is celebrating your upcoming birthday! 🏋️‍♂️\n\n🎁 Exclusive Birthday Celebration Gift:\nYou have unlocked +15 DAYS FREE on your next membership renewal!\n\nShow this message at the front desk to claim your perk.\n\nKeep crushing your fitness goals!\n- Red Apple Athletic Club, Cidco N-2`;
    } else {
      message = `🎂 Happy Birthday ${m.fullName}! 🎉\n\nTeam Red Apple Gym wishes you a strong, healthy and power-packed year ahead on turning ${turningAge}! 🏋️‍♂️\n\n🎁 Exclusive Birthday Celebration Gift:\nYou have unlocked +15 DAYS FREE on your next membership renewal!\n\nShow this message at the front desk to claim your perk.\n\nKeep crushing your fitness goals!\n- Red Apple Athletic Club, Cidco N-2`;
    }

    sendWhatsAppMessage(m.fullName, m.whatsapp || m.mobile, 'birthday_wish', message);
    const link = generateWhatsAppLink(m.whatsapp || m.mobile, message);
    window.open(link, '_blank');

    setWishedMemberIds((prev) => ({ ...prev, [m.id]: true }));

    confetti({
      particleCount: 80,
      spread: 80,
      origin: { y: 0.6 }
    });
  };

  // 6 Primary KPI Cards as requested
  const kpiCards = [
    {
      title: 'Total Members',
      value: totalMembers,
      meta: 'Registered athletes',
      icon: Users,
      color: 'text-[#1A1A1A]',
      bg: 'bg-neutral-50',
      border: 'border-black/10',
      tab: 'members' as AdminTab
    },
    {
      title: 'Active Members',
      value: activeMembers,
      meta: `${totalMembers > 0 ? Math.round((activeMembers / totalMembers) * 100) : 0}% active ratio`,
      icon: UserCheck,
      color: 'text-emerald-700',
      bg: 'bg-emerald-50/50',
      border: 'border-emerald-200',
      tab: 'members' as AdminTab
    },
    {
      title: 'Expiring Soon',
      value: expiringSoonMembers.length,
      meta: 'Next 7 days countdown',
      icon: Clock,
      color: 'text-amber-800',
      bg: 'bg-amber-50/50',
      border: 'border-amber-200',
      tab: 'renewals' as AdminTab
    },
    {
      title: 'Expired Members',
      value: expiredMembers.length,
      meta: 'Follow-up required',
      icon: AlertTriangle,
      color: 'text-[#C41E3A]',
      bg: 'bg-rose-50/50',
      border: 'border-rose-200',
      tab: 'renewals' as AdminTab
    },
    {
      title: 'Pending Payments',
      value: duesMembers.length,
      meta: `₹${totalDuesAmount.toLocaleString('en-IN')} outstanding`,
      icon: CreditCard,
      color: 'text-purple-800',
      bg: 'bg-purple-50/50',
      border: 'border-purple-200',
      tab: 'payments' as AdminTab
    },
    {
      title: 'Revenue This Month',
      value: `₹${thisMonthRevenue.toLocaleString('en-IN')}`,
      meta: 'Realized collections',
      icon: IndianRupee,
      color: 'text-[#C41E3A]',
      bg: 'bg-rose-50/30',
      border: 'border-[#C41E3A]/20',
      tab: 'payments' as AdminTab
    }
  ];

  // 2. Needs Your Attention: Prioritized lists
  const expiringToday = members.filter((m) => m.remainingDays === 0);
  const expiring1To3Days = members.filter((m) => m.remainingDays > 0 && m.remainingDays <= 3);
  const expiring4To7Days = members.filter((m) => m.remainingDays > 3 && m.remainingDays <= 7);
  const expiredFollowUps = members.filter((m) => m.remainingDays < 0).slice(0, 10);
  const pendingLeads = leads.filter((l) => l.status === 'Pending');

  // Irregular members (> 7 days inactive)
  const irregularMembers = useMemo(() => {
    return members
      .filter((m) => m.status !== 'Expired' || m.remainingDays > 0)
      .map((m) => {
        const info = calculateDaysAbsent(m.joinDate, attendanceRecords, m.id, m.memberId);
        return {
          member: m,
          lastCheckInDate: info.lastCheckInDate,
          daysAbsent: info.daysAbsent
        };
      })
      .filter((item) => item.daysAbsent > 7)
      .sort((a, b) => b.daysAbsent - a.daysAbsent);
  }, [members, attendanceRecords]);

  // Items for the attention section
  interface AttentionItem {
    id: string;
    type: 'today' | '3d' | '7d' | 'expired' | 'due' | 'lead' | 'absent';
    name: string;
    phone: string;
    details: string;
    badge: string;
    badgeColor: string;
    member?: Member;
    lead?: AdmissionLead;
    actionLabel: string;
  }

  const attentionItems: AttentionItem[] = useMemo(() => {
    const list: AttentionItem[] = [];

    // Expiring today
    expiringToday.forEach((m) => {
      list.push({
        id: `today-${m.id}`,
        type: 'today',
        name: m.fullName,
        phone: m.mobile,
        details: `${m.plan} pass expires today (${formatFriendlyDate(m.expiryDate)})`,
        badge: 'Expires Today',
        badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
        member: m,
        actionLabel: 'Renew'
      });
    });

    // Expiring in 1-3 days
    expiring1To3Days.forEach((m) => {
      list.push({
        id: `3d-${m.id}`,
        type: '3d',
        name: m.fullName,
        phone: m.mobile,
        details: `${m.plan} pass • ${m.remainingDaysText} (${formatFriendlyDate(m.expiryDate)})`,
        badge: m.remainingDaysText,
        badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
        member: m,
        actionLabel: 'Renew'
      });
    });

    // Expiring in 4-7 days
    expiring4To7Days.forEach((m) => {
      list.push({
        id: `7d-${m.id}`,
        type: '7d',
        name: m.fullName,
        phone: m.mobile,
        details: `${m.plan} pass • ${m.remainingDaysText} (${formatFriendlyDate(m.expiryDate)})`,
        badge: m.remainingDaysText,
        badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
        member: m,
        actionLabel: 'Renew'
      });
    });

    // Expired requiring follow-up
    expiredFollowUps.forEach((m) => {
      list.push({
        id: `exp-${m.id}`,
        type: 'expired',
        name: m.fullName,
        phone: m.mobile,
        details: `${m.plan} pass • ${m.remainingDaysText} (${formatFriendlyDate(m.expiryDate)})`,
        badge: m.remainingDaysText,
        badgeColor: 'bg-rose-50 text-[#C41E3A] border-rose-200',
        member: m,
        actionLabel: 'Renew'
      });
    });

    // Outstanding payments
    duesMembers.forEach((m) => {
      list.push({
        id: `due-${m.id}`,
        type: 'due',
        name: m.fullName,
        phone: m.mobile,
        details: `₹${m.dueAmount.toLocaleString('en-IN')} pending for ${m.plan} membership`,
        badge: `₹${m.dueAmount} Due`,
        badgeColor: 'bg-purple-50 text-purple-800 border-purple-200',
        member: m,
        actionLabel: 'Record Payment'
      });
    });

    // New admission applications
    pendingLeads.forEach((l) => {
      list.push({
        id: `lead-${l.id}`,
        type: 'lead',
        name: l.fullName,
        phone: l.mobile,
        details: `Interested in ${l.preferredPlan} • Applied on ${formatFriendlyDate(l.createdAt)}`,
        badge: 'New Admission',
        badgeColor: 'bg-blue-50 text-blue-800 border-blue-200',
        lead: l,
        actionLabel: 'Review Admission'
      });
    });

    // Irregular/Absent members (> 7 days inactive)
    irregularMembers.forEach(({ member: m, daysAbsent, lastCheckInDate }) => {
      list.push({
        id: `absent-${m.id}`,
        type: 'absent',
        name: m.fullName,
        phone: m.mobile,
        details: lastCheckInDate
          ? `${daysAbsent} days absent • Last visited ${formatFriendlyDate(lastCheckInDate)}`
          : `${daysAbsent} days absent • No check-ins since joining (${formatFriendlyDate(m.joinDate)})`,
        badge: `${daysAbsent}d Absent`,
        badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
        member: m,
        actionLabel: 'Follow Up'
      });
    });

    return list;
  }, [expiringToday, expiring1To3Days, expiring4To7Days, expiredFollowUps, duesMembers, pendingLeads, irregularMembers]);

  // Filtered attention list (strictly expired, 1-3d, today, leads, absent)
  const filteredAttentionList = useMemo(() => {
    if (attentionFilter === 'expired') return attentionItems.filter((i) => i.type === 'expired');
    if (attentionFilter === '3d') return attentionItems.filter((i) => i.type === '3d');
    if (attentionFilter === 'today') return attentionItems.filter((i) => i.type === 'today');
    if (attentionFilter === 'leads') return attentionItems.filter((i) => i.type === 'lead');
    if (attentionFilter === 'absent') return attentionItems.filter((i) => i.type === 'absent');
    return attentionItems.filter((i) => ['expired', '3d', 'today', 'lead', 'absent'].includes(i.type));
  }, [attentionItems, attentionFilter]);

  // 3. Real Revenue Data Calculation for Chart
  const revenueChartData = useMemo(() => {
    if (chartView === 'yearly') {
      const yearlyTotals: Record<string, number> = {};
      payments.forEach((p) => {
        const yr = p.paymentDate.split('-')[0] || '2026';
        yearlyTotals[yr] = (yearlyTotals[yr] || 0) + p.amount;
      });
      return Object.entries(yearlyTotals).map(([year, amount]) => ({
        label: year,
        amount
      }));
    }

    // Monthly aggregation from real payments
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyMap: Record<string, number> = {};

    // Generate recent 6 rolling calendar months
    const cur = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(cur.getFullYear(), cur.getMonth() - i, 1);
      const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthlyMap[ym] = 0;
    }

    // Accumulate real payment collections
    payments.forEach((p) => {
      if (p.paymentDate) {
        const ym = p.paymentDate.slice(0, 7);
        if (ym && monthlyMap[ym] !== undefined) {
          monthlyMap[ym] += (p.amount || 0);
        }
      }
    });

    return Object.entries(monthlyMap)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([ym, amount]) => {
        const mIdx = parseInt(ym.split('-')[1], 10) - 1;
        return {
          label: monthNames[mIdx] || ym,
          amount
        };
      });
  }, [payments, chartView]);

  const totalPeriodRevenue = useMemo(() => {
    return revenueChartData.reduce((sum, item) => sum + item.amount, 0);
  }, [revenueChartData]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. PRIMARY KPI CARDS (6 COMPACT CARDS) */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#8A8A8A]">
            Core Business Metrics
          </h2>
          <span className="text-[11px] text-[#666666]">Real-time Database Count</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {kpiCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <button
                key={idx}
                onClick={() => onNavigateTab(card.tab)}
                className={`p-4 rounded-2xl bg-white border ${card.border} hover:border-[#C41E3A]/40 text-left transition-all hover:shadow-xs group`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-8 h-8 rounded-xl ${card.bg} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-4 h-4 ${card.color}`} />
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-neutral-300 group-hover:text-[#C41E3A] group-hover:translate-x-0.5 transition-all" />
                </div>
                <div className="text-[11px] font-semibold text-[#666666] truncate">
                  {card.title}
                </div>
                <div className="text-xl sm:text-2xl font-bold text-[#1A1A1A] font-serif tracking-tight mt-0.5 truncate">
                  {card.value}
                </div>
                <div className="text-[10px] text-[#8A8A8A] truncate mt-1">
                  {card.meta}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. BIRTHDAY & ANNIVERSARY CELEBRATION AUTOMATION (Visible when Today or Tomorrow has birthdays) */}
      {(todayBirthdays.length > 0 || tomorrowBirthdays.length > 0) && (
        <section className="bg-gradient-to-r from-amber-50 via-rose-50/50 to-amber-50/30 rounded-3xl p-5 sm:p-6 border border-amber-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-200/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center font-bold shadow-md shadow-amber-500/20">
              <Cake className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-[#1A1A1A] font-serif">
                  Birthday & Anniversary Celebrations
                </h2>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                    🎉 {todayBirthdays.length} Today
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-900 border border-orange-300">
                    ⏰ {tomorrowBirthdays.length} Tomorrow
                  </span>
                </div>
              </div>
              <p className="text-xs text-[#666666] mt-0.5">
                Automated member retention perk: 1-click WhatsApp wish with exclusive <strong>+15 Days Free Extension</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateTab('birthdays')}
              className="text-xs text-[#C41E3A] hover:underline font-bold flex items-center gap-1 self-start sm:self-center"
            >
              <span>Celebration Center</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Timing Tabs: Today / Tomorrow / This Week / All (Horizontal swipe on mobile) */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs scroll-smooth">
          <button
            onClick={() => setBirthdayFilter('today')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              birthdayFilter === 'today'
                ? 'bg-[#1A1A1A] text-white shadow-2xs'
                : 'bg-white/80 hover:bg-white text-neutral-700 border border-amber-200/60'
            }`}
          >
            <span>🎂 Today</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              birthdayFilter === 'today' ? 'bg-amber-400 text-black font-extrabold' : 'bg-amber-100 text-amber-900'
            }`}>
              {todayBirthdays.length}
            </span>
          </button>

          <button
            onClick={() => setBirthdayFilter('tomorrow')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              birthdayFilter === 'tomorrow'
                ? 'bg-[#1A1A1A] text-white shadow-2xs'
                : 'bg-white/80 hover:bg-white text-neutral-700 border border-amber-200/60'
            }`}
          >
            <span>⏰ Tomorrow</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              birthdayFilter === 'tomorrow' ? 'bg-amber-400 text-black font-extrabold' : 'bg-orange-100 text-orange-900'
            }`}>
              {tomorrowBirthdays.length}
            </span>
          </button>

          <button
            onClick={() => setBirthdayFilter('upcoming')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              birthdayFilter === 'upcoming'
                ? 'bg-[#1A1A1A] text-white shadow-2xs'
                : 'bg-white/80 hover:bg-white text-neutral-700 border border-amber-200/60'
            }`}
          >
            <span>📅 This Week</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              birthdayFilter === 'upcoming' ? 'bg-amber-400 text-black font-extrabold' : 'bg-amber-100 text-amber-900'
            }`}>
              {upcomingBirthdays.length}
            </span>
          </button>

          <button
            onClick={() => setBirthdayFilter('all')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              birthdayFilter === 'all'
                ? 'bg-[#1A1A1A] text-white shadow-2xs'
                : 'bg-white/80 hover:bg-white text-neutral-700 border border-amber-200/60'
            }`}
          >
            <span>All</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              birthdayFilter === 'all' ? 'bg-amber-400 text-black font-extrabold' : 'bg-neutral-200 text-neutral-700'
            }`}>
              {todayBirthdays.length + tomorrowBirthdays.length + upcomingBirthdays.length}
            </span>
          </button>
        </div>

        {/* Displayed Birthday Members */}
        {displayedBirthdays.length === 0 ? (
          <div className="py-6 px-4 bg-white/70 rounded-2xl border border-amber-200/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#666666]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <Gift className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-[#1A1A1A] block">
                  {birthdayFilter === 'today'
                    ? 'No Member Birthdays Today'
                    : birthdayFilter === 'tomorrow'
                    ? 'No Member Birthdays Tomorrow'
                    : 'No Upcoming Birthdays This Week'}
                </span>
                <span>
                  {birthdayFilter === 'today' && tomorrowBirthdays.length > 0
                    ? `You have ${tomorrowBirthdays.length} member celebrating tomorrow. Check the "Tomorrow" tab to view them.`
                    : 'All member birthday celebration alerts will automatically appear here.'}
                </span>
              </div>
            </div>

            {birthdayFilter === 'today' && tomorrowBirthdays.length > 0 && (
              <button
                onClick={() => setBirthdayFilter('tomorrow')}
                className="px-3 py-1.5 rounded-lg bg-orange-100 text-orange-900 font-bold text-xs hover:bg-orange-200 transition-colors shrink-0"
              >
                View Tomorrow&apos;s Birthdays ({tomorrowBirthdays.length}) →
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {displayedBirthdays.map(({ member: m, timing }) => {
              const birthYear = m.dateOfBirth ? Number(m.dateOfBirth.split('-')[0]) : (now.getFullYear() - m.age);
              const turningAge = now.getFullYear() - birthYear;
              const hasWished = wishedMemberIds[m.id];

              let badgeText = `Turning ${turningAge} Today!`;
              let badgeStyle = 'bg-amber-100 text-amber-900 border-amber-300';
              let actionLabel = 'Wish on WhatsApp';

              if (timing === 'tomorrow') {
                badgeText = `Tomorrow • Turning ${turningAge}`;
                badgeStyle = 'bg-orange-100 text-orange-900 border-orange-300';
                actionLabel = 'Advance Wish on WhatsApp';
              } else if (timing === 'upcoming') {
                badgeText = `This Week (${m.dateOfBirth ? m.dateOfBirth.slice(5) : ''}) • Turning ${turningAge}`;
                badgeStyle = 'bg-sky-100 text-sky-900 border-sky-300';
                actionLabel = 'Early Wish on WhatsApp';
              }

              return (
                <div
                  key={`${m.id}-${timing}`}
                  className="p-4 rounded-2xl bg-white border border-amber-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all hover:shadow-sm"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative shrink-0">
                      <img
                        src={m.photo}
                        alt={m.fullName}
                        className="w-12 h-12 rounded-2xl object-cover border-2 border-amber-400 shadow-xs"
                      />
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] shadow-xs">
                        {timing === 'today' ? '🎂' : timing === 'tomorrow' ? '⏰' : '📅'}
                      </div>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-[#1A1A1A] truncate">{m.fullName}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.2 rounded border shrink-0 ${badgeStyle}`}>
                          {badgeText}
                        </span>
                      </div>
                      <div className="text-xs text-[#666666] mt-0.5">
                        <span className="font-mono text-[#C41E3A] font-semibold">{m.memberId}</span> • {m.plan} Plan • {m.mobile}
                      </div>
                      <div className="text-[11px] text-emerald-700 font-medium flex items-center gap-1 mt-0.5">
                        <Gift className="w-3 h-3" />
                        <span>Perk Ready: +15 Days Free Extension Code</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSendBirthdayWish(m, timing)}
                    className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs shrink-0 flex items-center justify-center gap-1.5 active:scale-95 w-full sm:w-auto min-h-[40px] cursor-pointer ${
                      hasWished
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                        : 'bg-[#00C853] hover:bg-[#00B046] text-white'
                    }`}
                  >
                    <PartyPopper className="w-3.5 h-3.5" />
                    <span>{hasWished ? 'Wished (Resend)' : actionLabel}</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Quick Calendar Summary Strip */}
        <div className="pt-2 border-t border-amber-200/40 flex flex-wrap items-center justify-between gap-2 text-xs text-[#666666]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-[#1A1A1A] flex items-center gap-1 text-[11px] uppercase tracking-wider">
              <Calendar className="w-3.5 h-3.5 text-amber-600" />
              Calendar Glance:
            </span>
            <span className="px-2 py-0.5 rounded bg-white/80 border border-amber-200 text-[#1A1A1A] text-[11px] font-semibold">
              Today ({todayBirthdays.length})
            </span>
            <span className="px-2 py-0.5 rounded bg-white/80 border border-orange-200 text-[#1A1A1A] text-[11px] font-semibold">
              Tomorrow ({tomorrowBirthdays.length})
            </span>
            <span className="px-2 py-0.5 rounded bg-white/80 border border-amber-200 text-[#1A1A1A] text-[11px] font-semibold">
              This Week ({upcomingBirthdays.length})
            </span>
          </div>

          <span className="text-[11px] text-[#71717A]">
            Auto-calculated from athlete Date of Birth records
          </span>
        </div>
      </section>
      )}

      {/* 3. TODAY'S PRIORITIES: NEEDS YOUR ATTENTION */}
      <section className="bg-white rounded-3xl p-5 sm:p-6 border border-black/10 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-black/5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center font-bold">
              <AlertCircle className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#1A1A1A] font-serif">
                Needs Your Attention
              </h2>
              <p className="text-xs text-[#666666]">
                {attentionItems.length} operational tasks requiring immediate follow-up
              </p>
            </div>
          </div>

          {/* Category Tabs (Horizontal swipe on mobile) */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs scroll-smooth w-full sm:w-auto">
            {[
              { id: 'expired' as const, label: 'Expired', count: expiredFollowUps.length },
              { id: '3d' as const, label: '1–3 Days', count: expiring1To3Days.length },
              { id: 'today' as const, label: 'Today', count: expiringToday.length },
              { id: 'leads' as const, label: 'Admissions', count: pendingLeads.length },
              { id: 'absent' as const, label: 'Absent (>7d)', count: irregularMembers.length }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setAttentionFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-all whitespace-nowrap shrink-0 ${
                  attentionFilter === tab.id
                    ? 'bg-[#1A1A1A] text-white shadow-2xs font-bold'
                    : 'bg-[#F8F6F4] text-[#4A4A4A] hover:bg-neutral-200'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className={`ml-1.5 text-[10px] px-1.5 py-0.2 rounded-full ${
                    attentionFilter === tab.id ? 'bg-white/20 text-white' : 'bg-neutral-200 text-[#1A1A1A]'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Priority Items List */}
        {filteredAttentionList.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#666666] space-y-1">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto stroke-[1.5]" />
            <div className="font-bold text-sm text-[#1A1A1A] mt-2">All Clear in this Category</div>
            <p>No pending alerts or required actions right now.</p>
          </div>
        ) : (
          <div className="divide-y divide-black/5 max-h-[460px] overflow-y-auto pr-1">
            {filteredAttentionList.map((item) => (
              <div
                key={item.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#F8F6F4]/50 px-2 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-neutral-100 border border-black/10 flex items-center justify-center font-bold text-xs text-[#1A1A1A] shrink-0 overflow-hidden">
                    {item.member?.photo ? (
                      <img src={item.member.photo} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      item.name.slice(0, 2).toUpperCase()
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#1A1A1A] truncate">{item.name}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.badgeColor} shrink-0`}>
                        {item.badge}
                      </span>
                    </div>
                    <div className="text-xs text-[#666666] truncate mt-0.5">
                      {item.details}
                    </div>
                  </div>
                </div>

                {/* Clear Action Buttons */}
                <div className="flex items-center gap-2 shrink-0 self-stretch sm:self-auto justify-end flex-wrap pt-1 sm:pt-0">
                  {/* WhatsApp Reminder */}
                  <a
                    href={generateWhatsAppLink(
                      item.phone,
                      `Hello ${item.name}! 🙏 Reminder from Red Apple Gym CIDCO N-2 regarding your membership. Please connect with admin for renewal.`
                    )}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-1 transition-colors"
                    title="Send WhatsApp Message"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">WhatsApp</span>
                  </a>

                  {/* Primary Context Action */}
                  {item.member && (item.type === 'today' || item.type === '3d' || item.type === '7d' || item.type === 'expired') && (
                    <button
                      onClick={() => setRenewModalMember(item.member!)}
                      className="px-3.5 py-2 rounded-xl bg-[#C41E3A] hover:bg-[#8B1528] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Renew</span>
                    </button>
                  )}

                  {item.member && item.type === 'due' && (
                    <button
                      onClick={() => onNavigateTab('payments')}
                      className="px-3.5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Record Payment</span>
                    </button>
                  )}

                  {item.lead && item.type === 'lead' && (
                    <button
                      onClick={() => setReviewLead(item.lead!)}
                      className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Review Admission</span>
                    </button>
                  )}

                  {item.member && item.type === 'absent' && (
                    <button
                      onClick={() => onNavigateTab('attendance')}
                      className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Check Attendance</span>
                    </button>
                  )}

                  {/* View Profile */}
                  {item.member && (
                    <button
                      onClick={() => setProfileModalMember(item.member!)}
                      className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-[#1A1A1A] transition-colors"
                      title="View Athlete Profile"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 3. REVENUE OVERVIEW CHART */}
      <section className="bg-white rounded-3xl p-5 sm:p-6 border border-black/10 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-[#1A1A1A] font-serif">
                Revenue Overview
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                Verified Collections
              </span>
            </div>
            <p className="text-xs text-[#666666] mt-0.5">
              Total Collected: <strong className="text-[#1A1A1A] font-serif text-sm">₹{totalPeriodRevenue.toLocaleString('en-IN')}</strong> ({chartView === 'monthly' ? 'Past 6 Months' : 'Annual History'})
            </p>
          </div>

          {/* Monthly / Yearly Toggle */}
          <div className="flex items-center bg-[#F8F6F4] p-1 rounded-xl border border-black/5 text-xs">
            <button
              onClick={() => setChartView('monthly')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                chartView === 'monthly'
                  ? 'bg-white text-[#1A1A1A] shadow-2xs'
                  : 'text-[#666666] hover:text-[#1A1A1A]'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setChartView('yearly')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                chartView === 'yearly'
                  ? 'bg-white text-[#1A1A1A] shadow-2xs'
                  : 'text-[#666666] hover:text-[#1A1A1A]'
              }`}
            >
              Yearly
            </button>
          </div>
        </div>

        {/* Clean Chart Container */}
        <div className="h-64 w-full pt-4 min-w-0 overflow-hidden">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="redappleRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C41E3A" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#C41E3A" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="label"
                stroke="#8A8A8A"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#E5E5E5' }}
              />
              <YAxis
                stroke="#8A8A8A"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white border border-black/10 p-2.5 rounded-xl shadow-lg text-xs">
                        <div className="font-bold text-[#1A1A1A]">{label}</div>
                        <div className="text-[#C41E3A] font-bold font-serif text-sm mt-0.5">
                          ₹{Number(payload[0].value).toLocaleString('en-IN')}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#C41E3A"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#redappleRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Quick Renew Modal */}
      {renewModalMember && (
        <QuickRenewModal
          member={renewModalMember}
          onClose={() => setRenewModalMember(null)}
        />
      )}

      {/* Member Profile Modal */}
      {profileModalMember && (
        <MemberProfileModal
          member={profileModalMember}
          onClose={() => setProfileModalMember(null)}
        />
      )}

      {/* Review Admission Modal */}
      {reviewLead && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 border border-black/10 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-black/5">
              <div>
                <h3 className="font-bold text-base text-[#1A1A1A] font-serif">Review Admission Application</h3>
                <p className="text-xs text-[#666666]">Approve & create member profile</p>
              </div>
              <button
                onClick={() => setReviewLead(null)}
                className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-[#F8F6F4] border border-black/5 space-y-1">
                <div className="font-bold text-sm text-[#1A1A1A]">{reviewLead.fullName}</div>
                <div className="text-neutral-600 font-mono">Mobile: {reviewLead.mobile}</div>
                <div className="text-neutral-600">Fitness Target: {reviewLead.goal}</div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#1A1A1A] block mb-1">Confirm Membership Plan</label>
                <select
                  value={activatePlan}
                  onChange={(e) => {
                    const p = e.target.value as MembershipPlanType;
                    setActivatePlan(p);
                    const feeMap: Record<MembershipPlanType, number> = {
                      Monthly: 800,
                      Quarterly: 2100,
                      'Half-Yearly': 4000,
                      Annual: 7000,
                      Custom: 800
                    };
                    setActivateFee(feeMap[p] || 800);
                    setActivatePaid(feeMap[p] || 800);
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-[#F8F6F4] border border-black/10 text-xs font-semibold"
                >
                  <option value="Monthly">1 Month (₹800)</option>
                  <option value="Quarterly">3 Months (₹2,100)</option>
                  <option value="Half-Yearly">6 Months (₹4,000)</option>
                  <option value="Annual">1 Year (₹7,000)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-[#1A1A1A] block mb-1">Total Fee (₹)</label>
                  <input
                    type="number"
                    value={activateFee}
                    onChange={(e) => setActivateFee(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-[#F8F6F4] border border-black/10 text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#1A1A1A] block mb-1">Amount Paid (₹)</label>
                  <input
                    type="number"
                    value={activatePaid}
                    onChange={(e) => setActivatePaid(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-[#F8F6F4] border border-black/10 text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#1A1A1A] block mb-1">Payment Method</label>
                <select
                  value={activatePaymentMode}
                  onChange={(e) => setActivatePaymentMode(e.target.value as PaymentMode)}
                  className="w-full px-3 py-2 rounded-xl bg-[#F8F6F4] border border-black/10 text-xs font-semibold"
                >
                  <option value="UPI">UPI / GPay / PhonePe</option>
                  <option value="Cash">Cash at Desk</option>
                  <option value="Card">Debit/Credit Card</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  onClick={() => {
                    convertLeadToMember(reviewLead.id, activatePlan, undefined, activateFee, activatePaid, activatePaymentMode);
                    setReviewLead(null);
                    alert(`Athlete ${reviewLead.fullName} successfully activated!`);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-[#C41E3A] hover:bg-[#8B1528] text-white font-bold text-xs shadow-sm transition-colors"
                >
                  Confirm & Activate Member
                </button>
                <button
                  onClick={() => setReviewLead(null)}
                  className="px-4 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-[#1A1A1A] font-semibold text-xs transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
