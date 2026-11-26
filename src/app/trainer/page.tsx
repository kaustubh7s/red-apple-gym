'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import { TrainerSidebar, TrainerTab } from '@/components/trainer/TrainerSidebar';
import { TrainerDashboardOverview } from '@/components/trainer/TrainerDashboardOverview';
import { TrainerMemberList } from '@/components/trainer/TrainerMemberList';
import { WorkoutManagement } from '@/components/trainer/WorkoutManagement';
import { FitnessProgressTracking } from '@/components/trainer/FitnessProgressTracking';
import { TrainerAdmission } from '@/components/trainer/TrainerAdmission';
import { TrainerAttendancePunch } from '@/components/trainer/TrainerAttendancePunch';
import { Menu, Dumbbell, UserCheck, Bell, LogOut, ShieldCheck, QrCode } from 'lucide-react';
import { AuthLockScreen } from '@/components/common/AuthLockScreen';
import {
  getStoredCentralLicense,
  performDailyHeartbeat,
  verifyActiveLicenseLive,
  CentralLicense
} from '@/lib/centralLicenseService';
import { CentralLicenseLockScreen } from '@/components/common/CentralLicenseLockScreen';

export default function TrainerPortalPage() {
  const {
    trainer,
    notifications,
    markNotificationRead,
    logoutTrainer,
    isTrainerAuthenticated,
    isAdminAuthenticated,
    loginTrainer
  } = useApp();
  const [currentTab, setCurrentTab] = useState<TrainerTab>('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [manualLocked, setManualLocked] = useState(false);

  // Central License Guard
  const [centralLicense, setCentralLicense] = useState<CentralLicense | null>(null);
  const [licenseLoaded, setLicenseLoaded] = useState(false);
  const [isLicenseSuspended, setIsLicenseSuspended] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const checkLive = async () => {
      const stored = getStoredCentralLicense();
      if (!stored || !stored.key) {
        if (!isMounted) return;
        setCentralLicense(null);
        setIsLicenseSuspended(false);
        setLicenseLoaded(true);
        return;
      }

      const res = await verifyActiveLicenseLive();
      if (!isMounted) return;

      if (res.isSuspended || res.isDeleted || !res.license || res.license.status !== 'active') {
        setCentralLicense(res.license || { ...stored, status: 'suspended' });
        setIsLicenseSuspended(true);
        setLicenseLoaded(true);
      } else {
        setCentralLicense(res.license);
        setIsLicenseSuspended(false);
        setLicenseLoaded(true);
      }
    };

    // Immediate live check on mount
    checkLive();

    // Fast 4-second live polling interval
    const interval = setInterval(checkLive, 4000);

    // Instant re-check on tab focus / visibility
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        checkLive();
      }
    };
    window.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', checkLive);

    return () => {
      isMounted = false;
      clearInterval(interval);
      window.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', checkLive);
    };
  }, []);

  // Remember this device role for instant PWA direct routing
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('redapple_device_role', 'trainer');
      } catch (e) {
        console.warn('Could not save trainer role to localStorage:', e);
      }
    }
  }, []);

  // Scoped notifications for this trainer
  const trainerNotifs = notifications.filter(
    (n) => n.targetRole === 'all' || n.targetRole === 'trainer'
  );
  const unreadCount = trainerNotifs.filter((n) => !n.read).length;

  // 1. Central License Guard: Fast live loading screen
  if (!licenseLoaded) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-6 text-white selection:bg-[#C41E3A]">
        <div className="w-12 h-12 rounded-full border-4 border-red-500/20 border-t-red-500 animate-spin mb-4" />
        <p className="text-sm font-semibold tracking-wide uppercase text-neutral-300">Verifying Central License Registry...</p>
        <p className="text-xs text-neutral-500 mt-1">Neon Cloud Guard</p>
      </div>
    );
  }

  // 1b. Central License Guard: 1st-Time Activation Lock Screen or Suspended Lock Screen
  if (!centralLicense || centralLicense.status !== 'active' || isLicenseSuspended) {
    return (
      <CentralLicenseLockScreen
        isSuspendedMode={isLicenseSuspended || centralLicense?.status === 'suspended'}
        suspendedLicense={centralLicense}
        onActivated={(newLic) => {
          setCentralLicense(newLic);
          setIsLicenseSuspended(false);
        }}
        onRetryHeartbeat={async () => {
          const res = await verifyActiveLicenseLive();
          if (res.active && res.license) {
            setCentralLicense(res.license);
            setIsLicenseSuspended(false);
          }
        }}
      />
    );
  }

  // Authorization Lock Gate - Coach portal strictly requires trainer floor credentials
  if (!isTrainerAuthenticated || manualLocked) {
    return (
      <AuthLockScreen
        portalType="trainer"
        title="Coach Portal Access"
        subtitle={`Please enter the access password for Head Coach ${trainer?.fullName || 'Mohaseen'} (${trainer?.trainerId || 'TR-101'}) to unlock floor operations.`}
        onLogin={async (pass) => {
          const ok = await loginTrainer(pass);
          if (ok) setManualLocked(false);
          return ok;
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F6F4] text-[#1A1A1A] flex selection:bg-blue-600 selection:text-white pb-20 lg:pb-0">
      {/* Trainer Scoped Sidebar */}
      <TrainerSidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
      />

      {/* Main Trainer View Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xl border-b border-black/10 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-neutral-100 border border-black/10 text-[#1A1A1A]"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A] font-serif">
                Coach Portal • {trainer?.fullName}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Direct Switch to Admin Desk */}
            <Link
              href="/admin"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-900 hover:bg-black text-white text-xs font-bold shadow-xs transition-all active:scale-95"
              title="Direct Switch to Admin Operations"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#D4A574]" />
              <span className="hidden sm:inline">Admin Desk</span>
            </Link>

            {/* Quick Scan & Punch In */}
            <button
              onClick={() => setCurrentTab('attendance')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
                currentTab === 'attendance'
                  ? 'bg-blue-700 text-white shadow-sm'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
              title="Scan Card & Punch In Athlete"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Punch In</span>
            </button>

            {/* Quick Create Routine */}
            <button
              onClick={() => setCurrentTab('workouts')}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all"
            >
              <Dumbbell className="w-3.5 h-3.5" />
              <span>Prescribe Routine</span>
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 border border-black/5 text-[#1A1A1A] relative transition-colors"
                title="Coach Alerts"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-600 text-white font-bold text-[9px] flex items-center justify-center border border-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Dropdown */}
              {notifOpen && (
                <div
                  className="absolute right-0 mt-2 w-80 rounded-2xl bg-white border border-black/10 shadow-xl p-4 z-50 animate-in fade-in zoom-in-95 duration-200"
                  onMouseLeave={() => setNotifOpen(false)}
                >
                  <div className="flex items-center justify-between pb-3 border-b border-black/5 mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
                      Coach Alerts
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                      {unreadCount} New
                    </span>
                  </div>

                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {trainerNotifs.length === 0 ? (
                      <div className="text-center py-6 text-xs text-neutral-400">
                        No alerts for coach.
                      </div>
                    ) : (
                      trainerNotifs.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => markNotificationRead(notif.id)}
                          className={`p-3 rounded-xl border text-xs transition-all cursor-pointer ${
                            notif.read
                              ? 'bg-[#F8F6F4] border-black/5 text-neutral-500'
                              : 'bg-white border-blue-200 text-[#1A1A1A] shadow-xs'
                          }`}
                        >
                          <div className="font-bold">{notif.title}</div>
                          <p className="text-[11px] text-[#666666] mt-0.5">{notif.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Lock / Logout Session */}
            <button
              onClick={() => {
                if (confirm('Lock Coach Portal and log out?')) {
                  logoutTrainer();
                  setManualLocked(true);
                }
              }}
              title="Lock Coach Portal & Logout"
              className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Tab Body */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {currentTab === 'overview' && (
            <TrainerDashboardOverview onNavigateTab={(tab) => setCurrentTab(tab)} />
          )}

          {currentTab === 'clients' && <TrainerMemberList />}

          {currentTab === 'attendance' && <TrainerAttendancePunch />}

          {currentTab === 'workouts' && <WorkoutManagement />}

          {(currentTab === 'fitness' || currentTab === 'progress') && <FitnessProgressTracking />}

          {(currentTab === 'admissions' || currentTab === 'referrals') && <TrainerAdmission />}
        </main>
      </div>
    </div>
  );
}
