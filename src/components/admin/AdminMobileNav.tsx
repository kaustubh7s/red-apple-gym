'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import { AdminTab } from './AdminSidebar';
import {
  LayoutDashboard,
  Clock,
  Users,
  MessageSquare,
  Plus,
  Sparkles,
  CreditCard,
  CalendarCheck,
  BarChart3,
  FileSpreadsheet,
  X,
  ChevronRight,
  ShieldCheck,
  Home,
  QrCode,
  Cake,
  LogOut
} from 'lucide-react';

interface AdminMobileNavProps {
  currentTab: AdminTab;
  setCurrentTab: (tab: AdminTab) => void;
  onQuickAddMember: () => void;
  onQuickCheckIn: () => void;
}

export const AdminMobileNav: React.FC<AdminMobileNavProps> = ({
  currentTab,
  setCurrentTab,
  onQuickAddMember,
  onQuickCheckIn
}) => {
  const { members, leads, logoutAdmin } = useApp();
  const [moreDrawerOpen, setMoreDrawerOpen] = useState(false);

  const urgentCount = members.filter((m) => m.remainingDays <= 7).length;
  const pendingLeadsCount = leads.filter((l) => l.status === 'Pending').length;

  const handleSelectTab = (tab: AdminTab) => {
    setCurrentTab(tab);
    setMoreDrawerOpen(false);
  };

  const moreItems: { id: AdminTab; label: string; icon: any; badge?: string; badgeColor?: string; desc: string }[] = [
    { id: 'birthdays', label: 'Birthdays', icon: Cake, badge: 'Celebrations', badgeColor: 'bg-amber-100 text-amber-900', desc: '1-click WhatsApp wish with +15 days perk' },
    { id: 'admissions', label: 'Admissions', icon: Sparkles, badge: pendingLeadsCount > 0 ? `${pendingLeadsCount} New` : undefined, badgeColor: 'bg-rose-50 text-[#C41E3A]', desc: 'New online registrations' },
    { id: 'payments', label: 'Payments', icon: CreditCard, desc: 'Collections & pending dues' },
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck, desc: 'Member check-in terminal' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, desc: 'Monthly revenue & collection metrics' },
    { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare, badge: 'Auto', badgeColor: 'bg-emerald-50 text-emerald-800', desc: 'Renewal & greeting alerts' },
    { id: 'reports', label: 'Reports', icon: FileSpreadsheet, desc: 'Export sheets & member rosters' },
    { id: 'settings', label: 'Settings', icon: X, desc: 'Security passwords & gym profile' }
  ];

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {moreDrawerOpen && (
        <div
          onClick={() => setMoreDrawerOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 lg:hidden animate-in fade-in duration-200"
        />
      )}

      {/* Mobile "More" Bottom Sheet Drawer */}
      {moreDrawerOpen && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-black/10 rounded-t-3xl p-5 shadow-2xl lg:hidden max-h-[80vh] overflow-y-auto space-y-4 animate-in slide-in-from-bottom duration-300 pb-12 text-[#1A1A1A]">
          <div className="flex items-center justify-between border-b border-black/5 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#C41E3A]" />
              <h3 className="font-bold text-[#1A1A1A] text-base font-serif">
                Executive Tools
              </h3>
            </div>
            <button
              onClick={() => setMoreDrawerOpen(false)}
              className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-[#1A1A1A]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {moreItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  className={`p-3.5 rounded-2xl flex items-center justify-between text-left transition-all ${
                    isActive
                      ? 'bg-[#C41E3A]/10 border border-[#C41E3A]/30 text-[#8B1528]'
                      : 'bg-[#F8F6F4] hover:bg-neutral-100 border border-black/5 text-[#1A1A1A]'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isActive ? 'bg-[#C41E3A] text-white' : 'bg-white text-[#C41E3A] shadow-2xs'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-[#1A1A1A] flex items-center gap-2 font-serif">
                        <span>{item.label}</span>
                        {item.badge && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.badgeColor}`}>
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-[#666666]">{item.desc}</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-400" />
                </button>
              );
            })}
          </div>

          {/* Direct Logout Button in Drawer */}
          <button
            onClick={() => {
              setMoreDrawerOpen(false);
              if (confirm('Lock Admin Operations and log out?')) {
                logoutAdmin();
              }
            }}
            className="w-full py-2.5 px-4 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
          >
            <LogOut className="w-4 h-4" />
            <span>Lock &amp; Logout Admin Session</span>
          </button>

          <div className="pt-3 border-t border-black/5 flex items-center justify-between text-xs">
            <Link
              href="/"
              className="text-[#666666] hover:text-[#1A1A1A] flex items-center gap-1.5 py-2"
            >
              <Home className="w-4 h-4 text-[#C41E3A]" />
              <span>Back to Website</span>
            </Link>

            <Link
              href="/trainer"
              className="text-[#8B1528] hover:underline font-bold flex items-center gap-1 py-2"
            >
              <span>Coach Portal →</span>
            </Link>
          </div>
        </div>
      )}

      {/* Fixed Ergonomic Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-black/10 lg:hidden px-2 pt-1.5 pb-[max(0.6rem,env(safe-area-inset-bottom))] shadow-lg">
        <div className="max-w-md mx-auto flex items-center justify-between">
          {/* 1: Overview */}
          <button
            onClick={() => handleSelectTab('overview')}
            className={`flex flex-col items-center justify-center flex-1 py-1.5 min-h-[48px] rounded-xl transition-colors ${
              currentTab === 'overview' ? 'text-[#C41E3A] font-bold' : 'text-neutral-500 hover:text-[#1A1A1A]'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px] mt-1 leading-none">Overview</span>
          </button>

          {/* 2: Renewals */}
          <button
            onClick={() => handleSelectTab('renewals')}
            className={`flex flex-col items-center justify-center flex-1 py-1.5 min-h-[48px] rounded-xl relative transition-colors ${
              currentTab === 'renewals' ? 'text-[#C41E3A] font-bold' : 'text-neutral-500 hover:text-[#1A1A1A]'
            }`}
          >
            <div className="relative">
              <Clock className="w-5 h-5" />
              {urgentCount > 0 && (
                <span className="absolute -top-1.5 -right-2.5 px-1.5 py-0.2 min-w-[16px] text-center text-[9px] font-bold bg-[#C41E3A] text-white rounded-full">
                  {urgentCount}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-1 leading-none">Renewals</span>
          </button>

          {/* 3: Raised Center Quick Add Button */}
          <div className="flex-1 flex justify-center -mt-6">
            <button
              onClick={onQuickAddMember}
              className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#C41E3A] to-[#8B1528] text-white flex items-center justify-center shadow-md shadow-[#C41E3A]/30 hover:scale-105 active:scale-95 transition-all border-4 border-[#F8F6F4]"
              title="Add New Member"
            >
              <Plus className="w-6 h-6 stroke-[2.5]" />
            </button>
          </div>

          {/* 4: Members */}
          <button
            onClick={() => handleSelectTab('members')}
            className={`flex flex-col items-center justify-center flex-1 py-1.5 min-h-[48px] rounded-xl transition-colors ${
              currentTab === 'members' ? 'text-[#C41E3A] font-bold' : 'text-neutral-500 hover:text-[#1A1A1A]'
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="text-[10px] mt-1 leading-none">Members</span>
          </button>

          {/* 5: More Drawer */}
          <button
            onClick={() => setMoreDrawerOpen(true)}
            className={`flex flex-col items-center justify-center flex-1 py-1.5 min-h-[48px] rounded-xl transition-colors ${
              ['birthdays', 'admissions', 'attendance', 'payments', 'analytics', 'reports', 'whatsapp', 'settings'].includes(currentTab)
                ? 'text-[#C41E3A] font-bold'
                : 'text-neutral-500 hover:text-[#1A1A1A]'
            }`}
          >
            <div className="relative">
              <MessageSquare className="w-5 h-5" />
              {pendingLeadsCount > 0 && (
                <span className="absolute -top-1.5 -right-2 w-2.5 h-2.5 bg-[#C41E3A] rounded-full animate-ping" />
              )}
            </div>
            <span className="text-[10px] mt-1 leading-none">More</span>
          </button>
        </div>
      </nav>
    </>
  );
};
