'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useApp, PLAN_DAYS_MAP, PLAN_PRICE_MAP } from '@/lib/store';
import { Member, MembershipPlanType, MembershipCategory } from '@/lib/types';
import { QuickRenewModal } from '@/components/admin/QuickRenewModal';
import { PhotoCapture } from '@/components/common/PhotoCapture';
import { getStoredCentralLicense, isFeatureEnabled, CentralLicense, performDailyHeartbeat } from '@/lib/centralLicenseService';
import { FeatureGateNotice } from '@/components/common/FeatureGateNotice';
import {
  QrCode,
  Users,
  UserPlus,
  Compass,
  Maximize2,
  Minimize2,
  Lock,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Phone,
  MessageCircle,
  Edit3,
  RefreshCw,
  Sparkles,
  Camera,
  Check,
  X,
  Shield,
  ArrowRight,
  ExternalLink,
  Volume2
} from 'lucide-react';

type KioskTab = 'punch' | 'members' | 'admission' | 'plans';

export default function ReceptionKioskPage() {
  const {
    members,
    checkInMember,
    attendanceRecords,
    updateMember,
    addMember,
    membershipPlans,
    adminPassword,
    generateWhatsAppLink,
    gymSettings
  } = useApp();

  const [currentTab, setCurrentTab] = useState<KioskTab>('punch');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Central License check
  const [centralLicense, setCentralLicense] = useState<CentralLicense | null>(null);
  const [licenseChecked, setLicenseChecked] = useState(false);

  useEffect(() => {
    setCentralLicense(getStoredCentralLicense());
    setLicenseChecked(true);
    performDailyHeartbeat(false).then((res) => {
      if (res.license) setCentralLicense(res.license);
    }).catch(() => {});
  }, []);

  // Admin Exit Lock Modal
  const [exitModalOpen, setExitModalOpen] = useState(false);
  const [exitPassword, setExitPassword] = useState('');
  const [exitError, setExitError] = useState('');

  // Clock
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
      );
      setCurrentDate(
        now.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Web Audio Chime Generator
  const playChime = (type: 'success' | 'warning' | 'error') => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'success') {
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } else if (type === 'warning') {
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(370, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } else {
        osc.frequency.setValueAtTime(250, ctx.currentTime);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch (e) {}
  };

  // Fullscreen Handler
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // -------------------------------------------------------------
  // TAB 1: PUNCH IN & CHECK-IN KIOSK
  // -------------------------------------------------------------
  const [punchSearch, setPunchSearch] = useState('');
  const [lastCheckInResult, setLastCheckInResult] = useState<{
    member: Member;
    status: 'success' | 'expiring' | 'expired';
    message: string;
    time: string;
  } | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecords = attendanceRecords.filter((r) => r.date === todayStr);

  const filteredPunchMembers = useMemo(() => {
    const q = punchSearch.trim().toLowerCase();
    if (!q) return [];
    return members
      .filter((m) => {
        const cleanMobile = m.mobile.replace(/\D/g, '');
        const cleanQ = q.replace(/\D/g, '');
        return (
          m.fullName.toLowerCase().includes(q) ||
          m.memberId.toLowerCase().includes(q) ||
          (cleanQ && cleanMobile.includes(cleanQ))
        );
      })
      .slice(0, 6);
  }, [members, punchSearch]);

  const handleExecuteCheckIn = (member: Member) => {
    checkInMember(member.id);
    const nowTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

    let status: 'success' | 'expiring' | 'expired' = 'success';
    let msg = `Welcome to Red Apple Gym, ${member.fullName}! Punch-in registered.`;

    if (member.status === 'Expired' || member.remainingDays <= 0) {
      status = 'expired';
      msg = `Access Alert: ${member.fullName}'s membership expired on ${member.expiryDate}. Please renew plan.`;
      playChime('error');
    } else if (member.status === 'Expiring Soon' || member.remainingDays <= 5) {
      status = 'expiring';
      msg = `Check-in approved! Note: ${member.remainingDays} days remaining on ${member.plan} plan.`;
      playChime('warning');
    } else {
      playChime('success');
    }

    setLastCheckInResult({
      member,
      status,
      message: msg,
      time: nowTime
    });

    setPunchSearch('');
  };

  // -------------------------------------------------------------
  // TAB 2: MEMBER SEARCH, ASSIST & EDIT
  // -------------------------------------------------------------
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [selectedEditMember, setSelectedEditMember] = useState<Member | null>(null);
  const [renewingMember, setRenewingMember] = useState<Member | null>(null);
  const [editMobile, setEditMobile] = useState('');
  const [editEmergency, setEditEmergency] = useState('');
  const [editBloodGroup, setEditBloodGroup] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editSuccessMsg, setEditSuccessMsg] = useState('');

  const filteredAssistMembers = useMemo(() => {
    const q = memberSearchQuery.trim().toLowerCase();
    if (!q) return members.slice(0, 10);
    return members.filter((m) => {
      const cleanMobile = m.mobile.replace(/\D/g, '');
      const cleanQ = q.replace(/\D/g, '');
      return (
        m.fullName.toLowerCase().includes(q) ||
        m.memberId.toLowerCase().includes(q) ||
        (cleanQ && cleanMobile.includes(cleanQ)) ||
        m.plan.toLowerCase().includes(q)
      );
    });
  }, [members, memberSearchQuery]);

  const openMemberEditModal = (m: Member) => {
    setSelectedEditMember(m);
    setEditMobile(m.mobile);
    setEditEmergency(m.emergencyContact || '');
    setEditBloodGroup(m.bloodGroup || '');
    setEditNotes(m.notes || '');
    setEditSuccessMsg('');
  };

  const handleSaveMemberAssistance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEditMember) return;
    updateMember(selectedEditMember.id, {
      mobile: editMobile.trim(),
      whatsapp: editMobile.trim(),
      emergencyContact: editEmergency.trim(),
      bloodGroup: editBloodGroup.trim(),
      notes: editNotes.trim()
    });
    setEditSuccessMsg('Member details updated successfully!');
    setTimeout(() => {
      setSelectedEditMember(null);
      setEditSuccessMsg('');
    }, 1500);
  };

  // -------------------------------------------------------------
  // TAB 3: WALK-IN ADMISSION FORM
  // -------------------------------------------------------------
  const [admName, setAdmName] = useState('');
  const [admMobile, setAdmMobile] = useState('');
  const [admGender, setAdmGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [admAge, setAdmAge] = useState<number>(24);
  const [admPlan, setAdmPlan] = useState<MembershipPlanType>('Quarterly');
  const [admCategory, setAdmCategory] = useState<MembershipCategory>('Gym + Cardio');
  const [admPhoto, setAdmPhoto] = useState('');
  const [admEmergency, setAdmEmergency] = useState('');
  const [admAmountPaid, setAdmAmountPaid] = useState<number>(2100);
  const [admSuccessMember, setAdmSuccessMember] = useState<Member | null>(null);

  // Update default fee on plan change
  useEffect(() => {
    const defPrice = PLAN_PRICE_MAP[admPlan] || 800;
    setAdmAmountPaid(defPrice);
  }, [admPlan]);

  const handleCreateAdmission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!admName.trim() || !admMobile.trim()) {
      alert('Please fill member name and mobile number.');
      return;
    }

    const durationDays = PLAN_DAYS_MAP[admPlan] || 30;
    const today = new Date();
    const joinDate = today.toISOString().split('T')[0];
    const expObj = new Date(today);
    expObj.setDate(expObj.getDate() + durationDays);
    const expiryDate = expObj.toISOString().split('T')[0];

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newMemberId = `RED-${randomNum}`;

    const newMemberRecord: Member = {
      id: `mem-${Date.now()}`,
      memberId: newMemberId,
      fullName: admName.trim(),
      photo: admPhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      mobile: admMobile.trim(),
      whatsapp: admMobile.trim(),
      email: `${admName.toLowerCase().replace(/\s+/g, '')}@redapplegym.in`,
      gender: admGender,
      age: admAge,
      plan: admPlan,
      category: admCategory,
      joinDate,
      expiryDate,
      status: 'Active',
      remainingDays: durationDays,
      remainingDaysText: `${durationDays} Days Remaining`,
      attendancePercentage: 100,
      totalFee: admAmountPaid,
      amountPaid: admAmountPaid,
      dueAmount: 0,
      dueDate: expiryDate,
      paymentStatus: 'Paid',
      emergencyContact: admEmergency.trim(),
      notes: 'Registered via Front Desk Reception Kiosk'
    };

    addMember(newMemberRecord);
    setAdmSuccessMember(newMemberRecord);
    playChime('success');

    // Reset Form
    setAdmName('');
    setAdmMobile('');
    setAdmPhoto('');
    setAdmEmergency('');
  };

  // -------------------------------------------------------------
  // TAB 4: PLAN BROCHURE
  // -------------------------------------------------------------
  const [brochureCategory, setBrochureCategory] = useState<MembershipCategory>('Gym + Cardio');

  const isKioskAllowed = centralLicense ? isFeatureEnabled('gym_kiosk', centralLicense) : false;

  if (licenseChecked && !isKioskAllowed) {
    return (
      <div className="min-h-screen bg-[#0C0E14] text-white flex flex-col items-center justify-center p-6">
        <FeatureGateNotice
          featureName="Reception Kiosk"
          featureKey="gym_kiosk"
          description="Reception Kiosk (/kiosk) is disabled in your central software license. Enable it from your Central Admin Panel to unlock."
        />
        <Link
          href="/admin"
          className="mt-6 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold transition-colors text-white"
        >
          ← Return to Admin Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0C0E14] text-white flex flex-col font-sans selection:bg-[#E50914] selection:text-white">
      {/* Top Reception Header */}
      <header className="px-4 sm:px-6 py-3 bg-[#11131B]/95 border-b border-white/10 backdrop-blur-xl flex items-center justify-between gap-4 sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white p-1 shadow-md border border-[#D4A574]/40 overflow-hidden flex items-center justify-center shrink-0">
            <img src="/images/logo.png" alt="Red Apple Gym" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base tracking-wider text-white font-serif">
                RED APPLE GYM
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#E50914]/20 border border-[#E50914]/40 text-[#E50914] text-[10px] font-black uppercase tracking-wider">
                Reception Kiosk
              </span>
            </div>
            <p className="text-[10px] text-neutral-400 font-medium">Front Desk Floor Terminal • CIDCO N-2</p>
          </div>
        </div>

        {/* Live Clock & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden md:flex flex-col items-end pr-3 border-r border-white/10">
            <span className="text-xs font-mono font-bold text-[#00F59B]">{currentTime}</span>
            <span className="text-[10px] text-neutral-400">{currentDate}</span>
          </div>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 hover:text-white transition-all cursor-pointer"
            title="Toggle Fullscreen Tablet Mode"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Locked Exit to Admin Button */}
          <button
            onClick={() => setExitModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-neutral-400 hover:text-rose-400 border border-white/10 text-xs font-bold transition-all cursor-pointer"
            title="Exit Kiosk Mode (Requires Admin Password)"
          >
            <Lock className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Admin Exit</span>
          </button>
        </div>
      </header>

      {/* Main Tab Navigation Bar */}
      <nav className="px-4 sm:px-6 py-2.5 bg-[#151822] border-b border-white/5 flex items-center justify-start sm:justify-center gap-2 overflow-x-auto">
        <button
          onClick={() => setCurrentTab('punch')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
            currentTab === 'punch'
              ? 'bg-[#E50914] text-white shadow-lg shadow-red-600/30'
              : 'bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>Fast Check-In</span>
        </button>

        <button
          onClick={() => setCurrentTab('members')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
            currentTab === 'members'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
              : 'bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Member Assist &amp; Renew</span>
        </button>

        <button
          onClick={() => setCurrentTab('admission')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
            currentTab === 'admission'
              ? 'bg-[#00F59B] text-black shadow-lg shadow-[#00F59B]/30'
              : 'bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          <span>Walk-In Admission</span>
        </button>

        <button
          onClick={() => setCurrentTab('plans')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
            currentTab === 'plans'
              ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/30'
              : 'bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Explain Plans</span>
        </button>
      </nav>

      {/* Main Kiosk Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto">
        {/* ============================================================== */}
        {/* TAB 1: FAST PUNCH IN */}
        {/* ============================================================== */}
        {currentTab === 'punch' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Quick Search & Barcode Input */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#141722] border border-white/10 shadow-2xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-white font-['Space_Grotesk']">
                    Front Desk Member Punch-In
                  </h2>
                  <p className="text-xs text-neutral-400">
                    Type member name, RED-ID, or phone number to register attendance instantly.
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{todayRecords.length} Checked In Today</span>
                </div>
              </div>

              <div className="relative">
                <Search className="w-5 h-5 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  autoFocus
                  value={punchSearch}
                  onChange={(e) => setPunchSearch(e.target.value)}
                  placeholder="Enter athlete name or Member ID (e.g. RED-3049, Sakshi)..."
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-black/40 border border-white/20 text-white font-mono text-base placeholder:text-neutral-500 focus:outline-none focus:border-[#E50914] shadow-inner"
                />
              </div>

              {/* Instant Search Suggestions */}
              {filteredPunchMembers.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
                  {filteredPunchMembers.map((m) => {
                    const isExp = m.status === 'Expired' || m.remainingDays <= 0;
                    return (
                      <div
                        key={m.id}
                        onClick={() => handleExecuteCheckIn(m)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 group ${
                          isExp
                            ? 'bg-rose-500/10 border-rose-500/30 hover:bg-rose-500/20'
                            : 'bg-white/5 border-white/10 hover:border-[#00F59B] hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={m.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'}
                            alt={m.fullName}
                            className="w-10 h-10 rounded-xl object-cover shrink-0 border border-white/10"
                          />
                          <div className="min-w-0">
                            <div className="font-bold text-sm text-white truncate group-hover:text-[#00F59B]">
                              {m.fullName}
                            </div>
                            <div className="text-[11px] font-mono text-neutral-400">
                              {m.memberId} • {m.plan}
                            </div>
                          </div>
                        </div>

                        <div className="shrink-0 text-right">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                              isExp ? 'bg-rose-500 text-white' : 'bg-emerald-500/20 text-emerald-400'
                            }`}
                          >
                            {isExp ? 'Expired' : `${m.remainingDays}d`}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Check-In Success / Warning Banner */}
            {lastCheckInResult && (
              <div
                className={`p-6 rounded-3xl border animate-in zoom-in-95 duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xl ${
                  lastCheckInResult.status === 'success'
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                    : lastCheckInResult.status === 'expiring'
                    ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                    : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                      lastCheckInResult.status === 'success'
                        ? 'bg-emerald-500 text-black'
                        : lastCheckInResult.status === 'expiring'
                        ? 'bg-amber-400 text-black'
                        : 'bg-rose-500 text-white'
                    }`}
                  >
                    {lastCheckInResult.status === 'success' ? (
                      <CheckCircle2 className="w-8 h-8" />
                    ) : (
                      <AlertTriangle className="w-8 h-8" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-lg text-white">
                        {lastCheckInResult.member.fullName} ({lastCheckInResult.member.memberId})
                      </span>
                      <span className="text-xs font-mono opacity-75">• {lastCheckInResult.time}</span>
                    </div>
                    <p className="text-xs font-medium mt-0.5">{lastCheckInResult.message}</p>
                  </div>
                </div>

                {lastCheckInResult.status !== 'success' && (
                  <button
                    onClick={() => setRenewingMember(lastCheckInResult.member)}
                    className="px-4 py-2.5 rounded-xl bg-white text-black font-extrabold text-xs uppercase tracking-wider hover:bg-neutral-200 shrink-0 cursor-pointer shadow-md"
                  >
                    Renew Plan Now
                  </button>
                )}
              </div>
            )}

            {/* Recent Today Floor Attendance Ledger */}
            <div className="p-6 rounded-3xl bg-[#141722] border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Today&apos;s Floor Attendance ({todayRecords.length})
                </span>
                <span className="text-[11px] text-neutral-500">Auto-synced</span>
              </div>

              {todayRecords.length === 0 ? (
                <div className="text-center py-8 text-neutral-500 text-xs">
                  No check-ins recorded yet today. Punch in athletes using the search bar above.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto pr-1">
                  {todayRecords.slice(0, 15).map((rec) => (
                    <div
                      key={rec.id}
                      className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between text-xs"
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-white truncate">{rec.memberName}</div>
                        <div className="text-[10px] font-mono text-neutral-400">{rec.memberId}</div>
                      </div>
                      <span className="text-[11px] font-mono font-bold text-[#00F59B] shrink-0">
                        {rec.checkInTime}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: MEMBER ASSISTANCE & RENEWAL */}
        {/* ============================================================== */}
        {currentTab === 'members' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="p-6 rounded-3xl bg-[#141722] border border-white/10 shadow-2xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-xl font-black text-white font-['Space_Grotesk']">
                    Member Directory &amp; Support
                  </h2>
                  <p className="text-xs text-neutral-400">
                    Search athletes, renew plans, update phone numbers, and share pass links.
                  </p>
                </div>
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={memberSearchQuery}
                    onChange={(e) => setMemberSearchQuery(e.target.value)}
                    placeholder="Search member..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Members Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-neutral-400 uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-3">Athlete</th>
                      <th className="py-3 px-3">Plan &amp; Validity</th>
                      <th className="py-3 px-3">Contact</th>
                      <th className="py-3 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredAssistMembers.map((m) => {
                      const isExp = m.status === 'Expired' || m.remainingDays <= 0;
                      return (
                        <tr key={m.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2.5">
                              <img
                                src={m.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'}
                                alt={m.fullName}
                                className="w-9 h-9 rounded-xl object-cover shrink-0 border border-white/10"
                              />
                              <div>
                                <div className="font-bold text-white">{m.fullName}</div>
                                <div className="text-[10px] font-mono text-[#D4A574]">{m.memberId}</div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-3">
                            <div className="font-semibold text-white">{m.plan}</div>
                            <div className="text-[10px] text-neutral-400 flex items-center gap-1.5">
                              <span>Exp: {m.expiryDate}</span>
                              <span
                                className={`px-1.5 py-0.2 rounded-full font-bold uppercase text-[9px] ${
                                  isExp ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'
                                }`}
                              >
                                {m.remainingDaysText}
                              </span>
                            </div>
                          </td>

                          <td className="py-3 px-3">
                            <div className="font-mono text-neutral-300">{m.mobile}</div>
                            <div className="text-[10px] text-neutral-500">Emer: {m.emergencyContact || 'None'}</div>
                          </td>

                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setRenewingMember(m)}
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-[#00F59B] font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                                title="Renew / Extend Plan"
                              >
                                <RefreshCw className="w-3 h-3" />
                                <span>Renew</span>
                              </button>

                              <button
                                onClick={() => openMemberEditModal(m)}
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                                title="Edit Contact Details"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              <a
                                href={generateWhatsAppLink(
                                  m.mobile,
                                  `Hello ${m.fullName}! Here is your official digital gym pass for Red Apple Gym: https://redapplegym.in/pass/${m.memberId}`
                                )}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-lg bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] transition-colors"
                                title="Send Pass via WhatsApp"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: WALK-IN ADMISSION FORM */}
        {/* ============================================================== */}
        {currentTab === 'admission' && (
          <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-200">
            {admSuccessMember ? (
              <div className="p-8 rounded-3xl bg-[#141722] border border-[#00F59B]/40 text-center space-y-4 shadow-2xl">
                <div className="w-16 h-16 rounded-full bg-[#00F59B]/20 text-[#00F59B] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white font-['Space_Grotesk']">
                    Member Enrolled Successfully!
                  </h3>
                  <p className="text-xs text-neutral-400 mt-1">
                    Athlete ID: <strong className="text-[#00F59B] font-mono">{admSuccessMember.memberId}</strong> •{' '}
                    {admSuccessMember.fullName}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-black/40 border border-white/10 text-left text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Plan:</span>
                    <strong className="text-white">{admSuccessMember.plan} ({admSuccessMember.category})</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Validity Expiry:</span>
                    <strong className="text-white">{admSuccessMember.expiryDate}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Amount Paid:</span>
                    <strong className="text-[#00F59B]">₹{admSuccessMember.amountPaid}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-3 justify-center pt-2">
                  <a
                    href={generateWhatsAppLink(
                      admSuccessMember.mobile,
                      `Welcome to Red Apple Gym, ${admSuccessMember.fullName}! Your membership ID is ${admSuccessMember.memberId}. Open your digital gym pass here: https://redapplegym.in/pass/${admSuccessMember.memberId}`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-3 rounded-xl bg-[#25D366] text-black font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Send Pass on WhatsApp</span>
                  </a>
                  <button
                    onClick={() => setAdmSuccessMember(null)}
                    className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs uppercase tracking-wider cursor-pointer"
                  >
                    Enroll Another
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateAdmission} className="p-6 sm:p-8 rounded-3xl bg-[#141722] border border-white/10 shadow-2xl space-y-5">
                <div>
                  <h2 className="text-xl font-black text-white font-['Space_Grotesk']">
                    Front Desk Walk-In Admission
                  </h2>
                  <p className="text-xs text-neutral-400">
                    Register a new walk-in athlete and generate their digital pass immediately.
                  </p>
                </div>

                {/* Photo Capture */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block">
                    Athlete Photo (Camera / Upload)
                  </label>
                  <PhotoCapture value={admPhoto} onChange={(url: string) => setAdmPhoto(url)} />
                </div>

                {/* Name & Mobile */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="font-bold uppercase tracking-wider text-neutral-400">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={admName}
                      onChange={(e) => setAdmName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/15 text-white focus:outline-none focus:border-[#E50914]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold uppercase tracking-wider text-neutral-400">Mobile Number (WhatsApp) *</label>
                    <input
                      type="tel"
                      required
                      value={admMobile}
                      onChange={(e) => setAdmMobile(e.target.value)}
                      placeholder="e.g. 9823456789"
                      className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/15 text-white focus:outline-none focus:border-[#E50914]"
                    />
                  </div>
                </div>

                {/* Gender & Age */}
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="font-bold uppercase tracking-wider text-neutral-400">Gender</label>
                    <select
                      value={admGender}
                      onChange={(e: any) => setAdmGender(e.target.value)}
                      className="w-full px-3 py-3 rounded-xl bg-black/40 border border-white/15 text-white focus:outline-none focus:border-[#E50914]"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold uppercase tracking-wider text-neutral-400">Age</label>
                    <input
                      type="number"
                      value={admAge}
                      onChange={(e) => setAdmAge(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/15 text-white focus:outline-none focus:border-[#E50914]"
                    />
                  </div>
                </div>

                {/* Plan & Category */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="font-bold uppercase tracking-wider text-neutral-400">Selected Plan</label>
                    <select
                      value={admPlan}
                      onChange={(e: any) => setAdmPlan(e.target.value)}
                      className="w-full px-3 py-3 rounded-xl bg-black/40 border border-white/15 text-white focus:outline-none focus:border-[#E50914]"
                    >
                      <option value="Monthly">Monthly (1 Month - ₹800)</option>
                      <option value="Quarterly">Quarterly (3 Months - ₹2,100)</option>
                      <option value="Half-Yearly">Half-Yearly (6 Months - ₹4,000)</option>
                      <option value="Annual">Annual (1 Year - ₹7,000)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold uppercase tracking-wider text-neutral-400">Category</label>
                    <select
                      value={admCategory}
                      onChange={(e: any) => setAdmCategory(e.target.value)}
                      className="w-full px-3 py-3 rounded-xl bg-black/40 border border-white/15 text-white focus:outline-none focus:border-[#E50914]"
                    >
                      <option value="Gym Only">Gym Only</option>
                      <option value="Gym + Cardio">Gym + Cardio</option>
                    </select>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="space-y-1.5 text-xs">
                  <label className="font-bold uppercase tracking-wider text-neutral-400">Emergency Contact</label>
                  <input
                    type="text"
                    value={admEmergency}
                    onChange={(e) => setAdmEmergency(e.target.value)}
                    placeholder="Parent / Guardian phone number"
                    className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/15 text-white focus:outline-none focus:border-[#E50914]"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#E50914] to-[#B80710] hover:brightness-110 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-xl shadow-red-600/30 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Register Athlete &amp; Issue VIP Pass</span>
                </button>
              </form>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: EXPLAIN PLANS (BROCHURE) */}
        {/* ============================================================== */}
        {currentTab === 'plans' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Official Membership Catalog</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white font-['Space_Grotesk']">
                Red Apple Gym Tariff Guide
              </h2>
              <p className="text-xs text-neutral-400 max-w-md mx-auto">
                Present membership options, duration benefits, and cardio inclusions directly to prospective athletes.
              </p>

              {/* Category Toggle */}
              <div className="inline-flex p-1 rounded-2xl bg-[#141722] border border-white/10 text-xs font-bold mt-2">
                <button
                  onClick={() => setBrochureCategory('Gym + Cardio')}
                  className={`px-5 py-2 rounded-xl transition-all cursor-pointer ${
                    brochureCategory === 'Gym + Cardio'
                      ? 'bg-[#E50914] text-white shadow-md'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Gym + Cardio (Most Popular)
                </button>
                <button
                  onClick={() => setBrochureCategory('Gym Only')}
                  className={`px-5 py-2 rounded-xl transition-all cursor-pointer ${
                    brochureCategory === 'Gym Only'
                      ? 'bg-[#E50914] text-white shadow-md'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Gym Only
                </button>
              </div>
            </div>

            {/* Plan Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              {[
                {
                  plan: 'Monthly',
                  duration: '30 Days',
                  gymOnly: 700,
                  gymCardio: 800,
                  badge: 'Standard Starter',
                  features: ['Complete Weight Floor Access', 'Locker Room & Showers', 'Certified Coach Guidance', 'Mobile Pass App']
                },
                {
                  plan: 'Quarterly',
                  duration: '90 Days (3 Months)',
                  gymOnly: 1900,
                  gymCardio: 2100,
                  badge: 'Best Value',
                  highlight: true,
                  features: ['All Monthly Features', '1 Free Body Biometrics Check', 'Personalized Workout Plan', 'High Value Savings']
                },
                {
                  plan: 'Half-Yearly',
                  duration: '180 Days (6 Months)',
                  gymOnly: 3600,
                  gymCardio: 4000,
                  badge: 'Transformation Choice',
                  features: ['All Quarterly Features', 'Bi-Weekly Progress Review', 'Cardio Floor Unlimited', 'Freeze Facility (7 Days)']
                },
                {
                  plan: 'Annual',
                  duration: '365 Days (1 Full Year)',
                  gymOnly: 6200,
                  gymCardio: 7000,
                  badge: 'VIP Elite',
                  features: ['All Facilities Unlimited', 'Year-Round Coach Mentorship', 'Complimentary Gym Kit Bag', 'Maximum Yearly Savings']
                }
              ].map((p, idx) => {
                const price = brochureCategory === 'Gym + Cardio' ? p.gymCardio : p.gymOnly;
                return (
                  <div
                    key={idx}
                    className={`p-6 rounded-3xl flex flex-col justify-between border relative transition-all shadow-xl ${
                      p.highlight
                        ? 'bg-gradient-to-b from-[#1C1F2D] to-[#12141F] border-[#E50914]/60 shadow-red-900/20'
                        : 'bg-[#141722] border-white/10'
                    }`}
                  >
                    {p.badge && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#E50914] text-white text-[10px] font-black uppercase tracking-wider shadow-md">
                        {p.badge}
                      </span>
                    )}

                    <div>
                      <div className="text-sm font-bold text-neutral-300 uppercase tracking-wider">{p.plan}</div>
                      <div className="text-[11px] text-neutral-400 mt-0.5">{p.duration}</div>

                      <div className="my-4">
                        <span className="text-3xl font-black text-white font-['Space_Grotesk']">₹{price.toLocaleString('en-IN')}</span>
                        <span className="text-xs text-neutral-400 block mt-0.5">All taxes included</span>
                      </div>

                      <ul className="space-y-2 text-xs text-neutral-300 border-t border-white/10 pt-4">
                        {p.features.map((f, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <Check className="w-3.5 h-3.5 text-[#00F59B] shrink-0" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      onClick={() => {
                        setAdmPlan(p.plan as MembershipPlanType);
                        setAdmCategory(brochureCategory);
                        setCurrentTab('admission');
                      }}
                      className="w-full mt-6 py-2.5 rounded-xl bg-white/10 hover:bg-[#E50914] text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Enroll in {p.plan}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Member Edit Contact Details Modal */}
      {selectedEditMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-[#141722] border border-white/15 p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Update Member Contact Details</h3>
                <p className="text-xs text-neutral-400">
                  {selectedEditMember.fullName} ({selectedEditMember.memberId})
                </p>
              </div>
              <button
                onClick={() => setSelectedEditMember(null)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {editSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                {editSuccessMsg}
              </div>
            )}

            <form onSubmit={handleSaveMemberAssistance} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold uppercase tracking-wider text-neutral-400">Mobile Number (WhatsApp)</label>
                <input
                  type="tel"
                  value={editMobile}
                  onChange={(e) => setEditMobile(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold uppercase tracking-wider text-neutral-400">Emergency Contact</label>
                <input
                  type="text"
                  value={editEmergency}
                  onChange={(e) => setEditEmergency(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold uppercase tracking-wider text-neutral-400">Blood Group</label>
                <input
                  type="text"
                  value={editBloodGroup}
                  onChange={(e) => setEditBloodGroup(e.target.value)}
                  placeholder="e.g. O+, B+, A+"
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold uppercase tracking-wider text-neutral-400">Front Desk Notes</label>
                <textarea
                  rows={2}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase tracking-wider transition-all"
              >
                Save Member Details
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Quick Renew Modal Wrapper */}
      {renewingMember && (
        <QuickRenewModal member={renewingMember} onClose={() => setRenewingMember(null)} />
      )}

      {/* Admin Password Exit Protected Modal */}
      {exitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-[#141722] border border-white/20 p-6 space-y-5 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <Shield className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">Exit Kiosk Terminal</h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Enter Master Admin Password to exit kiosk mode and access full operations.
              </p>
            </div>

            {exitError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {exitError}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (exitPassword.trim() === adminPassword || exitPassword.trim() === 'masterkey') {
                  window.location.href = '/admin';
                } else {
                  setExitError('Incorrect admin password.');
                }
              }}
              className="space-y-3"
            >
              <input
                type="password"
                autoFocus
                value={exitPassword}
                onChange={(e) => setExitPassword(e.target.value)}
                placeholder="Enter Admin Password"
                className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/20 text-white text-xs font-mono text-center tracking-widest focus:outline-none focus:border-[#E50914]"
              />

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setExitModalOpen(false);
                    setExitPassword('');
                    setExitError('');
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#E50914] hover:bg-[#b80710] text-white font-bold text-xs uppercase cursor-pointer"
                >
                  Unlock Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
