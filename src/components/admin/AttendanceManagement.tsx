'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useApp } from '@/lib/store';
import { Member, AttendanceRecord } from '@/lib/types';
import { calculateMembershipCountdown, calculateMonthAttendanceStats, calculateDaysAbsent, formatFriendlyDate } from '@/lib/dateUtils';
import {
  CalendarCheck,
  QrCode,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Calendar,
  Users,
  RefreshCw,
  Camera,
  X,
  AlertTriangle,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Phone,
  MessageCircle,
  UserX
} from 'lucide-react';

export const AttendanceManagement: React.FC = () => {
  const { members, checkInMember, attendanceRecords, generateWhatsAppLink } = useApp();

  // Search & Check-in input
  const [searchInput, setSearchInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [checkInResult, setCheckInResult] = useState<{
    status: 'success' | 'expired' | 'duplicate' | 'not_found';
    member?: Member;
    message: string;
    checkInTime?: string;
  } | null>(null);

  // Camera scanner preview toggle
  const [showCameraScanner, setShowCameraScanner] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Today's attendance filter
  const [todayTableSearch, setTodayTableSearch] = useState('');

  // Selected member for Attendance History
  const [selectedMemberIdForHistory, setSelectedMemberIdForHistory] = useState<string>(
    members[0]?.id || ''
  );

  // Member Attendance History Search State
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const [historySearchFeedback, setHistorySearchFeedback] = useState<string | null>(null);

  // Filtered members for Attendance History dropdown
  const filteredHistoryMembers = useMemo(() => {
    if (!historySearchQuery.trim()) return members;
    const q = historySearchQuery.trim().toLowerCase();
    const digits = q.replace(/\D/g, '');
    return members.filter((m) => {
      const matchName = m.fullName.toLowerCase().includes(q);
      const matchId = m.memberId.toLowerCase().includes(q) || m.id.toLowerCase().includes(q);
      const matchPhone = digits.length >= 3 && m.mobile.replace(/\D/g, '').includes(digits);
      return matchName || matchId || matchPhone;
    });
  }, [members, historySearchQuery]);

  const handleHistorySearch = (queryOverride?: string) => {
    const q = (queryOverride !== undefined ? queryOverride : historySearchQuery).trim().toLowerCase();
    if (!q) {
      setHistorySearchFeedback('Please enter a name, Member ID, or mobile number.');
      setTimeout(() => setHistorySearchFeedback(null), 3000);
      return;
    }

    const digits = q.replace(/\D/g, '');
    const matched = members.find((m) => {
      const matchName = m.fullName.toLowerCase().includes(q);
      const matchId = m.memberId.toLowerCase().includes(q) || m.id.toLowerCase().includes(q);
      const matchPhone = digits.length >= 3 && m.mobile.replace(/\D/g, '').includes(digits);
      return matchName || matchId || matchPhone;
    });

    if (matched) {
      setSelectedMemberIdForHistory(matched.id);
      setHistorySearchFeedback(`Found & Selected: ${matched.fullName} (${matched.memberId})`);
      setTimeout(() => setHistorySearchFeedback(null), 3500);
    } else {
      setHistorySearchFeedback(`No member found matching "${historySearchQuery.trim()}".`);
      setTimeout(() => setHistorySearchFeedback(null), 3500);
    }
  };

  // Irregular members (> 7 days inactive)
  const irregularMembers = useMemo(() => {
    return members
      .filter((m) => m.status !== 'Expired' || m.remainingDays > 0)
      .map((m) => {
        const absentInfo = calculateDaysAbsent(m.joinDate, attendanceRecords, m.id, m.memberId);
        return {
          member: m,
          lastCheckInDate: absentInfo.lastCheckInDate,
          daysAbsent: absentInfo.daysAbsent
        };
      })
      .filter((item) => item.daysAbsent > 7)
      .sort((a, b) => b.daysAbsent - a.daysAbsent);
  }, [members, attendanceRecords]);

  const handleInspectIrregularMember = (memberId: string) => {
    setSelectedMemberIdForHistory(memberId);
    setHistorySearchFeedback(`Selected athlete for monthly calendar inspection`);
    setTimeout(() => setHistorySearchFeedback(null), 3000);
    const element = document.getElementById('member-attendance-history-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleWhatsAppIrregular = (member: Member, daysAbsent: number) => {
    const text = `Hello ${member.fullName}! 🍎 Warm greetings from Red Apple Fitness. We noticed you haven't visited the gym in the last ${daysAbsent} days! We miss having you on the gym floor. Is everything going well with your schedule? Let us know if we can help you get back on track with your workouts! 💪🏋️‍♂️`;
    const url = generateWhatsAppLink(member.mobile, text);
    window.open(url, '_blank');
  };

  // Selected Month/Year for Attendance History
  const currentDate = new Date();
  const [historyYear, setHistoryYear] = useState<number>(currentDate.getFullYear());
  const [historyMonth, setHistoryMonth] = useState<number>(currentDate.getMonth() + 1); // 1-indexed

  // Today's Date String
  const todayStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);

  // Filter today's records
  const todayAttendanceRecords = useMemo(() => {
    return attendanceRecords.filter((a) => a.date === todayStr);
  }, [attendanceRecords, todayStr]);

  const checkedInMemberIds = useMemo(() => {
    return new Set(todayAttendanceRecords.map((a) => a.memberId));
  }, [todayAttendanceRecords]);

  // Counts for Today's Attendance
  const checkedInTodayCount = todayAttendanceRecords.length;
  const activeMembersCount = members.filter((m) => m.status === 'Active' || m.remainingDays > 0).length;
  const notCheckedInCount = Math.max(0, activeMembersCount - checkedInTodayCount);

  // Search suggestions dropdown for quick selection
  const searchSuggestions = useMemo(() => {
    if (!searchInput.trim() || searchInput.length < 2) return [];
    const q = searchInput.toLowerCase().trim();
    const digits = searchInput.replace(/\D/g, '');
    return members
      .filter((m) => {
        const matchName = m.fullName.toLowerCase().includes(q);
        const matchId = m.memberId.toLowerCase().includes(q);
        const matchPhone = digits.length >= 3 && m.mobile.replace(/\D/g, '').includes(digits);
        return matchName || matchId || matchPhone;
      })
      .slice(0, 5);
  }, [members, searchInput]);

  // Core Check-In Logic
  const executeCheckIn = (targetInput: string) => {
    const clean = targetInput.trim();
    if (!clean) return;

    setIsVerifying(true);

    // Find member
    const q = clean.toLowerCase();
    const digits = clean.replace(/\D/g, '');
    const matched = members.find(
      (m) =>
        m.id === clean ||
        m.memberId.toLowerCase() === q ||
        m.fullName.toLowerCase() === q ||
        (digits.length >= 5 && m.mobile.replace(/\D/g, '') === digits) ||
        (digits.length >= 5 && m.whatsapp.replace(/\D/g, '') === digits)
    );

    if (!matched) {
      setCheckInResult({
        status: 'not_found',
        message: `No gym member found matching "${clean}". Check the ID or mobile number.`
      });
      setIsVerifying(false);
      return;
    }

    const countdown = calculateMembershipCountdown(matched.expiryDate);

    // Check if expired
    if (countdown.status === 'Expired' || countdown.remainingDays < 0) {
      setCheckInResult({
        status: 'expired',
        member: matched,
        message: `Membership expired on ${matched.expiryDate} (${countdown.remainingDaysText}). Access is locked. Please renew before floor entry.`
      });
      setIsVerifying(false);
      return;
    }

    // Check for duplicate check-in today
    const existing = todayAttendanceRecords.find((a) => a.memberId === matched.id);
    if (existing) {
      setCheckInResult({
        status: 'duplicate',
        member: matched,
        checkInTime: existing.checkInTime,
        message: `Already checked in today at ${existing.checkInTime}. Duplicate check-in prevented.`
      });
      setIsVerifying(false);
      return;
    }

    // Record check-in
    const res = checkInMember(matched.id);
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setCheckInResult({
      status: 'success',
      member: matched,
      checkInTime: nowTime,
      message: `Welcome, ${matched.fullName}! Check-in verified.`
    });

    setSearchInput('');
    setIsVerifying(false);
  };

  // Camera stream handler
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (showCameraScanner && navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: { facingMode: 'environment' } })
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
          }
        })
        .catch((err) => {
          console.warn('Camera access error:', err);
        });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [showCameraScanner]);

  // Selected Member for Attendance Calendar
  const selectedMember = useMemo(() => {
    return members.find((m) => m.id === selectedMemberIdForHistory) || members[0];
  }, [members, selectedMemberIdForHistory]);

  // Monthly stats for the selected member
  const monthStats = useMemo(() => {
    if (!selectedMember) return null;
    return calculateMonthAttendanceStats(
      selectedMember.id,
      attendanceRecords,
      historyYear,
      historyMonth,
      selectedMember.joinDate
    );
  }, [selectedMember, attendanceRecords, historyYear, historyMonth]);

  // Month navigation
  const handlePrevMonth = () => {
    if (historyMonth === 1) {
      setHistoryMonth(12);
      setHistoryYear((y) => y - 1);
    } else {
      setHistoryMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (historyMonth === 12) {
      setHistoryMonth(1);
      setHistoryYear((y) => y + 1);
    } else {
      setHistoryMonth((m) => m + 1);
    }
  };

  const monthName = new Date(historyYear, historyMonth - 1, 1).toLocaleString('en-US', {
    month: 'long'
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-[#1A1A1A] font-['Playfair_Display']">
          Attendance Kiosk
        </h2>
        <p className="text-xs text-[#71717A] mt-0.5">
          Scan member passes, verify check-in credentials, and inspect monthly workout logs.
        </p>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: CHECK-IN TERMINAL */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-black/10 shadow-xs p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/10 pb-4">
          <div>
            <h3 className="text-lg font-bold text-[#1A1A1A] font-['Playfair_Display']">
              Member Check-in
            </h3>
            <p className="text-xs text-[#71717A] mt-0.5">
              Scan a member QR code or enter their mobile number or Member ID.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowCameraScanner(!showCameraScanner)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-black/10 text-xs font-semibold text-[#1A1A1A] hover:bg-black/5 self-start sm:self-auto transition-colors"
          >
            <Camera className="w-3.5 h-3.5 text-[#C41E3A]" />
            <span>{showCameraScanner ? 'Close Camera Scanner' : 'Open Camera Scanner'}</span>
          </button>
        </div>

        {/* Camera Scanner Viewfinder */}
        {showCameraScanner && (
          <div className="relative rounded-xl overflow-hidden bg-black max-w-md mx-auto aspect-video border border-black/20 flex items-center justify-center">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            <div className="absolute inset-0 border-2 border-dashed border-[#C41E3A]/70 m-8 rounded-lg pointer-events-none flex items-center justify-center">
              <span className="text-[11px] font-semibold text-white bg-black/60 px-2 py-1 rounded">
                Align Member QR Code
              </span>
            </div>
            <button
              onClick={() => setShowCameraScanner(false)}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white hover:bg-black"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Check-In Input Form */}
        <div className="relative max-w-2xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-[#71717A] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') executeCheckIn(searchInput);
                }}
                placeholder="Enter Member ID (e.g. RED-8021) or mobile number..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-black/15 bg-[#F8F6F4] text-sm text-[#1A1A1A] placeholder:text-[#A1A1AA] focus:outline-none focus:ring-2 focus:ring-[#C41E3A]/20 focus:border-[#C41E3A] focus:bg-white"
              />
            </div>

            <button
              type="button"
              disabled={!searchInput.trim() || isVerifying}
              onClick={() => executeCheckIn(searchInput)}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#C41E3A] text-white text-xs font-semibold hover:bg-[#A3182E] disabled:opacity-40 transition-colors flex items-center justify-center gap-2 shadow-xs shrink-0"
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <CalendarCheck className="w-3.5 h-3.5" />
                  <span>Verify & Check In</span>
                </>
              )}
            </button>
          </div>

          {/* Autocomplete Suggestions Dropdown */}
          {searchSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-black/10 shadow-lg py-1 z-30 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-1 text-[10px] uppercase font-bold text-[#71717A] tracking-wider">
                Matching Members
              </div>
              {searchSuggestions.map((m) => (
                <button
                  key={m.id}
                  onClick={() => executeCheckIn(m.id)}
                  className="w-full px-3 py-2 text-left text-xs hover:bg-black/5 flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-black/5 flex items-center justify-center font-bold text-[10px] text-[#1A1A1A]">
                      {m.fullName.charAt(0)}
                    </div>
                    <div>
                      <span className="font-semibold text-[#1A1A1A]">{m.fullName}</span>
                      <span className="text-[#71717A] font-mono ml-2">({m.memberId})</span>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-[#71717A]">{m.mobile}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Check-In Feedback Result Panels */}
        {checkInResult && (
          <div className="max-w-2xl mx-auto animate-in fade-in duration-200">
            {/* SUCCESS PANEL */}
            {checkInResult.status === 'success' && checkInResult.member && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
                <div className="flex items-center gap-3">
                  {checkInResult.member.photo ? (
                    <img
                      src={checkInResult.member.photo}
                      alt={checkInResult.member.fullName}
                      className="w-12 h-12 rounded-xl object-cover border border-emerald-300 shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-emerald-200/60 border border-emerald-300 flex items-center justify-center font-bold text-base text-emerald-800 shrink-0">
                      {checkInResult.member.fullName.charAt(0)}
                    </div>
                  )}

                  <div>
                    <h4 className="text-base font-bold text-emerald-950 leading-tight">
                      Welcome, {checkInResult.member.fullName}
                    </h4>
                    <p className="text-xs text-emerald-800 font-medium mt-0.5">
                      Membership active · {checkInResult.member.remainingDaysText}
                    </p>
                    <p className="text-[11px] text-emerald-700 font-mono mt-0.5">
                      Check-in successful at {checkInResult.checkInTime} • {checkInResult.member.memberId}
                    </p>
                  </div>
                </div>

                <div className="self-end sm:self-center">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-600 text-white">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified
                  </span>
                </div>
              </div>
            )}

            {/* DUPLICATE PANEL */}
            {checkInResult.status === 'duplicate' && checkInResult.member && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 flex items-start gap-3 shadow-xs">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-amber-950">
                    Already Checked In Today
                  </h4>
                  <p className="text-xs text-amber-900 mt-0.5">
                    <strong>{checkInResult.member.fullName}</strong> was already checked in today at{' '}
                    <span className="font-mono font-bold">{checkInResult.checkInTime}</span>.
                  </p>
                  <p className="text-[11px] text-amber-800 mt-1">
                    Expiry Date: {checkInResult.member.expiryDate} ({checkInResult.member.remainingDaysText})
                  </p>
                </div>
              </div>
            )}

            {/* EXPIRED WARNING PANEL */}
            {checkInResult.status === 'expired' && checkInResult.member && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-300 text-rose-950 flex items-start gap-3 shadow-xs">
                <AlertCircle className="w-5 h-5 text-[#C41E3A] shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-[#C41E3A]">
                    Access Blocked: Membership Expired
                  </h4>
                  <p className="text-xs text-rose-900 mt-0.5">
                    <strong>{checkInResult.member.fullName}</strong> ({checkInResult.member.memberId}) has expired on{' '}
                    <span className="font-semibold">{checkInResult.member.expiryDate}</span>.
                  </p>
                  <p className="text-xs font-semibold text-[#C41E3A] mt-1">
                    Floor access is locked. Please process renewal before admitting.
                  </p>
                </div>
              </div>
            )}

            {/* NOT FOUND PANEL */}
            {checkInResult.status === 'not_found' && (
              <div className="p-3.5 rounded-xl bg-neutral-100 border border-neutral-300 text-neutral-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-neutral-600 shrink-0" />
                <span>{checkInResult.message}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SECTION 2: TODAY'S ATTENDANCE */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        {/* 3 Summary Counters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-xl bg-white border border-black/10 shadow-2xs">
            <span className="text-xs font-medium text-[#71717A]">Checked In Today</span>
            <div className="text-2xl font-bold font-['Playfair_Display'] text-emerald-700 mt-1">
              {checkedInTodayCount}
            </div>
            <span className="text-[11px] text-[#71717A]">Verified daily attendance</span>
          </div>

          <div className="p-4 rounded-xl bg-white border border-black/10 shadow-2xs">
            <span className="text-xs font-medium text-[#71717A]">Currently Present</span>
            <div className="text-2xl font-bold font-['Playfair_Display'] text-[#1A1A1A] mt-1">
              {checkedInTodayCount}
            </div>
            <span className="text-[11px] text-[#71717A]">Active floor occupants</span>
          </div>

          <div className="p-4 rounded-xl bg-white border border-black/10 shadow-2xs">
            <span className="text-xs font-medium text-[#71717A]">Not Yet Checked In</span>
            <div className="text-2xl font-bold font-['Playfair_Display'] text-amber-700 mt-1">
              {notCheckedInCount}
            </div>
            <span className="text-[11px] text-[#71717A]">Active members pending visit</span>
          </div>
        </div>

        {/* Today's Attendance Table Card */}
        <div className="bg-white rounded-xl border border-black/10 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-black/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-[#1A1A1A]">
                Today&apos;s Attendance Log ({todayAttendanceRecords.length})
              </h3>
              <p className="text-xs text-[#71717A]">Date: {todayStr}</p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#71717A]" />
              <input
                type="text"
                placeholder="Search today's records..."
                value={todayTableSearch}
                onChange={(e) => setTodayTableSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs border border-black/10 bg-[#F8F6F4] text-[#1A1A1A] placeholder:text-[#A1A1AA] focus:outline-none focus:ring-1 focus:ring-[#C41E3A] focus:bg-white"
              />
            </div>
          </div>

          {todayAttendanceRecords.length === 0 ? (
            <div className="py-12 text-center text-[#71717A] text-xs">
              No check-ins recorded today yet. Verify a member above to log attendance.
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8F6F4] text-[#71717A] font-semibold border-b border-black/10 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Member</th>
                      <th className="py-3 px-4">Member ID</th>
                      <th className="py-3 px-4">Check-in Time</th>
                      <th className="py-3 px-4">Membership Status</th>
                      <th className="py-3 px-4">Expiry Countdown</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5 text-[#1A1A1A]">
                    {todayAttendanceRecords
                      .filter((rec) => {
                        if (!todayTableSearch.trim()) return true;
                        const q = todayTableSearch.toLowerCase();
                        return rec.memberName.toLowerCase().includes(q) || rec.memberId.toLowerCase().includes(q);
                      })
                      .map((rec) => {
                        const m = members.find((mem) => mem.id === rec.memberId || mem.memberId === rec.memberId);
                        const countdown = m ? calculateMembershipCountdown(m.expiryDate) : null;

                        return (
                          <tr key={rec.id} className="hover:bg-black/[0.02]">
                            <td className="py-3 px-4 font-semibold text-[#1A1A1A]">
                              {rec.memberName}
                            </td>
                            <td className="py-3 px-4 font-mono text-[11px] text-[#71717A]">
                              {m ? m.memberId : rec.memberId}
                            </td>
                            <td className="py-3 px-4 font-mono font-medium text-emerald-700">
                              {rec.checkInTime}
                            </td>
                            <td className="py-3 px-4">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                Active
                              </span>
                            </td>
                            <td className="py-3 px-4 font-medium text-[#71717A]">
                              {countdown ? countdown.remainingDaysText : 'Verified'}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden divide-y divide-black/5">
                {todayAttendanceRecords
                  .filter((rec) => {
                    if (!todayTableSearch.trim()) return true;
                    const q = todayTableSearch.toLowerCase();
                    return rec.memberName.toLowerCase().includes(q) || rec.memberId.toLowerCase().includes(q);
                  })
                  .map((rec) => {
                    const m = members.find((mem) => mem.id === rec.memberId || mem.memberId === rec.memberId);
                    const countdown = m ? calculateMembershipCountdown(m.expiryDate) : null;

                    return (
                      <div key={rec.id} className="p-3.5 flex items-center justify-between gap-3">
                        <div>
                          <h4 className="font-semibold text-xs text-[#1A1A1A]">{rec.memberName}</h4>
                          <span className="font-mono text-[11px] text-[#71717A]">{m ? m.memberId : rec.memberId}</span>
                          {countdown && (
                            <span className="block text-[10px] text-emerald-700 font-medium mt-0.5">
                              {countdown.remainingDaysText}
                            </span>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <span className="inline-block px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono font-bold text-xs">
                            {rec.checkInTime}
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION: IRREGULAR & INACTIVE MEMBERS (>7 DAYS ABSENT) */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-xl border border-black/10 shadow-2xs p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/10 pb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              irregularMembers.length > 0
                ? 'bg-amber-100 text-amber-700 border border-amber-200'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}>
              {irregularMembers.length > 0 ? (
                <AlertTriangle className="w-5 h-5" />
              ) : (
                <UserCheck className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-[#1A1A1A] font-['Playfair_Display']">
                  Irregular Members Alert (&gt;7 Days Inactive)
                </h3>
                {irregularMembers.length > 0 ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                    {irregularMembers.length} At-Risk
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    All Regular
                  </span>
                )}
              </div>
              <p className="text-xs text-[#71717A] mt-0.5">
                Active athletes who haven&apos;t checked in for more than 7 consecutive days. Reach out to re-engage them.
              </p>
            </div>
          </div>
        </div>

        {irregularMembers.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#71717A] bg-[#F8F6F4] rounded-xl border border-black/5">
            <UserCheck className="w-8 h-8 text-emerald-600 mx-auto mb-2 opacity-80" />
            <p className="font-semibold text-emerald-900">Zero Inactive Members!</p>
            <p className="text-[11px] text-[#71717A] mt-0.5">
              Every active athlete has checked in within the last 7 days. Consistency is at 100%.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {irregularMembers.map(({ member: m, daysAbsent, lastCheckInDate }) => (
              <div
                key={m.id}
                className="p-4 rounded-xl bg-[#F8F6F4] border border-amber-200/80 hover:border-amber-400 transition-all shadow-2xs flex flex-col justify-between gap-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    {m.photo ? (
                      <img
                        src={m.photo}
                        alt={m.fullName}
                        className="w-10 h-10 rounded-xl object-cover border border-black/10 shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 border border-amber-200 flex items-center justify-center font-bold text-sm shrink-0">
                        {m.fullName.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-xs text-[#1A1A1A] leading-tight">{m.fullName}</h4>
                      <p className="font-mono text-[11px] text-[#71717A]">{m.memberId}</p>
                      <p className="text-[10px] text-[#71717A]">{m.plan} • {m.remainingDaysText}</p>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300 font-bold text-[11px] shrink-0 whitespace-nowrap">
                    {daysAbsent} days absent
                  </span>
                </div>

                <div className="text-[11px] text-[#666666] bg-white p-2 rounded-lg border border-black/5">
                  <span className="font-semibold text-[#1A1A1A]">Last Activity: </span>
                  {lastCheckInDate ? (
                    <span>Last checked in on {formatFriendlyDate(lastCheckInDate)}</span>
                  ) : (
                    <span>No check-ins recorded since joining ({formatFriendlyDate(m.joinDate)})</span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 pt-1 border-t border-black/5">
                  <button
                    onClick={() => handleInspectIrregularMember(m.id)}
                    className="flex-1 px-2.5 py-1.5 rounded-lg bg-white hover:bg-neutral-100 border border-black/10 text-xs font-semibold text-[#1A1A1A] flex items-center justify-center gap-1 transition-colors"
                    title="View Monthly Calendar"
                  >
                    <Calendar className="w-3.5 h-3.5 text-[#71717A]" />
                    <span>Inspect</span>
                  </button>

                  <button
                    onClick={() => handleWhatsAppIrregular(m, daysAbsent)}
                    className="flex-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1 transition-colors shadow-2xs"
                    title="Send WhatsApp Follow-up"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>

                  <a
                    href={`tel:${m.mobile}`}
                    className="p-1.5 rounded-lg bg-white hover:bg-neutral-100 border border-black/10 text-[#71717A] hover:text-[#1A1A1A] transition-colors"
                    title={`Call ${m.fullName}`}
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SECTION 3: MEMBER ATTENDANCE HISTORY */}
      {/* ========================================================================= */}
      <div id="member-attendance-history-section" className="bg-white rounded-xl border border-black/10 shadow-2xs p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-black/10 pb-4">
          <div>
            <h3 className="text-lg font-bold text-[#1A1A1A] font-['Playfair_Display']">
              Member Attendance History
            </h3>
            <p className="text-xs text-[#71717A] mt-0.5">
              Select a member and view their monthly attendance frequency and present days.
            </p>
          </div>

          {/* Select & Search Member Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="flex items-center gap-1.5 flex-1 sm:flex-none">
              <label className="text-xs font-semibold text-[#71717A] shrink-0">Member:</label>
              <div className="relative flex-1 sm:w-56">
                <Search className="w-3.5 h-3.5 text-[#71717A] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={historySearchQuery}
                  onChange={(e) => setHistorySearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleHistorySearch();
                    }
                  }}
                  placeholder="Search name, ID or mobile..."
                  className="w-full pl-8 pr-7 py-1.5 rounded-lg text-xs border border-black/10 bg-[#F8F6F4] text-[#1A1A1A] placeholder:text-[#999999] focus:outline-none focus:ring-1 focus:ring-[#C41E3A]"
                />
                {historySearchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setHistorySearchQuery('');
                      setHistorySearchFeedback(null);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleHistorySearch()}
                className="px-3 py-1.5 rounded-lg bg-[#C41E3A] hover:bg-[#a81830] text-white text-xs font-bold flex items-center gap-1 transition-colors shrink-0 shadow-2xs"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Search</span>
              </button>
            </div>

            {/* Select Member Dropdown */}
            <select
              value={selectedMemberIdForHistory}
              onChange={(e) => {
                setSelectedMemberIdForHistory(e.target.value);
                const found = members.find((m) => m.id === e.target.value);
                if (found) {
                  setHistorySearchFeedback(`Selected: ${found.fullName}`);
                  setTimeout(() => setHistorySearchFeedback(null), 2500);
                }
              }}
              className="px-3 py-1.5 rounded-lg text-xs border border-black/10 bg-[#F8F6F4] text-[#1A1A1A] font-medium focus:outline-none focus:ring-1 focus:ring-[#C41E3A]"
            >
              {filteredHistoryMembers.length === 0 ? (
                <option value="" disabled>No matching members</option>
              ) : (
                filteredHistoryMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.fullName} ({m.memberId})
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        {historySearchFeedback && (
          <div className={`px-3 py-2 rounded-lg text-xs font-semibold ${
            historySearchFeedback.includes('No member') || historySearchFeedback.includes('Please enter')
              ? 'bg-amber-50 text-amber-800 border border-amber-200'
              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
          }`}>
            {historySearchFeedback}
          </div>
        )}

        {selectedMember && (
          <div className="space-y-6">
            {/* Selected Member Header Card */}
            <div className="p-4 rounded-xl bg-[#F8F6F4] border border-black/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {selectedMember.photo ? (
                  <img
                    src={selectedMember.photo}
                    alt={selectedMember.fullName}
                    className="w-12 h-12 rounded-xl object-cover border border-black/10 shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-black/5 border border-black/10 flex items-center justify-center font-bold text-base text-[#1A1A1A] shrink-0">
                    {selectedMember.fullName.charAt(0)}
                  </div>
                )}
                <div>
                  <h4 className="text-base font-bold text-[#1A1A1A]">{selectedMember.fullName}</h4>
                  <p className="text-xs text-[#71717A] mt-0.5">
                    Plan: <span className="font-semibold text-[#1A1A1A]">{selectedMember.plan}</span> • Expiry:{' '}
                    <span className="font-semibold text-[#1A1A1A]">{selectedMember.expiryDate}</span> ({selectedMember.remainingDaysText})
                  </p>
                </div>
              </div>

              {/* Monthly percentage */}
              {monthStats && (
                <div className="flex items-center gap-6 self-start sm:self-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-black/5">
                  <div className="text-center">
                    <span className="text-[10px] uppercase font-semibold text-[#71717A] block">
                      Present Days
                    </span>
                    <span className="text-lg font-bold text-emerald-700">{monthStats.presentCount}</span>
                  </div>
                  <div className="text-center">
                    <span className="text-[10px] uppercase font-semibold text-[#71717A] block">
                      Absent Days
                    </span>
                    <span className="text-lg font-bold text-[#71717A]">{monthStats.absentCount}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-semibold text-[#71717A] block">
                      Attendance Rate
                    </span>
                    <span className="text-2xl font-bold font-['Playfair_Display'] text-emerald-700">
                      {monthStats.percentage}%
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Month Selector Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1.5 rounded-lg border border-black/10 text-[#71717A] hover:text-[#1A1A1A] hover:bg-black/5"
                  title="Previous month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm font-bold text-[#1A1A1A]">
                  {monthName} {historyYear}
                </span>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1.5 rounded-lg border border-black/10 text-[#71717A] hover:text-[#1A1A1A] hover:bg-black/5"
                  title="Next month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <span className="text-xs text-[#71717A]">
                Attendance tracking starts from admission date ({selectedMember.joinDate || 'enrollment'}). Pre-admission and future days are not counted as absences.
              </span>
            </div>

            {/* Monthly Calendar Grid */}
            {monthStats && (
              <div className="space-y-3">
                <div className="grid grid-cols-7 gap-1 sm:gap-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                    <div
                      key={d}
                      className="text-center text-[9px] sm:text-[10px] font-semibold text-[#71717A] uppercase py-1"
                    >
                      {d}
                    </div>
                  ))}

                  {Array.from({ length: monthStats.daysInMonth }, (_, i) => {
                    const dayNum = i + 1;
                    const isPresent = monthStats.presentDays.has(dayNum);
                    const isPreJoin = monthStats.isBeforeJoinMonth || dayNum < monthStats.minEvalDay;
                    const isFuture = dayNum > monthStats.maxEvalDay;
                    const isEvaluated = !isPreJoin && !isFuture;
                    const isToday =
                      currentDate.getFullYear() === historyYear &&
                      currentDate.getMonth() + 1 === historyMonth &&
                      currentDate.getDate() === dayNum;

                    return (
                      <div
                        key={dayNum}
                        className={`p-1 sm:p-2 rounded-lg border text-center transition-all flex flex-col justify-between aspect-square ${
                          isPresent
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-semibold'
                            : isEvaluated
                            ? 'bg-[#F8F6F4] border-black/5 text-[#71717A]'
                            : 'bg-white border-dashed border-black/10 text-[#A1A1AA]'
                        } ${isToday ? 'ring-2 ring-[#C41E3A]' : ''}`}
                      >
                        <div className="flex items-center justify-between text-[8px] sm:text-[10px]">
                          <span>{dayNum}</span>
                          {isToday && (
                            <span className="hidden sm:inline text-[9px] font-bold text-[#C41E3A]">Today</span>
                          )}
                        </div>

                        <div className="my-auto">
                          {isPresent ? (
                            <span className="text-[8px] sm:text-[10px] font-bold text-emerald-700 block truncate">
                              ✓<span className="hidden sm:inline"> Present</span>
                            </span>
                          ) : isEvaluated ? (
                            <span className="text-[8px] sm:text-[9px] text-[#A1A1AA]">Absent</span>
                          ) : (
                            <span className="text-[8px] sm:text-[9px] text-[#D4D4D8]">—</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-[#71717A] pt-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-400" />
                    <span>Present</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-[#F8F6F4] border border-black/10" />
                    <span>Absent</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-white border border-dashed border-black/20" />
                    <span>Pre-Admission / Upcoming Date</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
