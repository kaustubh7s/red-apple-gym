'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { AdminSidebar, AdminTab } from '@/components/admin/AdminSidebar';
import { AdminNavbar } from '@/components/admin/AdminNavbar';
import { DashboardOverview } from '@/components/admin/DashboardOverview';
import { RenewalAlertCenter } from '@/components/admin/RenewalAlertCenter';
import { MemberManagement } from '@/components/admin/MemberManagement';
import { AdmissionManagement } from '@/components/admin/AdmissionManagement';
import { WhatsAppAutomation } from '@/components/admin/WhatsAppAutomation';
import { PaymentManagement } from '@/components/admin/PaymentManagement';
import { AttendanceManagement } from '@/components/admin/AttendanceManagement';
import { RevenueAnalytics } from '@/components/admin/RevenueAnalytics';
import { ReportsExport } from '@/components/admin/ReportsExport';
import { SettingsManagement } from '@/components/admin/SettingsManagement';
import { BirthdayCelebrationCenter } from '@/components/admin/BirthdayCelebrationCenter';
import { AdminMobileNav } from '@/components/admin/AdminMobileNav';
import { AuthLockScreen } from '@/components/common/AuthLockScreen';
import {
  getStoredCentralLicense,
  performDailyHeartbeat,
  verifyActiveLicenseLive,
  isFeatureEnabled,
  CentralLicense
} from '@/lib/centralLicenseService';
import { CentralLicenseLockScreen } from '@/components/common/CentralLicenseLockScreen';
import { FeatureGateNotice } from '@/components/common/FeatureGateNotice';

