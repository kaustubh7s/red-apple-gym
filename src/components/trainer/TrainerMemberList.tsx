'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { Member } from '@/lib/types';
import { MemberProfileModal } from '@/components/admin/MemberProfileModal';
import {
  Search,
  Users,
  Dumbbell,
  Clock,
  CheckCircle2,
  AlertTriangle,
  MessageCircle,
  Eye,
  Calendar,
  Sparkles
} from 'lucide-react';

export const TrainerMemberList: React.FC = () => {
  const { members, trainer, workoutPlans, assignWorkoutToMember, generateWhatsAppLink } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [quickFilter, setQuickFilter] = useState<'all' | '3d' | '1d' | 'expired' | 'active'>('all');
  const [selectedPlan, setSelectedPlan] = useState<string>('All');
  const [selectedMemberForProfile, setSelectedMemberForProfile] = useState<Member | null>(null);

  // Filter & Search Logic
  const filteredMembers = members.filter((m) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      m.fullName.toLowerCase().includes(q) ||
      m.memberId.toLowerCase().includes(q) ||
      m.plan.toLowerCase().includes(q) ||
      m.expiryDate.includes(q) ||
      m.remainingDaysText.toLowerCase().includes(q);

    let matchQuick = true;
    if (quickFilter === '3d') matchQuick = m.remainingDays > 0 && m.remainingDays <= 3;
    if (quickFilter === '1d') matchQuick = m.remainingDays === 1;
    if (quickFilter === 'expired') matchQuick = m.status === 'Expired' || m.remainingDays <= 0;
    if (quickFilter === 'active') matchQuick = m.status === 'Active';

    const matchPlan = selectedPlan === 'All' || m.plan === selectedPlan;

    return matchSearch && matchQuick && matchPlan;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white font-['Space_Grotesk']">
            Gym Athlete Roster & Expiry Telemetry
          </h2>
          <p className="text-xs text-neutral-400">
            {members.length} Athletes under Head Coach {trainer.fullName} • Track routine splits and membership validity
          </p>
        </div>

        <div className="text-xs font-bold text-neutral-300 bg-white/5 px-3.5 py-2 rounded-xl border border-white/10">
          Athlete Performance Roster
        </div>
      </div>

      {/* Search & Quick Filters */}
      <div className="p-4 rounded-3xl bg-[#11131A] border border-white/10 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-8 relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Athlete Name, Member ID, Plan, Expiry Date or Days Left..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-blue-400"
            />
          </div>

          <div className="sm:col-span-4">
            <select
              value={selectedPlan}
              onChange={(e) => setSelectedPlan(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-[#181A22] border border-white/10 text-xs text-white focus:outline-none focus:border-blue-400"
            >
              <option value="All">All Membership Plans</option>
              <option value="Monthly">Monthly</option>
              <option value="Quarterly">Quarterly</option>
              <option value="Half-Yearly">Half-Yearly</option>
              <option value="Annual">Annual</option>
              <option value="Custom">Custom</option>
            </select>
          </div>
        </div>

        {/* Quick Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-white/5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mr-1">
            Quick Filters:
          </span>
          {[
            { id: 'all', label: 'All Athletes' },
            { id: '3d', label: '⏳ Expiring in 3 Days' },
            { id: '1d', label: '⚡ Expiring in 1 Day' },
            { id: 'expired', label: '🔴 Expired Passes' },
            { id: 'active', label: '🟢 Active Athletes' }
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => setQuickFilter(btn.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                quickFilter === btn.id
                  ? 'bg-blue-500 text-white font-extrabold shadow-md shadow-blue-500/20'
                  : 'bg-white/5 text-neutral-300 hover:bg-white/10 border border-white/5'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Athletes Table (Strictly Non-Financial) */}
      <div className="rounded-3xl bg-[#11131A] border border-white/10 overflow-hidden shadow-2xl">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#151824] text-neutral-400 uppercase text-[10px] font-extrabold tracking-wider border-b border-white/10">
              <tr>
                <th className="p-4">Athlete / ID</th>
                <th className="p-4">Category</th>
                <th className="p-4">Membership Plan</th>
                <th className="p-4">Join Date</th>
                <th className="p-4">Expiry Date</th>
                <th className="p-4">Remaining Days</th>
                <th className="p-4">Attendance</th>
                <th className="p-4">Active Routine Split</th>
                <th className="p-4 text-right">Coach Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-12 text-center text-neutral-500">
                    No athletes found matching your search.
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => {
                  const assignedWorkout = workoutPlans.find((w) => w.id === member.assignedWorkoutId);

                  return (
                    <tr key={member.id} className="hover:bg-white/[0.02] transition-colors">
                      {/* Athlete */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={member.photo}
                            alt={member.fullName}
                            className="w-10 h-10 rounded-xl object-cover border border-white/10"
                          />
                          <div>
                            <div
                              onClick={() => setSelectedMemberForProfile(member)}
                              className="font-extrabold text-white text-sm font-['Space_Grotesk'] hover:text-[#00F59B] cursor-pointer"
                            >
                              {member.fullName}
                            </div>
                            <div className="text-[11px] text-blue-400 font-mono font-bold">
                              {member.memberId}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="p-4 font-semibold text-neutral-300">
                        {member.category || 'Gym Only'}
                      </td>

                      {/* Plan */}
                      <td className="p-4 font-semibold text-white">
                        {member.plan}
                      </td>

                      {/* Join Date */}
                      <td className="p-4 font-mono text-neutral-400">
                        {member.joinDate}
                      </td>

                      {/* Expiry Date */}
                      <td className="p-4 font-mono font-extrabold text-white">
                        {member.expiryDate}
                      </td>

                      {/* Remaining Days Countdown */}
                      <td className="p-4">
                        <span
                          className={`font-black font-mono text-xs px-2.5 py-1 rounded-lg inline-block ${
                            member.status === 'Expired'
                              ? 'bg-rose-500/20 text-rose-400'
                              : member.status === 'Expiring Soon'
                              ? 'bg-amber-400/20 text-amber-400'
                              : 'bg-emerald-500/20 text-[#00F59B]'
                          }`}
                        >
                          {member.remainingDaysText}
                        </span>
                      </td>

                      {/* Attendance */}
                      <td className="p-4 font-mono font-bold text-sky-400">
                        {member.attendancePercentage}%
                      </td>

                      {/* Active Routine */}
                      <td className="p-4">
                        <select
                          value={member.assignedWorkoutId || ''}
                          onChange={(e) => assignWorkoutToMember(member.id, e.target.value)}
                          className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white max-w-[150px] truncate outline-none focus:border-blue-400"
                        >
                          <option value="" className="bg-[#181A22]">Assign Routine Split</option>
                          {workoutPlans.map((w) => (
                            <option key={w.id} value={w.id} className="bg-[#181A22]">
                              {w.title}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <button
                          onClick={() => setSelectedMemberForProfile(member)}
                          title="View Athlete Profile"
                          className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white transition-colors text-xs font-semibold inline-flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Profile</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View: Clean Athlete Cards (Strictly No Contact Details) */}
        <div className="md:hidden divide-y divide-white/10">
          {filteredMembers.length === 0 ? (
            <div className="p-8 text-center text-neutral-500 text-xs">
              No athletes found matching your search.
            </div>
          ) : (
            filteredMembers.map((member) => (
              <div key={member.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={member.photo}
                      alt={member.fullName}
                      className="w-10 h-10 rounded-xl object-cover border border-white/10 shrink-0"
                    />
                    <div className="min-w-0">
                      <div
                        onClick={() => setSelectedMemberForProfile(member)}
                        className="font-extrabold text-white text-sm font-['Space_Grotesk'] truncate hover:text-[#00F59B] cursor-pointer"
                      >
                        {member.fullName}
                      </div>
                      <div className="text-[11px] text-neutral-400 font-mono">
                        {member.memberId} &bull; {member.category || 'Gym Only'}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`font-mono font-bold text-[10px] px-2 py-0.5 rounded shrink-0 ${
                      member.status === 'Expired'
                        ? 'bg-rose-500/20 text-rose-400'
                        : member.status === 'Expiring Soon'
                        ? 'bg-amber-400/20 text-amber-400'
                        : 'bg-emerald-500/20 text-[#00F59B]'
                    }`}
                  >
                    {member.remainingDaysText}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-neutral-400 bg-white/5 px-3 py-2 rounded-xl">
                  <span>Plan: <strong className="text-white">{member.plan}</strong></span>
                  <span className="text-sky-400 font-bold">Attendance: {member.attendancePercentage}%</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedMemberForProfile(member)}
                    className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-200 border border-white/10 text-xs font-bold flex items-center justify-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Athlete Profile</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {selectedMemberForProfile && (
        <MemberProfileModal
          member={selectedMemberForProfile}
          onClose={() => setSelectedMemberForProfile(null)}
          hideContactDetails={true}
        />
      )}
    </div>
  );
};

