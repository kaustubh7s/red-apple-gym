'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useApp } from '@/lib/store';
import { Member } from '@/lib/types';
import { AdminTab } from './AdminSidebar';
import { MemberProfileModal } from './MemberProfileModal';
import { MemberIdCardModal } from './MemberIdCardModal';
import { SecuritySettingsModal } from './SecuritySettingsModal';
import { calculateDaysAbsent } from '@/lib/dateUtils';
import {
  Bell,
  Search,
  Menu,
  Plus,
  Trash2,
  LogOut,
  Settings,
  Phone,
  MessageCircle,
  Eye,
  X,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface AdminNavbarProps {
  currentTab: AdminTab;
  onOpenMobileMenu: () => void;
  onQuickAddMember: () => void;
  onNavigateTab?: (tab: AdminTab) => void;
}

const TAB_TITLES: Record<AdminTab, { title: string; subtitle: string }> = {
  overview: { title: 'Executive Overview', subtitle: 'Live business & membership telemetry' },
  members: { title: 'Member Directory', subtitle: 'Manage active athletes, expiry dates & profiles' },
  renewals: { title: 'Renewal Alert Center', subtitle: 'Operational expiry tracker & WhatsApp follow-ups' },
  birthdays: { title: 'Birthday Celebrations & Perks', subtitle: 'Daily birthday alerts, renewal perks & 1-click WhatsApp automation' },
  admissions: { title: 'Admission Pipeline', subtitle: 'Incoming online applications & lead conversions' },
  payments: { title: 'Payments & Dues', subtitle: 'Financial collections, dues ledger & invoices' },
  attendance: { title: 'Attendance Kiosk', subtitle: 'Front desk check-in & member attendance tracking' },
  whatsapp: { title: 'WhatsApp Automation', subtitle: 'Automated renewal & greeting dispatch' },
  reports: { title: 'Reports & Export', subtitle: 'Download audit registers & member sheets' },
  settings: { title: 'Gym Settings', subtitle: 'Security passwords, backup & system parameters' },
  analytics: { title: 'Revenue Analytics', subtitle: 'Monthly collection trends & growth metrics' }
};

export const AdminNavbar: React.FC<AdminNavbarProps> = ({
  currentTab,
  onOpenMobileMenu,
  onQuickAddMember,
  onNavigateTab
}) => {
  const {
    notifications,
    markNotificationRead,
    clearAllNotifications,
    members,
    attendanceRecords,
    logoutAdmin,
    generateWhatsAppLink
  } = useApp();

  // Real-time irregular members detection (> 7 days absent)
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
      .filter((item) => item.daysAbsent > 7);
  }, [members, attendanceRecords]);

  // Notification Drawer
  const [notifOpen, setNotifOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;
  const totalAlertCount = unreadCount + irregularMembers.length;

  // Profile Menu Dropdown
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  // Security Modal
  const [securityModalOpen, setSecurityModalOpen] = useState(false);

  // Instant Member Search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [selectedMemberProfile, setSelectedMemberProfile] = useState<Member | null>(null);
  const [selectedMemberPass, setSelectedMemberPass] = useState<Member | null>(null);

  const searchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Click outside listener for dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchRef.current && !searchRef.current.contains(e.target as Node) &&
        mobileSearchRef.current && !mobileSearchRef.current.contains(e.target as Node)
      ) {
        setSearchFocused(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchResults = searchQuery.trim().length >= 2
    ? members.filter((m) => {
        const q = searchQuery.toLowerCase().trim();
        const cleanMobile = m.mobile.replace(/\D/g, '');
        const cleanQ = q.replace(/\D/g, '');
        return (
          m.fullName.toLowerCase().includes(q) ||
          m.memberId.toLowerCase().includes(q) ||
          (cleanQ && cleanMobile.includes(cleanQ)) ||
          m.mobile.includes(q) ||
          m.plan.toLowerCase().includes(q)
        );
      })
    : [];

  const tabInfo = TAB_TITLES[currentTab] || { title: 'Admin Workspace', subtitle: 'Red Apple Gym' };

  const renderSearchResults = () => {
    if (!searchFocused || searchQuery.trim().length < 2) return null;

    return (
      <div className="absolute left-0 right-0 mt-2 bg-white border border-black/10 rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150 max-h-80 overflow-y-auto">
        <div className="p-2.5 bg-[#F8F6F4] border-b border-black/5 text-[11px] font-bold text-[#8B1528] uppercase tracking-wider flex items-center justify-between">
          <span>Matching Members ({searchResults.length})</span>
          <span className="text-[10px] text-neutral-500 font-normal">Click to view</span>
        </div>

        {searchResults.length === 0 ? (
          <div className="p-6 text-center text-xs text-[#666666]">
            No members found matching &quot;{searchQuery}&quot;.
          </div>
        ) : (
          <div className="divide-y divide-black/5">
            {searchResults.map((m) => (
              <div
                key={m.id}
                className="p-3 hover:bg-neutral-50 transition-colors flex items-center justify-between gap-3 text-xs"
              >
                <div
                  onClick={() => {
                    setSelectedMemberProfile(m);
                    setSearchFocused(false);
                    setMobileSearchOpen(false);
                  }}
                  className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0"
                >
                  <div className="w-9 h-9 rounded-full bg-neutral-100 border border-black/10 flex items-center justify-center font-bold text-xs text-[#1A1A1A] shrink-0 overflow-hidden">
                    {m.photo ? (
                      <img src={m.photo} alt={m.fullName} className="w-full h-full object-cover" />
                    ) : (
                      m.fullName.slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-[#1A1A1A] truncate hover:text-[#C41E3A]">
                      {m.fullName}
                    </div>
                    <div className="text-[10px] text-neutral-500 flex items-center gap-1.5 flex-wrap">
                      <span className="font-mono text-[#8B1528] font-bold">{m.memberId}</span>
                      <span>•</span>
                      <span className="font-mono">{m.mobile}</span>
                      <span className="hidden sm:inline">•</span>
                      <span className="hidden sm:inline">{m.plan}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      m.status === 'Active'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : m.status === 'Expiring Soon'
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}
                  >
                    {m.remainingDaysText}
                  </span>

                  <a
                    href={generateWhatsAppLink(
                      m.whatsapp,
                      `Hello ${m.fullName}! 🙏 Greetings from Red Apple Gym CIDCO N-2 regarding your membership.`
                    )}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors"
                    title="WhatsApp Member"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                  </a>

                  <button
                    onClick={() => {
                      setSelectedMemberPass(m);
                      setSearchFocused(false);
                      setMobileSearchOpen(false);
                    }}
                    className="p-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-[#1A1A1A] transition-colors"
                    title="View Digital Pass"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xl border-b border-black/10 px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-3 shadow-2xs">
        {/* Left: Mobile Toggle & Page Title */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 min-w-0">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-xl bg-neutral-100 border border-black/10 text-[#1A1A1A] hover:bg-neutral-200 transition-colors shrink-0"
            title="Open Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <h1 className="text-sm sm:text-lg font-bold text-[#1A1A1A] tracking-tight font-serif leading-tight truncate">
              {tabInfo.title}
            </h1>
            <p className="hidden md:block text-[11px] text-[#666666] leading-none mt-0.5">
              {tabInfo.subtitle}
            </p>
          </div>
        </div>

        {/* Center: Desktop Instant Member Search */}
        <div ref={searchRef} className="hidden sm:block flex-1 max-w-md relative mx-2">
          <div className="relative">
            <Search className="w-4 h-4 text-[#C41E3A] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSearchFocused(true);
              }}
              onFocus={() => setSearchFocused(true)}
              placeholder="Search member by name, ID or mobile..."
              className="w-full pl-10 pr-9 py-2 rounded-xl bg-[#F8F6F4] border border-black/10 hover:border-black/20 text-[#1A1A1A] text-xs placeholder:text-neutral-400 outline-none focus:border-[#C41E3A] focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-[#1A1A1A]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Desktop Search Results Dropdown */}
          {renderSearchResults()}
        </div>

        {/* Right: Primary CTA, Notifications, Profile Dropdown */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Mobile Search Toggle Button */}
          <button
            onClick={() => {
              setMobileSearchOpen(!mobileSearchOpen);
              setSearchFocused(!mobileSearchOpen);
            }}
            className={`sm:hidden p-2 rounded-xl border transition-colors ${
              mobileSearchOpen
                ? 'bg-[#C41E3A]/10 border-[#C41E3A]/30 text-[#C41E3A]'
                : 'bg-neutral-100 hover:bg-neutral-200 border-black/10 text-[#1A1A1A]'
            }`}
            title="Search Members"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Primary + Add Member Button */}
          <button
            onClick={onQuickAddMember}
            className="flex items-center gap-1.5 p-2 sm:px-3.5 sm:py-2 rounded-xl bg-[#C41E3A] hover:bg-[#8B1528] text-white text-xs font-bold shadow-sm transition-all active:scale-95"
            title="Register New Athlete"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">Add Member</span>
          </button>

          {/* Notifications Center */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 border border-black/5 text-[#1A1A1A] relative transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {totalAlertCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#C41E3A] text-white font-bold text-[9px] flex items-center justify-center border border-white">
                  {totalAlertCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {notifOpen && (
              <div
                className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-black/10 shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150"
                onMouseLeave={() => setNotifOpen(false)}
              >
                <div className="flex items-center justify-between pb-3 border-b border-black/5 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
                      Notifications
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#C41E3A]/10 text-[#C41E3A]">
                      {totalAlertCount} Alert{totalAlertCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                  {notifications.length > 0 && (
                    <button
                      onClick={clearAllNotifications}
                      className="text-[11px] text-neutral-500 hover:text-rose-600 flex items-center gap-1 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Clear All</span>
                    </button>
                  )}
                </div>

                {/* Irregular Members Direct Alert Banner */}
                {irregularMembers.length > 0 && (
                  <div
                    onClick={() => {
                      onNavigateTab?.('attendance');
                      setNotifOpen(false);
                    }}
                    className="p-3 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100/90 transition-all cursor-pointer shadow-2xs mb-3 group"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Irregular Member Alert ({irregularMembers.length})</span>
                      </div>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-200 text-amber-900 shrink-0">
                        &gt;7 Days Absent
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-800 mt-1 leading-relaxed">
                      {irregularMembers.length === 1
                        ? `${irregularMembers[0].member.fullName} (${irregularMembers[0].member.memberId}) has not checked in for ${irregularMembers[0].daysAbsent} days.`
                        : `${irregularMembers[0].member.fullName} and ${irregularMembers.length - 1} other athlete(s) haven't visited in over 7 days.`}
                    </p>
                    <span className="inline-block mt-1.5 text-[10px] font-bold text-[#C41E3A] group-hover:underline">
                      View in Attendance Kiosk →
                    </span>
                  </div>
                )}

                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {notifications.length === 0 && irregularMembers.length === 0 ? (
                    <div className="text-center py-8 text-xs text-neutral-400">
                      No new notifications.
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => markNotificationRead(notif.id)}
                        className={`p-3 rounded-xl border text-xs transition-all cursor-pointer ${
                          notif.read
                            ? 'bg-[#F8F6F4] border-black/5 text-neutral-500'
                            : 'bg-white border-[#C41E3A]/30 text-[#1A1A1A] shadow-2xs'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-bold text-xs text-[#1A1A1A]">{notif.title}</span>
                          <span className="text-[10px] text-neutral-400 whitespace-nowrap">
                            {notif.timestamp}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#4A4A4A] mt-1 leading-relaxed">
                          {notif.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Menu */}
          <div ref={profileRef} className="relative">
            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 border border-black/5 text-[#1A1A1A] transition-colors"
              title="Owner Profile Menu"
            >
              <div className="w-6 h-6 rounded-lg bg-[#C41E3A] text-white flex items-center justify-center font-bold text-[10px]">
                EA
              </div>
              <span className="hidden md:inline text-xs font-semibold text-[#1A1A1A]">
                Admin
              </span>
            </button>

            {/* Profile Dropdown */}
            {profileMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-black/10 shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150 text-xs">
                <div className="px-3 py-2.5 border-b border-black/5 mb-1">
                  <div className="font-bold text-[#1A1A1A]">Executive Admin</div>
                  <div className="text-[10px] text-[#666666]">Red Apple Gym • CIDCO N-2</div>
                </div>

                {onNavigateTab && (
                  <button
                    onClick={() => {
                      onNavigateTab('settings');
                      setProfileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-neutral-100 text-[#1A1A1A] transition-colors"
                  >
                    <Settings className="w-3.5 h-3.5 text-[#C41E3A]" />
                    <span>Gym Settings</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setSecurityModalOpen(true);
                    setProfileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-neutral-100 text-[#1A1A1A] transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>Security & Passwords</span>
                </button>

                <div className="my-1 border-t border-black/5" />

                <button
                  onClick={() => {
                    setProfileMenuOpen(false);
                    if (confirm('Lock Admin Dashboard and log out?')) {
                      logoutAdmin();
                    }
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-rose-50 text-rose-700 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>

          {/* Visible Direct Lock / Logout Button */}
          <button
            onClick={() => {
              if (confirm('Lock Admin Operations and log out?')) {
                logoutAdmin();
              }
            }}
            className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-[#C41E3A] border border-rose-200/80 text-xs font-bold transition-all active:scale-95 shadow-2xs cursor-pointer"
            title="Lock Operations & Logout"
          >
            <LogOut className="w-4 h-4 text-[#C41E3A]" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Mobile Instant Search Expandable Bar */}
      {mobileSearchOpen && (
        <div
          ref={mobileSearchRef}
          className="sm:hidden sticky top-[53px] z-20 bg-white/98 backdrop-blur-xl border-b border-black/10 px-3 py-2 shadow-md animate-in slide-in-from-top-2 duration-150 relative"
        >
          <div className="relative flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#C41E3A] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSearchFocused(true);
                }}
                onFocus={() => setSearchFocused(true)}
                placeholder="Search member by name, ID or mobile..."
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#F8F6F4] border border-black/10 text-xs text-[#1A1A1A] placeholder:text-neutral-400 outline-none focus:border-[#C41E3A] focus:bg-white transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-[#1A1A1A]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <button
              onClick={() => {
                setMobileSearchOpen(false);
                setSearchFocused(false);
              }}
              className="px-2.5 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-xs font-semibold text-[#1A1A1A] shrink-0"
            >
              Cancel
            </button>
          </div>

          {/* Mobile Search Results Dropdown */}
          {renderSearchResults()}
        </div>
      )}

      {/* Profile Modal */}
      {selectedMemberProfile && (
        <MemberProfileModal
          member={selectedMemberProfile}
          onClose={() => setSelectedMemberProfile(null)}
        />
      )}

      {/* ID Pass Modal */}
      {selectedMemberPass && (
        <MemberIdCardModal
          member={selectedMemberPass}
          onClose={() => setSelectedMemberPass(null)}
        />
      )}

      {/* Security Settings Modal */}
      <SecuritySettingsModal
        isOpen={securityModalOpen}
        onClose={() => setSecurityModalOpen(false)}
      />
    </>
  );
};
