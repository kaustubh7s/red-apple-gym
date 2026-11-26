'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import {
  LayoutDashboard,
  Users,
  Dumbbell,
  Activity,
  Share2,
  ExternalLink,
  ShieldCheck,
  Award,
  Clock,
  UserPlus,
  QrCode
} from 'lucide-react';

export type TrainerTab =
  | 'overview'
  | 'clients'
  | 'attendance'
  | 'workouts'
  | 'fitness'
  | 'progress'
  | 'admissions'
  | 'referrals';

interface TrainerSidebarProps {
  currentTab: TrainerTab;
  setCurrentTab: (tab: TrainerTab) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const TrainerSidebar: React.FC<TrainerSidebarProps> = ({
  currentTab,
  setCurrentTab,
  mobileOpen,
  setMobileOpen
}) => {
  const { trainer, members, attendanceRecords } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];
  const todayCheckedInCount = attendanceRecords.filter((a) => a.date === todayStr).length;

  const navItems: { id: TrainerTab; label: string; icon: any; badge?: string }[] = [
    { id: 'overview', label: 'Coach Overview', icon: LayoutDashboard },
    { id: 'clients', label: 'Athlete Clients', icon: Users, badge: `${members.length}` },
    { id: 'attendance', label: 'Scan & Punch In', icon: QrCode, badge: `${todayCheckedInCount} today` },
    { id: 'workouts', label: 'Workout Protocols', icon: Dumbbell },
    { id: 'fitness', label: 'Biometrics Lab', icon: Activity },
    { id: 'admissions', label: 'Intake & Referrals', icon: UserPlus }
  ];

  const handleSelect = (tab: TrainerTab) => {
    setCurrentTab(tab);
    setMobileOpen(false);
  };

  return (
    <>
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-xs"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-black/10 flex flex-col justify-between transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 sm:p-5 border-b border-black/5">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white p-0.5 shadow-sm border border-blue-200 overflow-hidden flex items-center justify-center shrink-0">
              <img
                src="/images/logo.png"
                alt="Red Apple Gym and Fitness Center"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs tracking-tight text-[#1A1A1A] font-serif">
                  RED APPLE GYM
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                  COACH
                </span>
              </div>
              <span className="text-[9px] text-[#8A8A8A] block -mt-0.5 font-semibold uppercase">
                AND FITNESS CENTER • CIDCO N-2
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Items */}
        <div className="p-3 space-y-1 overflow-y-auto flex-1">
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-[#8A8A8A]">
            Coaching &amp; Performance
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white font-bold shadow-sm shadow-blue-500/20'
                    : 'text-[#4A4A4A] hover:text-[#1A1A1A] hover:bg-neutral-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-blue-600'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && !isActive && (
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-neutral-100 text-[#4A4A4A]">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Coach Profile Card & Fast Switcher */}
        <div className="p-4 border-t border-black/5 space-y-3 bg-[#F8F6F4]">
          <div className="p-2.5 rounded-xl bg-white border border-black/5 flex items-center gap-3 shadow-2xs">
            <img
              src={trainer.photo}
              alt={trainer.fullName}
              className="w-9 h-9 rounded-full object-cover border-2 border-[#D4A574]"
            />
            <div className="truncate">
              <div className="text-xs font-bold text-[#1A1A1A] truncate">{trainer.fullName}</div>
              <div className="text-[10px] text-blue-700 font-semibold">Head Master Coach</div>
            </div>
          </div>

          {/* Quick links */}
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <Link
              href="/admin"
              className="px-2 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-[#C41E3A] font-semibold text-center truncate border border-rose-200"
            >
              Admin Hub
            </Link>
            <Link
              href="/"
              className="px-2 py-1.5 rounded-lg bg-white hover:bg-neutral-100 text-[#1A1A1A] font-semibold text-center truncate border border-black/10 flex items-center justify-center gap-1 shadow-2xs"
            >
              <span>Public</span>
              <ExternalLink className="w-3 h-3 text-[#8A8A8A]" />
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
};
