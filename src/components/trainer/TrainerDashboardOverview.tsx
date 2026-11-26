'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { TrainerTab } from './TrainerSidebar';
import { MemberProfileModal } from '@/components/admin/MemberProfileModal';
import { Member } from '@/lib/types';
import {
  Users,
  UserCheck,
  CalendarCheck,
  Dumbbell,
  Clock,
  Sparkles,
  TrendingUp,
  ArrowRight,
  Activity,
  Award,
  AlertTriangle,
  MessageCircle,
  QrCode
} from 'lucide-react';

interface TrainerDashboardOverviewProps {
  onNavigateTab: (tab: TrainerTab) => void;
}

export const TrainerDashboardOverview: React.FC<TrainerDashboardOverviewProps> = ({
  onNavigateTab
}) => {
  const { trainer, members, workoutPlans, fitnessMeasurements, attendanceRecords, generateWhatsAppLink } = useApp();
  const [profileMember, setProfileMember] = useState<Member | null>(null);

  // Scoped Non-Financial Metrics (All members belong to sole trainer)
  const totalGymAthletes = members.length;
  const activeGymAthletes = members.filter((m) => m.status === 'Active').length;
  const expiringSoonCount = members.filter((m) => m.remainingDays > 0 && m.remainingDays <= 3).length;
  const expiredCount = members.filter((m) => m.status === 'Expired' || m.remainingDays <= 0).length;

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAttendanceCount = attendanceRecords.filter((a) => a.date === todayStr).length;

  const coachMetrics = [
    {
      title: 'Total Athletes Coached',
      value: totalGymAthletes,
      subtitle: 'All gym athletes under your guidance',
      icon: Users,
      color: 'text-white',
      border: 'border-white/10',
      bg: 'bg-white/5',
      tab: 'clients' as TrainerTab
    },
    {
      title: 'Active Training Passes',
      value: activeGymAthletes,
      subtitle: `${Math.round((activeGymAthletes / (totalGymAthletes || 1)) * 100)}% active attendance compliance`,
      icon: UserCheck,
      color: 'text-[#00F59B]',
      border: 'border-[#00F59B]/30',
      bg: 'bg-[#00F59B]/10',
      tab: 'clients' as TrainerTab
    },
    {
      title: 'Expiring in ≤ 3 Days',
      value: expiringSoonCount,
      subtitle: 'Remind athletes during workout',
      icon: Clock,
      color: 'text-amber-400',
      border: 'border-amber-500/30',
      bg: 'bg-amber-500/10',
      tab: 'clients' as TrainerTab
    },
    {
      title: 'Today Floor Check-Ins',
      value: `${todayAttendanceCount} Checked-In`,
      subtitle: 'Recorded at front kiosk today',
      icon: CalendarCheck,
      color: 'text-sky-400',
      border: 'border-sky-500/30',
      bg: 'bg-sky-500/10',
      tab: 'clients' as TrainerTab
    }
  ];

  // Members requiring renewal (<= 3 days)
  const upcomingExpiryMembers = members
    .filter((m) => m.remainingDays > 0 && m.remainingDays <= 3)
    .sort((a, b) => a.remainingDays - b.remainingDays);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Coach Hero Welcome Banner */}
      <div className="p-5 sm:p-7 lg:p-8 rounded-3xl bg-gradient-to-r from-[#141824] via-[#0E1017] to-[#0A0B10] border border-white/10 shadow-2xl relative overflow-hidden flex flex-col xl:flex-row items-start xl:items-center justify-between gap-5 sm:gap-6">
        <div className="flex items-center gap-4 sm:gap-5 min-w-0">
          <img
            src={trainer.photo}
            alt={trainer.fullName}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-[#00F59B] shadow-xl shrink-0"
          />
          <div className="min-w-0">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#00F59B]/10 border border-[#00F59B]/20 text-[#00F59B] text-[10px] sm:text-[11px] font-bold uppercase truncate max-w-full">
              <Award className="w-3 h-3 shrink-0" />
              <span className="truncate">Head Master Coach &amp; Biomechanics Lead</span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white font-['Space_Grotesk'] mt-1 truncate">
              Welcome Coach, {trainer.fullName.split(' ')[0]}!
            </h1>
            <p className="text-xs text-neutral-400 line-clamp-2 sm:line-clamp-none">
              All athletes in the facility train under your master program. Monitor expiry dates and biometrics.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 w-full xl:w-auto xl:flex xl:items-center shrink-0">
          <button
            onClick={() => onNavigateTab('attendance')}
            className="px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-xl bg-blue-600 hover:brightness-110 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 cursor-pointer whitespace-nowrap transition-all active:scale-95"
          >
            <QrCode className="w-4 h-4 shrink-0" />
            <span>Scan &amp; Punch</span>
          </button>
          <button
            onClick={() => onNavigateTab('workouts')}
            className="px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-white/10 whitespace-nowrap transition-all active:scale-95"
          >
            <Dumbbell className="w-4 h-4 shrink-0" />
            <span>New Routine</span>
          </button>
          <button
            onClick={() => onNavigateTab('admissions')}
            className="px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-xl bg-[#00F59B] text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:brightness-110 shadow-lg shadow-[#00F59B]/20 whitespace-nowrap transition-all active:scale-95"
          >
            <Sparkles className="w-4 h-4 shrink-0 text-black" />
            <span>Share Link</span>
          </button>
        </div>
      </div>

      {/* 4 Coach Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {coachMetrics.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              onClick={() => onNavigateTab(card.tab)}
              className="p-5 rounded-2xl bg-[#11131A] border border-white/10 hover:border-white/20 transition-all cursor-pointer group flex flex-col justify-between shadow-lg"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 group-hover:text-neutral-200">
                  {card.title}
                </span>
                <div className={`w-8 h-8 rounded-lg ${card.bg} ${card.border} border flex items-center justify-center ${card.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div>
                <div className={`text-2xl font-extrabold font-['Space_Grotesk'] ${card.color}`}>
                  {card.value}
                </div>
                <div className="text-[11px] text-neutral-500 mt-1 font-medium flex items-center justify-between">
                  <span>{card.subtitle}</span>
                  <ArrowRight className="w-3 h-3 text-neutral-600 group-hover:text-white transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Athlete Roster & Expiry Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Athletes Table Snapshot */}
        <div className="lg:col-span-8 p-6 sm:p-8 rounded-3xl bg-[#11131A] border border-white/10 shadow-2xl space-y-5">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div>
              <h3 className="text-base font-bold text-white font-['Space_Grotesk']">
                Active Athlete Roster & Expiry Countdown
              </h3>
              <p className="text-xs text-neutral-400">
                Live remaining days countdown for every athlete.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('clients')}
              className="text-xs font-bold text-[#00F59B] hover:text-white flex items-center gap-1"
            >
              <span>View All ({members.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#151824] text-neutral-400 uppercase text-[10px] font-extrabold tracking-wider border-b border-white/10">
                <tr>
                  <th className="p-3">Athlete</th>
                  <th className="p-3">Plan</th>
                  <th className="p-3">Join Date</th>
                  <th className="p-3">Expiry Date</th>
                  <th className="p-3">Remaining Days</th>
                  <th className="p-3">Attendance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {members.slice(0, 6).map((m) => (
                  <tr key={m.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-3">
                      <div
                        onClick={() => setProfileMember(m)}
                        className="font-bold text-white hover:text-[#00F59B] cursor-pointer flex items-center gap-2"
                      >
                        <img src={m.photo} alt={m.fullName} className="w-6 h-6 rounded-md object-cover" />
                        <span>{m.fullName}</span>
                      </div>
                    </td>
                    <td className="p-3 text-neutral-300 font-semibold">{m.plan}</td>
                    <td className="p-3 font-mono text-neutral-400">{m.joinDate}</td>
                    <td className="p-3 font-mono font-bold text-white">{m.expiryDate}</td>
                    <td className="p-3">
                      <span
                        className={`font-mono font-bold text-xs px-2 py-0.5 rounded ${
                          m.remainingDays <= 0
                            ? 'bg-rose-500/20 text-rose-400'
                            : m.remainingDays <= 7
                            ? 'bg-amber-400/20 text-amber-400'
                            : 'bg-emerald-500/20 text-[#00F59B]'
                        }`}
                      >
                        {m.remainingDaysText}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-sky-400 font-bold">{m.attendancePercentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-white/10 -mx-2">
            {members.slice(0, 6).map((m) => (
              <div
                key={m.id}
                onClick={() => setProfileMember(m)}
                className="p-3.5 space-y-2 cursor-pointer active:bg-white/5 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img src={m.photo} alt={m.fullName} className="w-8 h-8 rounded-lg object-cover shrink-0" />
                    <div className="min-w-0">
                      <div className="font-bold text-white text-sm truncate">{m.fullName}</div>
                      <div className="text-[11px] text-neutral-400">{m.plan}</div>
                    </div>
                  </div>
                  <span
                    className={`font-mono font-bold text-[10px] px-2 py-0.5 rounded shrink-0 ${
                      m.remainingDays <= 0
                        ? 'bg-rose-500/20 text-rose-400'
                        : m.remainingDays <= 7
                        ? 'bg-amber-400/20 text-amber-400'
                        : 'bg-emerald-500/20 text-[#00F59B]'
                    }`}
                  >
                    {m.remainingDaysText}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-neutral-400 font-mono pt-1">
                  <span>Expires: <strong className="text-white">{m.expiryDate}</strong></span>
                  <span className="text-sky-400 font-bold">Attendance: {m.attendancePercentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Urgent Renewal List for Coach */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-[#11131A] border border-white/10 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white font-['Space_Grotesk']">
                Expiry Alerts (≤ 3 Days)
              </h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-400/15 text-amber-400">
              {upcomingExpiryMembers.length} Alerts
            </span>
          </div>

          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {upcomingExpiryMembers.length === 0 ? (
              <div className="text-center py-6 text-xs text-neutral-500">
                No memberships expiring in next 3 days.
              </div>
            ) : (
              upcomingExpiryMembers.map((m) => (
                <div key={m.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white text-xs">{m.fullName}</div>
                    <div className="text-[10px] font-mono text-amber-400 font-bold">
                      {m.remainingDaysText} ({m.expiryDate})
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {profileMember && (
        <MemberProfileModal
          member={profileMember}
          onClose={() => setProfileMember(null)}
          hideContactDetails={true}
        />
      )}
    </div>
  );
};
