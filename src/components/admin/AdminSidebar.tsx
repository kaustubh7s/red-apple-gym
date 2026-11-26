'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import { getStoredCentralLicense, CentralLicense, isFeatureEnabled, performDailyHeartbeat } from '@/lib/centralLicenseService';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  CalendarCheck,
  MessageSquare,
  FileSpreadsheet,
  Clock,
  UserPlus,
  Dumbbell,
  Settings,
  ExternalLink,
  ChevronRight,
  Cake,
  LogOut
} from 'lucide-react';

export type AdminTab =
  | 'overview'
  | 'members'
  | 'renewals'
  | 'birthdays'
  | 'admissions'
  | 'payments'
  | 'attendance'
  | 'whatsapp'
  | 'reports'
  | 'settings'
  | 'analytics';

interface AdminSidebarProps {
  currentTab: AdminTab;
  setCurrentTab: (tab: AdminTab) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentTab,
  setCurrentTab,
  mobileOpen,
  setMobileOpen
}) => {
  const { members, leads, payments, logoutAdmin } = useApp();
  const [centralLicense, setCentralLicense] = useState<CentralLicense | null>(null);

  useEffect(() => {
    setCentralLicense(getStoredCentralLicense());
    // Force sync from Neon DB on mount so admin toggles reflect instantly
    performDailyHeartbeat(true).then((res) => {
      if (res.license) setCentralLicense(res.license);
    }).catch(() => {});
  }, []);

  const isKioskAllowed = centralLicense ? isFeatureEnabled('gym_kiosk', centralLicense) : false;
  const isTrainerAllowed = centralLicense ? isFeatureEnabled('gym_trainer', centralLicense) : false;

  const urgentRenewalsCount = members.filter((m) => m.remainingDays <= 7).length;
  const pendingLeadsCount = leads.filter((l) => l.status === 'Pending').length;
  const pendingPaymentsCount = members.filter((m) => m.dueAmount > 0).length;

  const now = new Date();
  const todayMMDD = `${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowMMDD = `${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;

  const thisWeekDates: string[] = [];
  for (let i = 2; i <= 7; i++) {
    const future = new Date(now);
    future.setDate(future.getDate() + i);
    thisWeekDates.push(`${String(future.getMonth() + 1).padStart(2, '0')}-${String(future.getDate()).padStart(2, '0')}`);
  }

  const todayBirthdaysCount = members.filter((m) => {
    if (!m.dateOfBirth) return false;
    const parts = m.dateOfBirth.split('-');
    return parts.length === 3 && `${parts[1]}-${parts[2]}` === todayMMDD;
  }).length;

  const tomorrowBirthdaysCount = members.filter((m) => {
    if (!m.dateOfBirth) return false;
    const parts = m.dateOfBirth.split('-');
    return parts.length === 3 && `${parts[1]}-${parts[2]}` === tomorrowMMDD;
  }).length;

  const thisWeekBirthdaysCount = members.filter((m) => {
    if (!m.dateOfBirth) return false;
    const parts = m.dateOfBirth.split('-');
    return parts.length === 3 && thisWeekDates.includes(`${parts[1]}-${parts[2]}`);
  }).length;

  const navItems: {
    id: AdminTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
    badgeColor?: string;
  }[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: LayoutDashboard,
      badge: todayBirthdaysCount > 0 ? `🎂 ${todayBirthdaysCount}` : tomorrowBirthdaysCount > 0 ? `⏰ ${tomorrowBirthdaysCount}` : undefined,
      badgeColor: todayBirthdaysCount > 0 ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-orange-100 text-orange-900'
    },
    {
      id: 'members',
      label: 'Members',
      icon: Users,
      badge: `${members.length}`,
      badgeColor: 'bg-neutral-100 text-[#4A4A4A]'
    },
    {
      id: 'renewals',
      label: 'Renewals',
      icon: Clock,
      badge: urgentRenewalsCount > 0 ? `${urgentRenewalsCount}` : undefined,
      badgeColor: 'bg-rose-50 text-[#C41E3A] border border-rose-200'
    },
    {
      id: 'birthdays',
      label: 'Birthdays',
      icon: Cake,
      badge: todayBirthdaysCount > 0 ? `${todayBirthdaysCount} Today!` : tomorrowBirthdaysCount > 0 ? `${tomorrowBirthdaysCount} Tmrw` : undefined,
      badgeColor: todayBirthdaysCount > 0 ? 'bg-amber-100 text-amber-900 border border-amber-300 font-bold animate-pulse' : 'bg-orange-100 text-orange-900'
    },
    {
      id: 'admissions',
      label: 'Admissions',
      icon: UserPlus,
      badge: pendingLeadsCount > 0 ? `${pendingLeadsCount}` : undefined,
      badgeColor: 'bg-amber-50 text-amber-800 border border-amber-200'
    },
    {
      id: 'payments',
      label: 'Payments',
      icon: CreditCard,
      badge: pendingPaymentsCount > 0 ? `${pendingPaymentsCount}` : undefined,
      badgeColor: 'bg-rose-50 text-[#C41E3A] border border-rose-200'
    },
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      icon: MessageSquare,
      badge: 'Auto',
      badgeColor: 'bg-emerald-50 text-emerald-700'
    },
    { id: 'reports', label: 'Reports', icon: FileSpreadsheet },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const handleSelect = (tab: AdminTab) => {
    setCurrentTab(tab);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-black/10 flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 sm:p-5 border-b border-black/5">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl bg-white p-0.5 shadow-sm border border-[#D4A574]/40 overflow-hidden flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <img
                src="/images/logo.png"
                alt="Red Apple Gym and Fitness Center"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm tracking-tight text-[#1A1A1A] font-serif truncate">
                  RED APPLE GYM
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#D4A574]/20 text-[#8B1528] border border-[#D4A574]/40 uppercase tracking-wider shrink-0">
                  ADMIN
                </span>
              </div>
              <span className="text-[10px] text-[#666666] block truncate font-semibold uppercase">
                AND FITNESS CENTER • CIDCO N-2
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1 overflow-y-auto flex-1">
          <div className="px-3 pt-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-[#8A8A8A]">
            Management
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
                    ? 'bg-[#C41E3A] text-white font-bold shadow-sm shadow-[#C41E3A]/25'
                    : 'text-[#4A4A4A] hover:text-[#1A1A1A] hover:bg-neutral-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-[#C41E3A]'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-white/20 text-white' : item.badgeColor || 'bg-neutral-100 text-[#4A4A4A]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer: User Profile & Portal Links */}
        <div className="p-4 border-t border-black/5 space-y-3 bg-[#F8F6F4]">
          {/* Executive Admin Profile */}
          <div className="p-2.5 rounded-xl bg-white border border-black/5 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[#C41E3A]/10 text-[#C41E3A] flex items-center justify-center font-bold text-xs shrink-0">
                EA
              </div>
              <div className="truncate">
                <div className="text-xs font-bold text-[#1A1A1A] truncate">Executive Admin</div>
                <div className="text-[10px] text-[#666666] truncate">CIDCO N-2 Operations</div>
              </div>
            </div>
          </div>

          {/* Central License Status Indicator */}
          {centralLicense && (
            <div className="p-2 rounded-xl bg-white border border-black/5 flex items-center justify-between shadow-2xs text-[10px]">
              <span className="flex items-center gap-1.5 text-neutral-700 font-semibold truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span className="truncate">{centralLicense.client_name}</span>
              </span>
              <span className="font-mono text-neutral-500 uppercase font-bold text-[9px] px-1.5 py-0.5 rounded bg-neutral-100 shrink-0">
                {centralLicense.tier}
              </span>
            </div>
          )}

          {/* Lock / Logout Session */}
          <button
            type="button"
            onClick={() => {
              if (confirm('Lock Admin Operations and log out?')) {
                logoutAdmin();
              }
            }}
            className="w-full py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-[#C41E3A] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Lock &amp; Logout Session</span>
          </button>

          {/* Portal Switcher - Only shown if enabled in Central License */}
          {(isTrainerAllowed || isKioskAllowed) && (
            <div className={`grid ${isTrainerAllowed && isKioskAllowed ? 'grid-cols-2' : 'grid-cols-1'} gap-2 text-[11px]`}>
              {isTrainerAllowed && (
                <Link
                  href="/trainer"
                  className="px-2 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-center truncate border border-blue-200 transition-colors"
                >
                  Coach Portal
                </Link>
              )}
              {isKioskAllowed && (
                <Link
                  href="/kiosk"
                  className="px-2 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold text-center truncate border border-amber-200 transition-colors"
                >
                  Reception Kiosk
                </Link>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