export default function AdminPage() {
  const { isAdminAuthenticated, loginAdmin, logoutAdmin, recordAdminActivity } = useApp();
  const [currentTab, setCurrentTab] = useState<AdminTab>('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isTimedOut, setIsTimedOut] = useState(false);

  // Central Neon Licensing Protection Guard
  const [centralLicense, setCentralLicense] = useState<CentralLicense | null>(null);
  const [licenseLoaded, setLicenseLoaded] = useState(false);
  const [isLicenseSuspended, setIsLicenseSuspended] = useState(false);

  // Live real-time licensing heartbeat against central Neon DB (immediate + every 4s)
  React.useEffect(() => {
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

  // Quick Action Triggers
  const [openAddMemberModal, setOpenAddMemberModal] = useState(false);

  const handleOpenAddMember = () => {
    setCurrentTab('members');
    setOpenAddMemberModal(true);
  };

  const handleOpenQuickCheckIn = () => {
    setCurrentTab('attendance');
  };

  // Activity Tracker & Auto-Lock Timer (15 Minutes Inactivity Window)
  React.useEffect(() => {
    if (!isAdminAuthenticated || typeof window === 'undefined') return;

    const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes
    let lastActivityTracked = Date.now();

    const handleUserInteraction = () => {
      const now = Date.now();
      if (now - lastActivityTracked > 10000) {
        lastActivityTracked = now;
        recordAdminActivity();
      }
    };

    window.addEventListener('mousemove', handleUserInteraction);
    window.addEventListener('keydown', handleUserInteraction);
    window.addEventListener('click', handleUserInteraction);
    window.addEventListener('touchstart', handleUserInteraction);
    window.addEventListener('scroll', handleUserInteraction);

    // Periodically verify session validity (Strict 15m inactivity auto-lock)
    const sessionInterval = setInterval(() => {
      const savedTime = localStorage.getItem('redapple_admin_session_time');
      if (!savedTime || Date.now() - Number(savedTime) >= INACTIVITY_TIMEOUT_MS) {
        setIsTimedOut(true);
        logoutAdmin();
      }
    }, 10000);

    return () => {
      window.removeEventListener('mousemove', handleUserInteraction);
      window.removeEventListener('keydown', handleUserInteraction);
      window.removeEventListener('click', handleUserInteraction);
      window.removeEventListener('touchstart', handleUserInteraction);
      window.removeEventListener('scroll', handleUserInteraction);
      clearInterval(sessionInterval);
    };
  }, [isAdminAuthenticated, logoutAdmin, recordAdminActivity]);

  // Remember this device as Admin for instant PWA direct routing
  React.useEffect(() => {
    if (isAdminAuthenticated && typeof window !== 'undefined') {
      try {
        localStorage.setItem('redapple_device_role', 'admin');
        setIsTimedOut(false);
      } catch (e) {
        console.warn('Could not save admin role to localStorage:', e);
      }
    }
  }, [isAdminAuthenticated]);

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

  // If not logged in, render the secure lock screen
  if (!isAdminAuthenticated) {
    return (
      <AuthLockScreen
        portalType="admin"
        title="Admin Operations Login"
        subtitle="Protected administrative area. Enter your master administrative password to unlock gym operations."
        onLogin={async (pass) => {
          const ok = await loginAdmin(pass);
          if (ok) setIsTimedOut(false);
          return ok;
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F6F4] text-[#1A1A1A] flex selection:bg-[#C41E3A] selection:text-white pb-28 lg:pb-0 overflow-x-hidden w-full max-w-full">
      {/* Desktop & Tablet Sidebar */}
      <AdminSidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
      />

      {/* Main Administrative Work Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0 w-full max-w-full overflow-x-hidden">
        {/* Top Navbar */}
        <AdminNavbar
          currentTab={currentTab}
          onOpenMobileMenu={() => setMobileSidebarOpen(true)}
          onQuickAddMember={handleOpenAddMember}
          onNavigateTab={(tab) => setCurrentTab(tab)}
        />

        {/* Dynamic Admin Workspace */}
        <main className="flex-1 p-3 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-x-hidden">
          {currentTab === 'overview' && (
            <DashboardOverview
              onNavigateTab={(tab) => setCurrentTab(tab)}
              onOpenAddMember={handleOpenAddMember}
              onOpenQuickCheckIn={handleOpenQuickCheckIn}
            />
          )}

          {currentTab === 'renewals' && (
            isFeatureEnabled('gym_members', centralLicense) ? (
              <RenewalAlertCenter />
            ) : (
              <FeatureGateNotice featureName="Renewal Alert Center" featureKey="gym_members" />
            )
          )}

          {currentTab === 'birthdays' && (
            isFeatureEnabled('gym_members', centralLicense) ? (
              <BirthdayCelebrationCenter />
            ) : (
              <FeatureGateNotice featureName="Birthday Celebrations" featureKey="gym_members" />
            )
          )}

          {currentTab === 'members' && (
            isFeatureEnabled('gym_members', centralLicense) ? (
              <MemberManagement initialAddOpen={openAddMemberModal} />
            ) : (
              <FeatureGateNotice featureName="Member Management" featureKey="gym_members" />
            )
          )}

          {currentTab === 'admissions' && (
            isFeatureEnabled('gym_members', centralLicense) ? (
              <AdmissionManagement />
            ) : (
              <FeatureGateNotice featureName="Admission Pipeline" featureKey="gym_members" />
            )
          )}

          {currentTab === 'whatsapp' && (
            isFeatureEnabled('gym_members', centralLicense) ? (
              <WhatsAppAutomation />
            ) : (
              <FeatureGateNotice featureName="WhatsApp Automation" featureKey="gym_members" />
            )
          )}

          {currentTab === 'payments' && (
            isFeatureEnabled('gym_billing', centralLicense) ? (
              <PaymentManagement />
            ) : (
              <FeatureGateNotice featureName="Payments & Dues" featureKey="gym_billing" />
            )
          )}

          {currentTab === 'attendance' && (
            isFeatureEnabled('gym_checkin', centralLicense) ? (
              <AttendanceManagement />
            ) : (
              <FeatureGateNotice featureName="Attendance Kiosk" featureKey="gym_checkin" />
            )
          )}

          {currentTab === 'analytics' && (
            isFeatureEnabled('gym_billing', centralLicense) ? (
              <RevenueAnalytics />
            ) : (
              <FeatureGateNotice featureName="Revenue Analytics" featureKey="gym_billing" />
            )
          )}

          {currentTab === 'reports' && <ReportsExport />}

          {currentTab === 'settings' && <SettingsManagement />}
        </main>
      </div>

      {/* Dedicated Sticky Mobile Bottom Navigation Bar */}
      <AdminMobileNav
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onQuickAddMember={handleOpenAddMember}
        onQuickCheckIn={handleOpenQuickCheckIn}
      />
    </div>
  );
}

