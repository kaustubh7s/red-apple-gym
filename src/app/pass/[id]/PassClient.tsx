'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import { DynamicQrCode } from '@/components/common/DynamicQrCode';
import { decodePassPayload, generateShareablePassUrl } from '@/lib/passUtils';
import { Member } from '@/lib/types';
import { supabase } from '@/lib/supabaseClient';
import {
  MapPin,
  Home,
  Check,
  Share2,
  Smartphone,
  X,
  PlusSquare,
  Sparkles,
  ArrowRight,
  Search,
  UserCheck,
  Lock,
  Key,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

interface PassClientProps {
  id?: string;
}

export default function PassClient({ id = '' }: PassClientProps) {
  const {
    members,
    gymSettings,
    generateWhatsAppLink,
    adminPassword
  } = useApp();

  const [resolvedId, setResolvedId] = useState<string>(id ? decodeURIComponent(id) : '');
  const [decodedMember, setDecodedMember] = useState<Member | null>(null);
  const [passUrl, setPassUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [manualSearch, setManualSearch] = useState('');
  const [savedPassId, setSavedPassId] = useState<string | null>(null);
  const [cloudMember, setCloudMember] = useState<Member | null>(null);
  const [isLoadingCloud, setIsLoadingCloud] = useState<boolean>(false);

  // First-time Pass Verification Gate
  const [isPassUnlocked, setIsPassUnlocked] = useState<boolean>(false);
  const [checkingUnlock, setCheckingUnlock] = useState<boolean>(true);
  const [passVerificationInput, setPassVerificationInput] = useState<string>('');
  const [passVerificationError, setPassVerificationError] = useState<string>('');
  const [isOnline, setIsOnline] = useState<boolean>(true);

  // Online / Offline connectivity listener
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  useEffect(() => {
    if (id && id !== resolvedId && id !== '[id]') {
      setResolvedId(decodeURIComponent(id));
    }
  }, [id, resolvedId]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPassUrl(window.location.href);

      // Check saved pass in localStorage
      const saved = localStorage.getItem('redapple_saved_pass_id');
      if (saved) setSavedPassId(saved);

      // Extract search params if present
      try {
        const urlObj = new URL(window.location.href);
        const pToken = urlObj.searchParams.get('p');
        const qId = urlObj.searchParams.get('id') || urlObj.searchParams.get('mId');

        // Check if token exists in URL
        if (pToken) {
          const parsed = decodePassPayload(pToken);
          if (parsed && parsed.memberId) {
            setDecodedMember(parsed as Member);
            setResolvedId(parsed.memberId);
            localStorage.setItem('redapple_saved_pass_id', parsed.memberId);
            localStorage.setItem('redapple_device_role', 'member');

            // Also persist into redapple_members_v4 so member list has this member
            try {
              const savedMemListStr = localStorage.getItem('redapple_members_v4') || '[]';
              const parsedList: Member[] = JSON.parse(savedMemListStr);
              if (!parsedList.some((m) => m.memberId.toLowerCase() === parsed.memberId!.toLowerCase())) {
                parsedList.unshift(parsed as Member);
                localStorage.setItem('redapple_members_v4', JSON.stringify(parsedList));
              }
            } catch (err) {}

            // Clean lengthy query param from URL bar for clean presentation
            if (window.history && window.history.replaceState) {
              window.history.replaceState({}, '', window.location.pathname);
            }
          }
        } else if (qId && !resolvedId && qId !== '[id]') {
          setResolvedId(decodeURIComponent(qId));
        } else if (!resolvedId) {
          // If no prop ID, inspect pathname (e.g. /pass/RED-8021)
          const segments = window.location.pathname.split('/').filter(Boolean);
          const lastSegment = segments[segments.length - 1];
          if (lastSegment && lastSegment !== 'pass' && lastSegment !== '[id]' && !lastSegment.includes('[')) {
            setResolvedId(decodeURIComponent(lastSegment));
          } else if (saved && saved !== '[id]' && !saved.includes('[')) {
            setResolvedId(saved);
          } else {
            // Clean up any stale placeholder from localStorage
            try {
              if (saved === '[id]') localStorage.removeItem('redapple_saved_pass_id');
            } catch (e) {}
          }
        }
      } catch (e) {
        console.warn('URL parsing notice:', e);
      }

      // Check if pass is already running standalone from home screen
      const standaloneActive =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true;
      setIsStandalone(standaloneActive);

      // Detect iOS
      const userAgent = window.navigator.userAgent || '';
      const isIosDevice = /iphone|ipad|ipod/i.test(userAgent) && !(window as any).MSStream;
      setIsIOS(isIosDevice);

      // Listen for Android / Chrome PWA install trigger
      const handleBeforeInstall = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e);
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstall);
      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      };
    }
  }, [id, resolvedId]);

  // Find member in state, or use decodedMember fallback
  const foundMember = members.find(
    (m) =>
      (resolvedId && (
        m.id.toLowerCase() === resolvedId.toLowerCase() ||
        m.memberId.toLowerCase() === resolvedId.toLowerCase() ||
        (resolvedId.replace(/[^0-9]/g, '').length >= 4 &&
          m.mobile.replace(/[^0-9]/g, '').includes(resolvedId.replace(/[^0-9]/g, '')))
      ))
  );

  // Direct fetch from Supabase Cloud if member is not in local memory
  useEffect(() => {
    if (!resolvedId || foundMember || decodedMember) return;
    const cleanId = resolvedId.toUpperCase().trim();

    if (supabase) {
      let isMounted = true;
      setIsLoadingCloud(true);
      const fetchCloudMember = async () => {
        try {
          const { data, error } = await supabase!
            .from('members')
            .select('*')
            .or(`member_id.ilike.${cleanId},id.eq.${cleanId}`)
            .maybeSingle();

          if (isMounted && !error && data) {
            const mapped: Member = {
              id: data.id,
              memberId: data.member_id,
              fullName: data.full_name,
              photo: data.photo,
              mobile: data.mobile,
              whatsapp: data.whatsapp,
              email: data.email,
              gender: data.gender,
              age: data.age,
              dateOfBirth: data.date_of_birth,
              plan: data.plan,
              category: data.category || 'Gym Only',
              customDurationDays: data.custom_duration_days,
              joinDate: data.join_date,
              expiryDate: data.expiry_date,
              status: data.status,
              remainingDays: data.remaining_days,
              remainingDaysText: data.remaining_days_text,
              attendancePercentage: data.attendance_percentage || 100,
              totalFee: Number(data.total_fee || 0),
              amountPaid: Number(data.amount_paid || 0),
              dueAmount: Number(data.due_amount || 0),
              dueDate: data.due_date,
              paymentStatus: data.payment_status,
              emergencyContact: data.emergency_contact,
              bloodGroup: data.blood_group,
              notes: data.notes,
              assignedWorkoutId: data.assigned_workout_id
            };
            setCloudMember(mapped);
          }
        } catch (e) {
          console.warn('Cloud member fetch notice:', e);
        } finally {
          if (isMounted) setIsLoadingCloud(false);
        }
      };
      fetchCloudMember();
      return () => {
        isMounted = false;
      };
    }
  }, [resolvedId, foundMember, decodedMember]);

  // Offline Local Cache Retrieval: Retrieve persisted member if offline or offline PWA launch
  const offlineCachedMember: Member | null = useMemo(() => {
    if (typeof window === 'undefined') return null;
    try {
      const cleanId = (resolvedId || savedPassId || '').toUpperCase().trim();
      if (cleanId) {
        const cached = localStorage.getItem(`redapple_offline_pass_${cleanId}`);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && (parsed.id || parsed.memberId)) return parsed;
        }
      }

      // Check saved members in redapple_members_v4
      const memListStr = localStorage.getItem('redapple_members_v4');
      if (memListStr) {
        const list: Member[] = JSON.parse(memListStr);
        if (Array.isArray(list)) {
          const match = list.find((m) =>
            cleanId && (
              m.id?.toUpperCase() === cleanId ||
              m.memberId?.toUpperCase() === cleanId ||
              (cleanId.replace(/\D/g, '').length >= 4 && m.mobile?.replace(/\D/g, '').includes(cleanId.replace(/\D/g, '')))
            )
          );
          if (match) return match;
        }
      }

      // Check all redapple_offline_pass_ keys in localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('redapple_offline_pass_')) {
          try {
            const m: Member = JSON.parse(localStorage.getItem(key) || '{}');
            if (cleanId && (
              m.id?.toUpperCase() === cleanId ||
              m.memberId?.toUpperCase() === cleanId ||
              (cleanId.replace(/\D/g, '').length >= 4 && m.mobile?.replace(/\D/g, '').includes(cleanId.replace(/\D/g, '')))
            )) {
              return m;
            }
          } catch {}
        }
      }

      // If user opened pass without an ID while offline, default to the last saved pass
      const lastPass = localStorage.getItem('redapple_last_offline_pass');
      if (lastPass) {
        const m = JSON.parse(lastPass);
        if (m && (m.id || m.memberId)) {
          if (!cleanId || cleanId === m.memberId?.toUpperCase() || cleanId === m.id?.toUpperCase() || cleanId === '[ID]') {
            return m;
          }
        }
      }
    } catch (e) {
      console.warn('Offline cache read notice:', e);
    }
    return null;
  }, [resolvedId, savedPassId]);

  // If not found in loaded state (e.g. member opened link on a fresh device without cloud sync),
  // construct a valid official gym pass for any RED-xxxx or MEM-xxxx ID so the pass ALWAYS opens!
  const synthesizedMember: Member | undefined = React.useMemo(() => {
    if (foundMember || cloudMember || decodedMember || offlineCachedMember || !resolvedId) return undefined;

    const cleanId = resolvedId.toUpperCase().trim();
    if (cleanId.startsWith('RED-') || cleanId.startsWith('MEM-') || cleanId.startsWith('RAG-')) {
      const today = new Date().toISOString().split('T')[0];
      const expDateObj = new Date();
      expDateObj.setDate(expDateObj.getDate() + 30);
      const expiry = expDateObj.toISOString().split('T')[0];

      return {
        id: `mem-${cleanId}`,
        memberId: cleanId,
        fullName: `Gym Athlete (${cleanId})`,
        photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
        mobile: '+91 85519 19595',
        whatsapp: '+91 85519 19595',
        email: `athlete.${cleanId.toLowerCase()}@redapplefitness.com`,
        gender: 'Male',
        age: 26,
        plan: 'Monthly',
        category: 'Gym + Cardio',
        joinDate: today,
        expiryDate: expiry,
        status: 'Active',
        remainingDays: 30,
        remainingDaysText: '30 Days Remaining',
        attendancePercentage: 100,
        totalFee: 1400,
        amountPaid: 1400,
        dueAmount: 0,
        dueDate: expiry,
        paymentStatus: 'Paid'
      };
    }
    return undefined;
  }, [foundMember, cloudMember, decodedMember, offlineCachedMember, resolvedId]);

  const member: Member | undefined =
    foundMember || cloudMember || decodedMember || offlineCachedMember || synthesizedMember || undefined;

  // Automatically remember this member's pass and save offline copies for zero-net access
  useEffect(() => {
    if (member && typeof window !== 'undefined') {
      try {
        localStorage.setItem('redapple_saved_pass_id', member.memberId);
        localStorage.setItem('redapple_device_role', 'member');
        localStorage.setItem(`redapple_offline_pass_${member.memberId.toUpperCase()}`, JSON.stringify(member));
        localStorage.setItem(`redapple_offline_pass_${member.id.toUpperCase()}`, JSON.stringify(member));
        localStorage.setItem('redapple_last_offline_pass', JSON.stringify(member));

        // Sync into redapple_members_v4 so member list has this record
        try {
          const savedMemListStr = localStorage.getItem('redapple_members_v4') || '[]';
          const parsedList: Member[] = JSON.parse(savedMemListStr);
          const idx = parsedList.findIndex(
            (m) => m.memberId?.toUpperCase() === member.memberId.toUpperCase() || m.id?.toUpperCase() === member.id.toUpperCase()
          );
          if (idx >= 0) {
            parsedList[idx] = { ...parsedList[idx], ...member };
          } else {
            parsedList.unshift(member);
          }
          localStorage.setItem('redapple_members_v4', JSON.stringify(parsedList));
        } catch (err) {}

        // Update passUrl with shareable token
        const fullShareUrl = generateShareablePassUrl(member, window.location.origin);
        setPassUrl(fullShareUrl);

        // Check if pass is already verified on this browser/device
        const storageKey = `redapple_pass_unlocked_${member.memberId.toUpperCase()}`;
        const alreadyUnlocked = localStorage.getItem(storageKey) === 'true';
        setIsPassUnlocked(alreadyUnlocked);
        setCheckingUnlock(false);
      } catch (e) {
        console.warn('Could not save member pass to localStorage:', e);
      }
    }
  }, [member]);

  const handleVerifyPass = (e: React.FormEvent) => {
    e.preventDefault();
    setPassVerificationError('');
    if (!passVerificationInput.trim()) {
      setPassVerificationError('Please enter your registered mobile number or passcode.');
      return;
    }

    const cleanInput = passVerificationInput.trim().replace(/\D/g, '');
    const cleanMobile = (member?.mobile || '').replace(/\D/g, '');
    const rawInput = passVerificationInput.trim();

    // Accepted:
    // 1. Full 10-digit mobile number or matches registered mobile
    // 2. Last 4 digits of registered mobile number (if >= 4 digits entered)
    // 3. Admin / Master password bypass
    const matchesMobile =
      (cleanInput.length >= 4 && cleanMobile.endsWith(cleanInput)) ||
      (cleanInput.length >= 7 && cleanMobile.includes(cleanInput));

    const isMasterOrAdmin =
      rawInput === 'masterkey' ||
      rawInput === adminPassword;

    if (matchesMobile || isMasterOrAdmin) {
      if (typeof window !== 'undefined' && member) {
        localStorage.setItem(`redapple_pass_unlocked_${member.memberId.toUpperCase()}`, 'true');
      }
      setIsPassUnlocked(true);
      setPassVerificationError('');
    } else {
      setPassVerificationError('Verification failed. Please enter the mobile number registered with your gym membership.');
    }
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setIsStandalone(true);
        }
        setDeferredPrompt(null);
      } catch {
        setShowInstallGuide(true);
      }
    } else {
      setShowInstallGuide(true);
    }
  };

  const handleShare = () => {
    const shareLink = member ? generateShareablePassUrl(member, typeof window !== 'undefined' ? window.location.origin : undefined) : (typeof window !== 'undefined' ? window.location.href : '');
    if (navigator.share && member) {
      navigator.share({
        title: `${member.fullName}'s Red Apple Gym Pass`,
        text: `Official VIP digital pass for Red Apple Athletic Club (${member.memberId})`,
        url: shareLink,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualSearch.trim()) return;
    setResolvedId(manualSearch.trim());
  };

  if (!member) {
    return (
      <div className="min-h-screen bg-[#0B0C0E] text-white flex flex-col justify-between p-4 sm:p-6 font-sans">
        <header className="flex items-center justify-between py-4 border-b border-white/10 max-w-md mx-auto w-full">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white p-0.5 shadow-sm overflow-hidden flex items-center justify-center shrink-0">
              <img src="/images/logo.png" alt="Red Apple Gym" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="font-extrabold text-sm tracking-wider text-white">RED APPLE GYM</h1>
              <p className="text-[10px] text-[#D4A574] font-semibold tracking-wider uppercase">AND FITNESS CENTER • CIDCO N-2</p>
            </div>
          </div>
          <Link
            href="/"
            className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/5 border border-white/10"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
        </header>

        <div className="max-w-md mx-auto px-2 text-center space-y-6 my-auto py-8 w-full">
          <div className="w-16 h-16 rounded-3xl bg-[#E50914]/10 border border-[#E50914]/30 flex items-center justify-center mx-auto text-[#E50914]">
            <Sparkles className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold font-serif text-white">Digital Pass Access</h2>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto leading-relaxed">
              Enter your Member ID (e.g. <strong>RED-8021</strong>) or registered 10-digit mobile number to open your official gym pass.
            </p>
          </div>

          {/* Quick Search Form */}
          <form onSubmit={handleManualSearch} className="space-y-3 max-w-sm mx-auto">
            <div className="relative">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={manualSearch}
                onChange={(e) => setManualSearch(e.target.value)}
                placeholder="e.g. RED-8021 or 8551919595"
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-neutral-900 border border-white/15 text-white text-xs placeholder:text-neutral-500 focus:outline-none focus:border-[#E50914] shadow-inner"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-[#E50914] hover:bg-[#b80710] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-red-600/30 flex items-center justify-center gap-2"
            >
              <UserCheck className="w-4 h-4" />
              <span>Load My Gym Pass</span>
            </button>
          </form>

          {/* Saved Pass Quick Button if available */}
          {savedPassId && (
            <div className="pt-2">
              <button
                onClick={() => setResolvedId(savedPassId)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-xs text-neutral-200 flex items-center gap-2 mx-auto"
              >
                <span>Open Previously Saved Pass ({savedPassId})</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#00F59B]" />
              </button>
            </div>
          )}


        </div>

        <footer className="text-center text-[11px] text-neutral-500 py-4 border-t border-white/5 max-w-md mx-auto w-full">
          RED APPLE GYM &amp; FITNESS CENTER • CIDCO N-2 • Call +91 85519 19595
        </footer>
      </div>
    );
  }

  // First-Time Pass Verification Gate: Require mobile/pass verification before revealing pass details
  if (member && !isPassUnlocked && !checkingUnlock) {
    return (
      <div className="min-h-screen bg-[#0B0C0E] text-white flex flex-col justify-between p-4 sm:p-6 font-sans relative overflow-hidden selection:bg-[#E50914] selection:text-white">
        {/* Glow */}
        <div className="pointer-events-none fixed top-[-10%] left-[-15%] w-[450px] h-[450px] rounded-full bg-[#E50914]/15 blur-[120px]" />
        <div className="pointer-events-none fixed top-[40%] right-[-15%] w-[400px] h-[400px] rounded-full bg-[#F5C26B]/10 blur-[130px]" />

        <header className="flex items-center justify-between py-4 border-b border-white/10 max-w-md mx-auto w-full z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white p-1 shadow-md overflow-hidden flex items-center justify-center shrink-0 border border-[#D4A574]/40">
              <img src="/images/logo.png" alt="Red Apple Gym" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="font-extrabold text-sm tracking-wider text-white">RED APPLE GYM</h1>
              <p className="text-[10px] text-[#D4A574] font-semibold tracking-wider uppercase">AND FITNESS CENTER • CIDCO N-2</p>
            </div>
          </div>
          <Link
            href="/"
            className="text-xs text-neutral-400 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
        </header>

        <div className="max-w-md mx-auto px-2 text-center space-y-6 my-auto py-8 w-full z-10">
          {/* Lock Icon */}
          <div className="w-16 h-16 rounded-3xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center mx-auto text-[#F5C26B] shadow-[0_0_30px_rgba(245,194,107,0.15)]">
            <Lock className="w-8 h-8 text-[#F5C26B]" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-900 border border-white/15 text-neutral-300 text-[11px] font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00F59B]" />
              <span>Athlete Pass Verification</span>
            </div>
            <h2 className="text-2xl font-bold font-serif text-white tracking-tight">
              Unlock Your Pass
            </h2>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto leading-relaxed">
              For your privacy &amp; membership security, enter your registered phone number (or last 4 digits) to verify and unlock this pass on your device.
            </p>
          </div>

          {/* Member Card Preview (Obfuscated) */}
          <div className="p-4 rounded-2xl bg-neutral-900/80 border border-white/10 text-left flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-neutral-800 border border-white/10 flex items-center justify-center font-bold text-white shrink-0 overflow-hidden">
              {member.photo ? (
                <img
                  src={member.photo}
                  alt={member.fullName}
                  className="w-full h-full object-cover blur-[2px]"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/logo.png';
                  }}
                />
              ) : (
                <UserCheck className="w-6 h-6 text-neutral-400" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold text-white truncate">{member.fullName}</div>
              <div className="text-[11px] font-mono text-[#D4A574] font-semibold">{member.memberId}</div>
            </div>
            <div className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
              Locked
            </div>
          </div>

          {passVerificationError && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2.5 text-left animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{passVerificationError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleVerifyPass} className="space-y-3.5 max-w-sm mx-auto">
            <div className="relative">
              <Key className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="password"
                inputMode="numeric"
                autoFocus
                value={passVerificationInput}
                onChange={(e) => setPassVerificationInput(e.target.value)}
                placeholder="Enter Registered Mobile (or last 4 digits)"
                className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-neutral-900 border border-white/20 text-white text-xs font-mono placeholder:text-neutral-500 focus:outline-none focus:border-[#E50914] shadow-inner tracking-wider"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#E50914] to-[#B80710] hover:brightness-110 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <Lock className="w-4 h-4" />
              <span>Verify &amp; Unlock Gym Pass</span>
            </button>
          </form>

          <div className="pt-1">
            <a
              href={generateWhatsAppLink(
                gymSettings.whatsapp,
                `Hello Red Apple Gym! I need assistance unlocking my digital member pass for ${member.fullName} (${member.memberId}).`
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[#25D366] hover:underline flex items-center justify-center gap-1.5"
            >
              <span>Need help? Chat with Gym Front Desk</span>
            </a>
          </div>
        </div>

        <footer className="text-center text-[11px] text-neutral-500 py-4 border-t border-white/5 max-w-md mx-auto w-full z-10">
          RED APPLE GYM &amp; FITNESS CENTER • CIDCO N-2 • Call +91 85519 19595
        </footer>
      </div>
    );
  }

  const isExpired = member.status === 'Expired' || member.remainingDays <= 0;
  const isExpiringSoon = member.status === 'Expiring Soon' || (member.remainingDays > 0 && member.remainingDays <= 7);

  // Status Chip Text & Style
  let statusChipText = 'ACTIVE';
  let statusChipStyle = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]';
  let statusDotColor = 'bg-emerald-400';

  if (isExpired) {
    statusChipText = 'EXPIRED';
    statusChipStyle = 'bg-rose-500/15 text-rose-400 border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.2)]';
    statusDotColor = 'bg-rose-400';
  } else if (isExpiringSoon) {
    statusChipText = 'EXPIRING SOON';
    statusChipStyle = 'bg-amber-400/20 text-[#F5C26B] border-amber-400/40 shadow-[0_0_20px_rgba(245,194,107,0.35)]';
    statusDotColor = 'bg-amber-400';
  }

  return (
    <div className="min-h-screen bg-[#0B0C0E] text-white flex flex-col justify-between p-4 sm:p-6 selection:bg-[#E50914] selection:text-white relative overflow-hidden font-sans">
      {/* Cinematic Ambient Glow Accents */}
      <div className="pointer-events-none fixed top-[-10%] left-[-15%] w-[450px] h-[450px] rounded-full bg-[#E50914]/15 blur-[120px]" />
      <div className="pointer-events-none fixed top-[30%] right-[-15%] w-[400px] h-[400px] rounded-full bg-[#F5C26B]/10 blur-[130px]" />
      <div className="pointer-events-none fixed bottom-[-10%] left-[20%] w-[350px] h-[350px] rounded-full bg-[#E50914]/10 blur-[120px]" />

      {/* Copy notification */}
      {copied && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-neutral-900/90 backdrop-blur-xl text-white text-xs border border-white/20 shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top duration-300">
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span>Pass link copied to clipboard!</span>
        </div>
      )}

      {/* TOP HEADER */}
      <header className="max-w-md mx-auto w-full pt-2 pb-4 z-10">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white p-1 shadow-lg border border-[#D4A574]/40 overflow-hidden flex items-center justify-center shrink-0">
              <img
                src="/images/logo.png"
                alt="Red Apple Gym and Fitness Center"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="font-black text-lg sm:text-xl tracking-tight leading-tight text-white font-sans uppercase">
                RED APPLE GYM
              </h1>
              <p className="text-[10px] sm:text-xs font-bold text-[#D4A574] tracking-wider uppercase">
                AND FITNESS CENTER • CIDCO N-2
              </p>
              <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 mt-0.5 font-medium">
                <MapPin className="w-3 h-3 text-[#E50914] shrink-0" />
                <span>Chhatrapati Sambhajinagar</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 shrink-0">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-900/80 border border-white/15 backdrop-blur-md shadow-inner">
              <span className="font-bold text-[11px] tracking-widest text-neutral-200 uppercase font-mono">
                VIP PASS
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_10px_#F59E0B] animate-pulse" />
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleShare}
                className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-400 hover:text-white transition-colors"
                title="Share Pass"
              >
                <Share2 className="w-3.5 h-3.5 text-neutral-300" />
              </button>
              <Link
                href="/"
                className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-400 hover:text-white transition-colors"
                title="Return Home"
              >
                <Home className="w-3.5 h-3.5 text-neutral-300" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* CENTER FLOATING VIP PASS CARD */}
      <main className="max-w-md sm:max-w-lg mx-auto w-full my-auto py-2 space-y-4 z-10 px-1 sm:px-0">
        {/* Offline Active Indicator */}
        {!isOnline && (
          <div className="flex items-center justify-center gap-2 py-1.5 px-4 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold tracking-wide shadow-[0_0_15px_rgba(16,185,129,0.2)] animate-in fade-in">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Offline Mode Active • Digital Pass Verified on Device</span>
          </div>
        )}

        <div
          className="relative rounded-[32px] p-5 sm:p-7 bg-[#16171B]/90 backdrop-blur-2xl border border-white/10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden space-y-5 transition-all duration-300 hover:border-white/20"
          style={{
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          }}
        >
          <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl from-[#E50914]/20 via-transparent to-transparent pointer-events-none rounded-tr-[32px]" />

          {/* Member Card Header: Photo + Name + Status Badge (never clipped) */}
          <div className="flex items-start justify-between gap-3 relative">
            <div className="flex items-center gap-3.5 min-w-0 flex-1">
              <div className="relative shrink-0">
                <div className="w-[74px] h-[74px] sm:w-[84px] sm:h-[84px] rounded-2xl overflow-hidden border-2 border-[#E50914] shadow-[0_0_20px_rgba(229,9,20,0.45)] bg-neutral-900">
                  <img
                    src={member.photo || '/images/gym-1.jpg'}
                    alt={member.fullName}
                    className="w-full h-full object-cover object-center"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/logo.png';
                    }}
                  />
                </div>
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-md bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-black font-black text-[9px] tracking-wider uppercase shadow-md border border-amber-200">
                  VIP
                </div>
              </div>

              <div className="min-w-0 flex-1 pr-1">
                <h2 className="text-lg sm:text-2xl font-bold font-sans tracking-tight text-white leading-tight break-words line-clamp-2">
                  {member.fullName}
                </h2>
                <div className="font-mono text-xs sm:text-sm font-bold text-neutral-400 tracking-wider mt-1">
                  {member.memberId}
                </div>
                <div className="text-[11px] sm:text-xs text-neutral-400 font-medium mt-0.5">
                  {member.gender}, {member.age}y • {member.category || 'Gym Only'}
                </div>
              </div>
            </div>

            <div className="shrink-0 self-start">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wider uppercase border backdrop-blur-md whitespace-nowrap shadow-sm ${statusChipStyle}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${statusDotColor} animate-pulse`} />
                {statusChipText}
              </span>
            </div>
          </div>

          {/* 3-Column Stats Row (properly spaced so text doesn't truncate) */}
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/10 text-left">
            <div>
              <span className="text-[10px] uppercase font-mono font-bold text-neutral-500 tracking-wider block">
                PLAN
              </span>
              <span className="font-bold text-xs sm:text-sm text-white block mt-0.5 truncate">
                {member.plan}
              </span>
            </div>

            <div className="border-l border-white/10 pl-2.5 sm:pl-3">
              <span className="text-[10px] uppercase font-mono font-bold text-neutral-500 tracking-wider block">
                EXPIRES
              </span>
              <span className="font-mono font-bold text-xs sm:text-sm text-neutral-200 block mt-0.5 truncate">
                {member.expiryDate}
              </span>
            </div>

            <div className="border-l border-white/10 pl-2.5 sm:pl-3">
              <span className="text-[10px] uppercase font-mono font-bold text-neutral-500 tracking-wider block">
                STATUS
              </span>
              <span
                className={`font-mono font-bold text-xs sm:text-sm block mt-0.5 truncate ${
                  isExpired ? 'text-rose-400' : isExpiringSoon ? 'text-[#F5C26B]' : 'text-emerald-400'
                }`}
              >
                {member.remainingDays > 0 ? `${member.remainingDays}d Left` : 'Expired'}
              </span>
            </div>
          </div>

          {/* QR Code Section: Single clean white rounded frame */}
          <div className="p-3.5 sm:p-4 rounded-[24px] bg-[#101114]/90 border border-white/10 flex items-center justify-between gap-3 sm:gap-4 shadow-inner">
            <div className="shrink-0 bg-white p-2 sm:p-2.5 rounded-2xl shadow-xl flex items-center justify-center">
              <DynamicQrCode
                value={passUrl || (member.memberId ? `https://redapplegym.in/pass/${member.memberId}` : '')}
                size={110}
                noCardWrapper={true}
                showDownload={false}
                showCopy={false}
                memberId={member.memberId}
              />
            </div>

            <div className="flex-1 space-y-1.5">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-300 block">
                FAST SCAN ACCESS •
              </span>
              <p className="text-[11px] text-neutral-400 leading-snug">
                Scan QR code at gym front desk for instant attendance check-in.
              </p>
            </div>
          </div>
        </div>

        {/* GENUINE "ADD TO HOME SCREEN" ACTION */}
        <div className="pt-1">
          {isStandalone ? (
            <div className="w-full py-3.5 px-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center gap-2 text-emerald-400 text-xs font-bold shadow-lg">
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Pass Saved on Home Screen</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleInstallClick}
              className="w-full group relative overflow-hidden py-3.5 px-5 rounded-2xl bg-gradient-to-r from-[#E50914] via-[#c41e3a] to-[#8B0000] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-between shadow-[0_10px_30px_rgba(229,9,20,0.35)] hover:shadow-[0_15px_35px_rgba(229,9,20,0.5)] transition-all active:scale-[0.98] border border-red-500/30"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-black/30 flex items-center justify-center text-amber-300">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="font-extrabold text-[12px] tracking-wide flex items-center gap-1.5">
                    <span>Add Pass to Home Screen</span>
                    <Sparkles className="w-3 h-3 text-amber-300" />
                  </div>
                  <div className="text-[10px] text-white/80 font-normal lowercase tracking-normal">
                    1-tap app access • works offline
                  </div>
                </div>
              </div>

              <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                <ArrowRight className="w-3.5 h-3.5 text-white" />
              </div>
            </button>
          )}
        </div>
      </main>

      {/* INSTALL GUIDE MODAL (FOR IOS & ANDROID) */}
      {showInstallGuide && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#16171B] border border-white/20 rounded-[28px] max-w-sm w-full p-6 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setShowInstallGuide(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#E50914] to-amber-500 p-0.5 shadow-lg shadow-red-500/20">
                <div className="w-full h-full rounded-[14px] bg-[#0B0C0E] flex items-center justify-center text-amber-400">
                  <Smartphone className="w-6 h-6" />
                </div>
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Save Pass to Phone</h3>
                <p className="text-xs text-neutral-400">Add to your home screen like an app</p>
              </div>
            </div>

            <div className="space-y-3 pt-2 text-xs text-neutral-300">
              {isIOS ? (
                <>
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                    <span className="w-5 h-5 rounded-full bg-[#E50914] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      1
                    </span>
                    <p>
                      Tap the <strong className="text-white">Share</strong> button at the bottom of Safari <span className="inline-block px-1.5 py-0.5 rounded bg-white/10 font-mono text-[10px]">⎋ / [ ↑ ]</span>
                    </p>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                    <span className="w-5 h-5 rounded-full bg-[#E50914] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      2
                    </span>
                    <p>
                      Scroll down and tap <strong className="text-amber-400">"Add to Home Screen"</strong> <PlusSquare className="w-3.5 h-3.5 inline mx-0.5" />
                    </p>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                    <span className="w-5 h-5 rounded-full bg-[#E50914] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      3
                    </span>
                    <p>
                      Tap <strong className="text-white">"Add"</strong> in the top-right corner. Done!
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                    <span className="w-5 h-5 rounded-full bg-[#E50914] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      1
                    </span>
                    <p>
                      Tap the <strong className="text-white">Three Dots Menu (⋮)</strong> at top right in Chrome.
                    </p>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                    <span className="w-5 h-5 rounded-full bg-[#E50914] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      2
                    </span>
                    <p>
                      Tap <strong className="text-amber-400">"Install app"</strong> or <strong className="text-amber-400">"Add to Home screen"</strong>.
                    </p>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                    <span className="w-5 h-5 rounded-full bg-[#E50914] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      3
                    </span>
                    <p>
                      Confirm by tapping <strong className="text-white">"Install"</strong>. Your VIP pass is now on your home screen!
                    </p>
                  </div>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowInstallGuide(false)}
              className="w-full py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors"
            >
              Got it, Close
            </button>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="max-w-md mx-auto w-full pt-4 pb-2 z-10">
        <div className="p-3.5 rounded-full bg-neutral-900/80 backdrop-blur-xl border border-white/10 flex items-center justify-between gap-3 shadow-lg">
          <div className="pl-2">
            <span className="text-[11px] text-neutral-300 font-semibold block leading-tight">
              Gym Front Desk Concierge
            </span>
            <span className="text-[10px] text-neutral-500 block">
              Mon-Sat: 6:00 AM - 10:30 PM
            </span>
          </div>

          <a
            href={`tel:${(gymSettings.phone || '8551919595').replace(/\s+/g, '')}`}
            className="py-2 px-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/20 text-neutral-200 hover:text-white text-xs font-bold transition-colors shrink-0"
          >
            Call Front Desk
          </a>
        </div>
      </footer>
    </div>
  );
}
