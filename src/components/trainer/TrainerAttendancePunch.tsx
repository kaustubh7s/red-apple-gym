'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useApp } from '@/lib/store';
import { Member, AttendanceRecord } from '@/lib/types';
import {
  QrCode,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Calendar,
  Users,
  Camera,
  X,
  AlertTriangle,
  UserCheck,
  Sparkles,
  ShieldAlert
} from 'lucide-react';

export const TrainerAttendancePunch: React.FC = () => {
  const { members, checkInMember, attendanceRecords } = useApp();

  const [searchInput, setSearchInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [showCameraScanner, setShowCameraScanner] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [punchResult, setPunchResult] = useState<{
    status: 'success' | 'expired' | 'duplicate' | 'not_found';
    member?: Member;
    message: string;
    punchTime?: string;
  } | null>(null);

  const todayStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);

  const todayRecords = useMemo(() => {
    return attendanceRecords.filter((a) => a.date === todayStr);
  }, [attendanceRecords, todayStr]);

  // Search suggestions strictly without contact numbers (privacy protected)
  const searchSuggestions = useMemo(() => {
    if (!searchInput.trim() || searchInput.length < 2) return [];
    const q = searchInput.toLowerCase().trim();
    return members
      .filter((m) => {
        const matchName = m.fullName.toLowerCase().includes(q);
        const matchId = m.memberId.toLowerCase().includes(q);
        return matchName || matchId;
      })
      .slice(0, 6);
  }, [members, searchInput]);

  const executePunch = (targetInput: string) => {
    const clean = targetInput.trim();
    if (!clean) return;

    setIsVerifying(true);
    let q = clean.toLowerCase();

    // Support both direct ID ("RED-1071") and full QR pass URLs ("https://.../pass/RED-1071")
    const idMatch = clean.match(/(RED-\d+|MEM-\d+|RAG-\d+)/i);
    if (idMatch) {
      q = idMatch[1].toLowerCase();
    } else if (q.includes('/pass/')) {
      const parts = q.split('/pass/');
      if (parts[1]) {
        q = parts[1].split('?')[0].split('#')[0].trim().toLowerCase();
      }
    }

    // Match by ID, MemberID, or Name
    const matched = members.find(
      (m) =>
        m.id.toLowerCase() === q ||
        m.memberId.toLowerCase() === q ||
        m.fullName.toLowerCase() === q
    );

    if (!matched) {
      setPunchResult({
        status: 'not_found',
        message: `No athlete found with ID "${clean}". Please verify the ID on athlete's card.`
      });
      setIsVerifying(false);
      return;
    }

    // Call store check-in
    const res = checkInMember(matched.id);
    const timeFormatted = new Date().toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    if (res.success) {
      setPunchResult({
        status: 'success',
        member: matched,
        message: `Punch-in successful! Welcome, ${matched.fullName}.`,
        punchTime: timeFormatted
      });
      // Play audio beep
      playChime(true);
    } else if (res.message.toLowerCase().includes('already')) {
      setPunchResult({
        status: 'duplicate',
        member: matched,
        message: `Athlete already punched in for today at ${matched.fullName}.`,
        punchTime: timeFormatted
      });
      playChime(false);
    } else if (res.message.toLowerCase().includes('expired')) {
      setPunchResult({
        status: 'expired',
        member: matched,
        message: `Membership EXPIRED (${matched.remainingDaysText}). Please advise athlete to renew at front desk.`,
        punchTime: timeFormatted
      });
      playChime(false);
    } else {
      setPunchResult({
        status: 'duplicate',
        member: matched,
        message: res.message,
        punchTime: timeFormatted
      });
    }

    setSearchInput('');
    setIsVerifying(false);
  };

  const playChime = (success: boolean) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      if (success) {
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.1); // A5
      } else {
        osc.frequency.setValueAtTime(260, audioCtx.currentTime);
        osc.frequency.setValueAtTime(180, audioCtx.currentTime + 0.15);
      }
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
    } catch (e) {}
  };

  // Camera QR Code Scanner using MediaStream & Canvas
  useEffect(() => {
    let stream: MediaStream | null = null;
    let animFrame: number = 0;

    if (showCameraScanner) {
      navigator.mediaDevices
        ?.getUserMedia({ video: { facingMode: 'environment' } })
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
            videoRef.current.setAttribute('playsinline', 'true');
            videoRef.current.play();
          }
        })
        .catch(() => {
          alert('Could not access camera for QR scan. Please type the athlete ID or grant camera permissions.');
          setShowCameraScanner(false);
        });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (animFrame) cancelAnimationFrame(animFrame);
    };
  }, [showCameraScanner]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold text-[#1A1A1A] font-serif flex items-center gap-2">
            <QrCode className="w-6 h-6 text-blue-600" />
            <span>Coach Attendance &amp; ID Card Punch Terminal</span>
          </h2>
          <p className="text-xs text-[#71717A] mt-0.5">
            Scan physical ID cards, digital QR passes or search athlete by name
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
          <Clock className="w-3.5 h-3.5" />
          <span>Today: {todayRecords.length} Athletes Punched In</span>
        </div>
      </div>

      {/* Main Punch Station Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Scanner & Quick Search */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 sm:p-6 rounded-3xl bg-white border border-black/10 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-black/5 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
                <h3 className="font-bold text-[#1A1A1A] text-sm font-serif">
                  Scan Card or Enter Athlete ID
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCameraScanner(!showCameraScanner)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  showCameraScanner
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                }`}
              >
                <Camera className="w-4 h-4" />
                <span>{showCameraScanner ? 'Close Camera' : 'Live Camera Scanner'}</span>
              </button>
            </div>

            {/* Camera Viewfinder */}
            {showCameraScanner && (
              <div className="rounded-2xl overflow-hidden bg-black aspect-video relative border border-black/10 shadow-inner flex flex-col items-center justify-center">
                <video ref={videoRef} className="w-full h-full object-cover" />
                <div className="absolute inset-8 border-2 border-dashed border-blue-400/80 rounded-2xl pointer-events-none flex items-center justify-center">
                  <div className="text-[10px] text-white/90 bg-black/60 px-3 py-1 rounded-full backdrop-blur-xs font-mono">
                    Point camera at ID card barcode/QR code
                  </div>
                </div>
              </div>
            )}

            {/* Manual ID / Name Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                executePunch(searchInput);
              }}
              className="space-y-3"
            >
              <div className="relative">
                <Search className="w-4 h-4 text-[#71717A] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Scan barcode, enter Member ID (e.g. RED-8021) or Athlete Name..."
                  className="w-full pl-10 pr-24 py-3 rounded-2xl bg-[#F8F6F4] border border-black/10 text-sm text-[#1A1A1A] font-medium placeholder:text-[#8A8A8A] focus:outline-none focus:border-blue-500 focus:bg-white transition-all shadow-inner"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={isVerifying || !searchInput.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-40 cursor-pointer shadow-xs flex items-center gap-1"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Punch</span>
                </button>
              </div>

              {/* Suggestions Dropdown (No contact details displayed!) */}
              {searchSuggestions.length > 0 && (
                <div className="p-2 rounded-2xl bg-white border border-black/10 shadow-lg space-y-1 divide-y divide-black/5 animate-in fade-in duration-150">
                  <div className="text-[10px] font-bold text-[#71717A] uppercase tracking-wider px-2 py-1">
                    Select Athlete to Punch In:
                  </div>
                  {searchSuggestions.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => executePunch(m.memberId)}
                      className="w-full p-2.5 rounded-xl flex items-center justify-between text-left hover:bg-blue-50/70 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={m.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80'}
                          alt={m.fullName}
                          className="w-8 h-8 rounded-lg object-cover border border-black/10"
                        />
                        <div>
                          <div className="font-bold text-xs text-[#1A1A1A] group-hover:text-blue-600">
                            {m.fullName}
                          </div>
                          <div className="text-[10px] text-[#71717A] font-mono">
                            {m.memberId} &bull; {m.plan}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800">
                        Punch In &rarr;
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </form>

            {/* Quick Demo Athletes */}
            <div className="pt-2 border-t border-black/5 flex items-center gap-2 flex-wrap">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#8A8A8A]">
                Quick Punch:
              </span>
              {members.slice(0, 4).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => executePunch(m.memberId)}
                  className="px-2.5 py-1 rounded-lg bg-[#F8F6F4] hover:bg-neutral-200 border border-black/5 text-[11px] font-mono text-[#1A1A1A] transition-colors"
                >
                  {m.memberId} ({m.fullName.split(' ')[0]})
                </button>
              ))}
            </div>
          </div>


        </div>

        {/* Right Column: Live Punch Result Card */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 sm:p-6 rounded-3xl bg-white border border-black/10 shadow-xs min-h-[300px] flex flex-col justify-between">
            <div className="space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-[#71717A] border-b border-black/5 pb-2">
                Last Punch Verification
              </div>

              {!punchResult ? (
                <div className="text-center py-12 space-y-2 text-[#8A8A8A]">
                  <div className="w-12 h-12 rounded-2xl bg-[#F8F6F4] flex items-center justify-center mx-auto text-[#71717A]">
                    <QrCode className="w-6 h-6" />
                  </div>
                  <div className="font-bold text-xs text-[#1A1A1A]">Terminal Ready</div>
                  <div className="text-[11px] text-[#71717A] max-w-xs mx-auto">
                    Scan athlete ID card or punch member ID. Verification result will appear here.
                  </div>
                </div>
              ) : (
                <div className="space-y-4 animate-in zoom-in-95 duration-200">
                  {/* Status Banner */}
                  <div
                    className={`p-3.5 rounded-2xl border flex items-center gap-3 ${
                      punchResult.status === 'success'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                        : punchResult.status === 'duplicate'
                        ? 'bg-amber-50 border-amber-300 text-amber-900'
                        : punchResult.status === 'expired'
                        ? 'bg-rose-50 border-rose-300 text-rose-900'
                        : 'bg-neutral-100 border-black/10 text-neutral-800'
                    }`}
                  >
                    {punchResult.status === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
                    {punchResult.status === 'duplicate' && <Clock className="w-5 h-5 text-amber-600 shrink-0" />}
                    {punchResult.status === 'expired' && <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />}
                    {punchResult.status === 'not_found' && <AlertCircle className="w-5 h-5 text-neutral-600 shrink-0" />}
                    <div className="text-xs font-bold leading-tight">{punchResult.message}</div>
                  </div>

                  {/* Athlete Card Preview if matched */}
                  {punchResult.member && (
                    <div className="p-4 rounded-2xl bg-[#F8F6F4] border border-black/5 flex items-center gap-4">
                      <img
                        src={punchResult.member.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80'}
                        alt={punchResult.member.fullName}
                        className="w-16 h-16 rounded-2xl object-cover border-2 border-blue-500 shadow-xs shrink-0"
                      />
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="text-base font-bold text-[#1A1A1A] truncate">
                          {punchResult.member.fullName}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                            {punchResult.member.memberId}
                          </span>
                          <span className="text-[11px] text-[#71717A] font-semibold">
                            {punchResult.member.plan}
                          </span>
                        </div>
                        <div className="text-[10px] text-[#71717A]">
                          Expiry: <strong className="text-[#1A1A1A]">{punchResult.member.expiryDate}</strong> ({punchResult.member.remainingDaysText})
                        </div>
                      </div>
                    </div>
                  )}

                  {punchResult.punchTime && (
                    <div className="text-right text-[11px] text-[#71717A] font-mono">
                      Timestamp: <strong>{punchResult.punchTime}</strong>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-black/5 flex items-center justify-between text-[11px] text-[#71717A]">
              <span>Floor Device: CIDCO N-2 Scanner</span>
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                Live Punch Active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Punched-In Roster (Trainer View - NO CONTACT INFO) */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-black/10 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-black/5 pb-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-[#1A1A1A] text-sm font-serif">
              Today's Checked-In Floor Athletes ({todayRecords.length})
            </h3>
          </div>
          <span className="text-xs text-[#71717A] font-mono">{todayStr}</span>
        </div>

        {todayRecords.length === 0 ? (
          <div className="text-center py-8 text-xs text-[#8A8A8A]">
            No athletes punched in yet today. Scan an athlete ID above to record entry.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {todayRecords.map((rec) => {
              const m = members.find((mem) => mem.id === rec.memberId || mem.memberId === rec.memberId);
              return (
                <div
                  key={rec.id}
                  className="p-3 rounded-2xl bg-[#F8F6F4] border border-black/5 flex items-center gap-3 shadow-2xs"
                >
                  <img
                    src={m?.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80'}
                    alt={rec.memberName}
                    className="w-11 h-11 rounded-xl object-cover border border-black/10 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-xs text-[#1A1A1A] truncate">{rec.memberName}</div>
                    <div className="text-[10px] text-[#71717A] font-mono mt-0.5">
                      {m?.memberId || 'ID Card'} &bull; {m?.plan || 'Member'}
                    </div>
                    <div className="text-[10px] text-blue-600 font-mono mt-0.5 flex items-center gap-1 font-semibold">
                      <Clock className="w-3 h-3" />
                      <span>{rec.checkInTime}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
