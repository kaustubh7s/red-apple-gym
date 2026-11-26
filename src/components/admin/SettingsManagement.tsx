'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import {
  Settings,
  ShieldCheck,
  Building,
  Key,
  Database,
  Clock,
  Save,
  CheckCircle2,
  AlertCircle,
  Download,
  Upload,
  RotateCcw,
  Lock,
  Phone,
  MapPin,
  CreditCard,
  Dumbbell,
  Activity,
  Sparkles,
  Eye,
  EyeOff,
  ExternalLink,
  UserCheck,
  RefreshCw,
  Copy,
  BadgeCheck
} from 'lucide-react';
import { INITIAL_MEMBERSHIP_PLANS } from '@/lib/data';
import { MembershipPlanItem } from '@/lib/types';
import {
  getStoredCentralLicense,
  performDailyHeartbeat,
  verifyLicenseWithNeon,
  saveStoredCentralLicense,
  isFeatureEnabled,
  CentralLicense
} from '@/lib/centralLicenseService';

export const SettingsManagement: React.FC = () => {
  const {
    adminPassword,
    trainerPassword,
    updateAdminPassword,
    updateTrainerPassword,
    trainer,
    updateTrainer,
    membershipPlans,
    updateAllMembershipPlans,
    members,
    payments,
    leads,
    attendanceRecords,
    importFullBackup
  } = useApp();

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Central Licensing State
  const [centralLicense, setCentralLicense] = useState<CentralLicense | null>(null);
  const [showLicenseKey, setShowLicenseKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [heartbeatSyncing, setHeartbeatSyncing] = useState(false);
  const [heartbeatMsg, setHeartbeatMsg] = useState('');

  React.useEffect(() => {
    setCentralLicense(getStoredCentralLicense());
  }, []);

  const handleManualHeartbeat = async () => {
    setHeartbeatSyncing(true);
    setHeartbeatMsg('');
    try {
      const res = await performDailyHeartbeat(true);
      if (res.active && res.license) {
        setCentralLicense(res.license);
        setHeartbeatMsg('License verified active with central Neon registry!');
      } else if (res.isSuspended) {
        setHeartbeatMsg('Warning: License is marked suspended in central registry.');
      } else {
        setHeartbeatMsg(res.error || 'Verification completed.');
      }
    } catch (e) {
      setHeartbeatMsg('Could not reach central registry.');
    }
    setHeartbeatSyncing(false);
    setTimeout(() => setHeartbeatMsg(''), 4000);
  };

  // Change / Renew License Key State
  const [isEnteringNewKey, setIsEnteringNewKey] = useState(false);
  const [newKeyInput, setNewKeyInput] = useState('');
  const [isActivatingKey, setIsActivatingKey] = useState(false);
  const [keyActivationMsg, setKeyActivationMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleActivateNewKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setKeyActivationMsg(null);
    const cleanKey = newKeyInput.trim().toUpperCase();
    if (!cleanKey) return;

    setIsActivatingKey(true);
    try {
      const res = await verifyLicenseWithNeon(cleanKey);
      if (res.valid && res.license) {
        saveStoredCentralLicense(res.license);
        setCentralLicense(res.license);
        setNewKeyInput('');
        setIsEnteringNewKey(false);
        setKeyActivationMsg({ type: 'success', text: `License activated successfully! (${res.license.client_name})` });
        setTimeout(() => setKeyActivationMsg(null), 4000);
      } else {
        setKeyActivationMsg({ type: 'error', text: res.error || 'Invalid license key.' });
      }
    } catch {
      setKeyActivationMsg({ type: 'error', text: 'Could not connect to central licensing registry.' });
    } finally {
      setIsActivatingKey(false);
    }
  };

  // Membership Pricing Configuration
  const [plansList, setPlansList] = useState<MembershipPlanItem[]>(membershipPlans);
  const [pricingSuccess, setPricingSuccess] = useState(false);

  // Keep synced if external updates occur
  React.useEffect(() => {
    setPlansList(membershipPlans);
  }, [membershipPlans]);

  const handlePriceChange = (id: string, field: 'gymOnlyPrice' | 'gymCardioPrice', val: number) => {
    setPlansList((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: Math.max(0, val) } : p))
    );
  };

  const handleSavePricing = (e: React.FormEvent) => {
    e.preventDefault();
    updateAllMembershipPlans(plansList);
    setPricingSuccess(true);
    setTimeout(() => setPricingSuccess(false), 3000);
  };

  const handleResetPricingDefaults = () => {
    if (confirm('Reset all membership prices back to factory default rates?')) {
      updateAllMembershipPlans(INITIAL_MEMBERSHIP_PLANS);
      setPlansList(INITIAL_MEMBERSHIP_PLANS);
      setPricingSuccess(true);
      setTimeout(() => setPricingSuccess(false), 3000);
    }
  };

  // Admin password change form
  const [currentAdminPw, setCurrentAdminPw] = useState('');
  const [newAdminPw, setNewAdminPw] = useState('');
  const [confirmAdminPw, setConfirmAdminPw] = useState('');
  const [adminSuccess, setAdminSuccess] = useState('');
  const [adminError, setAdminError] = useState('');

  // Trainer Profile & Password Configuration
  const [trainerName, setTrainerName] = useState(trainer?.fullName || 'Mohaseen Subedar');
  const [trainerIdVal, setTrainerIdVal] = useState(trainer?.trainerId || 'TR-101');
  const [trainerMobileVal, setTrainerMobileVal] = useState(trainer?.mobile || '+91 85519 19595');
  const [trainerPw, setTrainerPw] = useState(trainerPassword || 'trainer123');
  const [showTrainerPw, setShowTrainerPw] = useState(false);
  const [trainerSuccess, setTrainerSuccess] = useState('');
  const [trainerError, setTrainerError] = useState('');

  // Keep trainer state in sync if external updates occur
  React.useEffect(() => {
    if (trainer) {
      setTrainerName(trainer.fullName);
      setTrainerIdVal(trainer.trainerId || 'TR-101');
      setTrainerMobileVal(trainer.mobile || '');
    }
  }, [trainer]);

  React.useEffect(() => {
    if (trainerPassword) {
      setTrainerPw(trainerPassword);
    }
  }, [trainerPassword]);

  const handleSaveTrainerSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setTrainerError('');
    setTrainerSuccess('');

    if (!trainerName.trim()) {
      setTrainerError('Please enter a valid trainer name.');
      return;
    }

    if (trainerPw.trim().length < 4) {
      setTrainerError('Trainer portal password must be at least 4 characters long.');
      return;
    }

    // 1. Update Trainer Password & sync with cloud
    const pwRes = await updateTrainerPassword(adminPassword, trainerPw.trim());
    if (!pwRes.success) {
      setTrainerError(pwRes.message);
      return;
    }

    // 2. Update Trainer Profile (Name, ID, Mobile)
    updateTrainer({
      fullName: trainerName.trim(),
      trainerId: trainerIdVal.trim(),
      mobile: trainerMobileVal.trim(),
      whatsapp: trainerMobileVal.trim()
    });

    setTrainerSuccess('Trainer profile and floor portal password saved & synced successfully!');
    setTimeout(() => setTrainerSuccess(''), 3500);
  };

  const handleUpdateAdminPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');
    setAdminSuccess('');

    if (newAdminPw.length < 4) {
      setAdminError('New password must be at least 4 characters long.');
      return;
    }
    if (newAdminPw !== confirmAdminPw) {
      setAdminError('New passwords do not match.');
      return;
    }

    const res = await updateAdminPassword(currentAdminPw, newAdminPw);
    if (!res.success) {
      setAdminError(res.message);
      return;
    }

    setAdminSuccess('Admin master password updated & synced successfully.');
    setCurrentAdminPw('');
    setNewAdminPw('');
    setConfirmAdminPw('');
    setTimeout(() => setAdminSuccess(''), 3500);
  };

  const handleExportBackup = () => {
    const backupData = {
      timestamp: new Date().toISOString(),
      gym: 'Red Apple Gym CIDCO N-2',
      members,
      payments,
      leads,
      attendanceRecords
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `redapple_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        const ok = importFullBackup(parsed);
        if (ok) {
          alert('Backup restored successfully! All member records and attendance restored.');
        } else {
          alert('Invalid backup file format. Please upload a valid Red Apple Gym JSON backup.');
        }
      } catch (err) {
        alert('Could not parse backup file. Please ensure it is a valid JSON file.');
      }
    };
    reader.readAsText(file);
    if (e.target) e.target.value = '';
  };

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-[#1A1A1A] font-serif tracking-tight">
          Gym Settings & Security
        </h2>
        <p className="text-xs text-[#666666]">
          Configure facility parameters, manage operational passwords, and download database backups.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* MEMBERSHIP PLANS & PRICING CONFIGURATION (GYM ONLY vs GYM + CARDIO) */}
        <div className="md:col-span-2 bg-white rounded-3xl p-6 sm:p-7 border border-black/10 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-black/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center border border-amber-500/20">
                <CreditCard className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-bold text-base text-[#1A1A1A] font-serif">
                  Membership Plans &amp; Pricing Management
                </h3>
                <p className="text-xs text-[#666666]">
                  Configure official rates for <span className="font-semibold text-neutral-800">Gym Only</span> &amp; <span className="font-semibold text-[#C41E3A]">Gym + Cardio</span> across all durations.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetPricingDefaults}
                className="px-3 py-1.5 rounded-xl border border-black/10 bg-neutral-50 hover:bg-neutral-100 text-[#4A4A4A] text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                title="Reset prices back to default rates"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Defaults</span>
              </button>
            </div>
          </div>

          {pricingSuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Membership rates successfully saved and updated across website and admission portals!</span>
            </div>
          )}

          <form onSubmit={handleSavePricing} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {plansList.map((plan) => (
                <div
                  key={plan.id}
                  className="p-4 rounded-2xl bg-[#F8F6F4] border border-black/10 space-y-3.5 relative"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-[#1A1A1A] font-serif">{plan.name}</h4>
                      <span className="text-[10px] text-neutral-500 font-mono">{plan.durationLabel}</span>
                    </div>
                    {plan.badge && (
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#C41E3A] text-white uppercase tracking-wider">
                        {plan.badge}
                      </span>
                    )}
                  </div>

                  {/* Gym Only Price Input */}
                  <div className="p-3 rounded-xl bg-white border border-black/5 space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold text-[#1A1A1A]">
                      <span className="flex items-center gap-1.5">
                        <Dumbbell className="w-3.5 h-3.5 text-[#C41E3A]" />
                        <span>Gym Only</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-1 pt-1">
                      <span className="text-sm font-bold text-neutral-500">₹</span>
                      <input
                        type="number"
                        min="0"
                        step="50"
                        required
                        value={plan.gymOnlyPrice}
                        onChange={(e) => handlePriceChange(plan.id, 'gymOnlyPrice', Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-[#F8F6F4] border border-black/10 text-sm font-bold font-mono text-[#1A1A1A] focus:outline-none focus:border-[#C41E3A]"
                      />
                    </div>
                  </div>

                  {/* Gym + Cardio Price Input */}
                  <div className="p-3 rounded-xl bg-gradient-to-br from-white to-red-50/40 border border-[#C41E3A]/20 space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold text-[#8B1528]">
                      <span className="flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-[#C41E3A]" />
                        <span>Gym + Cardio</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-1 pt-1">
                      <span className="text-sm font-bold text-[#C41E3A]">₹</span>
                      <input
                        type="number"
                        min="0"
                        step="50"
                        required
                        value={plan.gymCardioPrice}
                        onChange={(e) => handlePriceChange(plan.id, 'gymCardioPrice', Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-[#C41E3A]/30 text-sm font-bold font-mono text-[#C41E3A] focus:outline-none focus:ring-1 focus:ring-[#C41E3A]"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#C41E3A] hover:bg-[#8B1528] text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md shadow-[#C41E3A]/25 transition-all active:scale-95 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Membership Rates</span>
              </button>
            </div>
          </form>
        </div>

        {/* Gym Identity Card */}
        <div className="bg-white rounded-3xl p-6 border border-black/10 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-black/5">
            <div className="w-8 h-8 rounded-xl bg-[#C41E3A]/10 text-[#C41E3A] flex items-center justify-center">
              <Building className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#1A1A1A] font-serif">Facility Profile</h3>
              <p className="text-[11px] text-[#666666]">Registered business identity</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#8A8A8A]">Gym Brand</label>
              <div className="font-bold text-[#1A1A1A] text-sm mt-0.5">RED APPLE / रेड ॲपल जिम</div>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#8A8A8A]">Location</label>
              <div className="text-[#1A1A1A] flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-[#C41E3A] shrink-0" />
                <span>CIDCO N-2, Chhatrapati Sambhajinagar (Aurangabad), MH</span>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#8A8A8A]">Hours of Operation</label>
              <div className="text-[#1A1A1A] flex items-center gap-1.5 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                <span>Mon–Sat: 06:00 AM – 10:00 PM • Sun: 07:00 AM – 12:00 PM</span>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#8A8A8A]">Founder &amp; Owner</label>
              <div className="text-[#1A1A1A] mt-0.5 font-semibold flex items-center justify-between">
                <span>Prashant Magre</span>
                <a href="tel:+918551919595" className="text-[#C41E3A] font-mono text-xs hover:underline flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  <span>+91 85519 19595</span>
                </a>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#8A8A8A]">Head Coach</label>
              <div className="text-[#1A1A1A] mt-0.5 font-semibold">
                {trainer.fullName} ({trainer.trainerId || 'TR-101'})
              </div>
            </div>
          </div>
        </div>

        {/* Head Coach Profile & Floor Credentials Card */}
        <div className="bg-white rounded-3xl p-6 border border-black/10 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-black/5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                <Dumbbell className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#1A1A1A] font-serif">
                  Trainer Profile &amp; Login Access
                </h3>
                <p className="text-[11px] text-[#666666]">
                  Configure trainer name, Coach ID, and portal access password
                </p>
              </div>
            </div>

            <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              {trainerIdVal || 'TR-101'}
            </span>
          </div>

          <form onSubmit={handleSaveTrainerSettings} className="space-y-3.5 text-xs">
            {trainerSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{trainerSuccess}</span>
              </div>
            )}
            {trainerError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 font-semibold flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{trainerError}</span>
              </div>
            )}

            {/* Trainer Name & Trainer ID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-[#1A1A1A] block mb-1">
                  Trainer Full Name <span className="text-[#C41E3A]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={trainerName}
                  onChange={(e) => setTrainerName(e.target.value)}
                  placeholder="e.g. Mohaseen Subedar"
                  className="w-full px-3 py-2 rounded-xl bg-[#F8F6F4] border border-black/10 text-xs font-semibold text-[#1A1A1A] outline-none focus:border-blue-600 focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#1A1A1A] block mb-1">
                  Trainer ID Code
                </label>
                <input
                  type="text"
                  value={trainerIdVal}
                  onChange={(e) => setTrainerIdVal(e.target.value)}
                  placeholder="e.g. TR-101"
                  className="w-full px-3 py-2 rounded-xl bg-[#F8F6F4] border border-black/10 text-xs font-mono font-bold text-[#1A1A1A] outline-none focus:border-blue-600 focus:bg-white transition-colors"
                />
              </div>
            </div>

            {/* Trainer Login Password for his ID */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-[#1A1A1A] flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-blue-600" />
                  <span>Trainer Portal Login Password <span className="text-[#C41E3A]">*</span></span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowTrainerPw(!showTrainerPw)}
                  className="text-[10px] font-semibold text-blue-700 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  {showTrainerPw ? (
                    <>
                      <EyeOff className="w-3 h-3" />
                      <span>Hide</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3 h-3" />
                      <span>Show Password</span>
                    </>
                  )}
                </button>
              </div>

              <div className="relative">
                <input
                  type={showTrainerPw ? 'text' : 'password'}
                  required
                  value={trainerPw}
                  onChange={(e) => setTrainerPw(e.target.value)}
                  placeholder="Set floor password for trainer (min 4 chars)"
                  className="w-full px-3 py-2 pr-10 rounded-xl bg-[#F8F6F4] border border-black/10 text-xs font-mono font-bold text-[#1A1A1A] outline-none focus:border-blue-600 focus:bg-white transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowTrainerPw(!showTrainerPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 cursor-pointer"
                >
                  {showTrainerPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              <p className="text-[10px] text-neutral-500 mt-1">
                The trainer uses this password to log into the Coach Floor Portal at{' '}
                <a href="/trainer" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-mono font-bold">
                  /trainer
                </a>
                .
              </p>
            </div>

            {/* Trainer Contact Phone */}
            <div>
              <label className="text-[11px] font-bold text-[#1A1A1A] block mb-1">
                Trainer Contact Mobile / WhatsApp
              </label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={trainerMobileVal}
                  onChange={(e) => setTrainerMobileVal(e.target.value)}
                  placeholder="+91 85519 19595"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#F8F6F4] border border-black/10 text-xs font-mono font-semibold text-[#1A1A1A] outline-none focus:border-blue-600 focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div className="pt-1 flex items-center justify-between">
              <a
                href="/trainer"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 transition-colors"
              >
                <span>Open Coach Portal</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Trainer Settings</span>
              </button>
            </div>
          </form>
        </div>


        {/* Admin Password Change */}
        <div className="bg-white rounded-3xl p-6 border border-black/10 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-black/5">
            <div className="w-8 h-8 rounded-xl bg-[#C41E3A]/10 text-[#C41E3A] flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#1A1A1A] font-serif">Executive Admin Password</h3>
              <p className="text-[11px] text-[#666666]">Authorize operations & financial access</p>
            </div>
          </div>

          <form onSubmit={handleUpdateAdminPassword} className="space-y-3 text-xs">
            {adminSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{adminSuccess}</span>
              </div>
            )}
            {adminError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{adminError}</span>
              </div>
            )}

            <div>
              <label className="text-[11px] font-bold text-[#1A1A1A] block mb-1">Current Password</label>
              <input
                type="password"
                required
                value={currentAdminPw}
                onChange={(e) => setCurrentAdminPw(e.target.value)}
                placeholder="Enter current password"
                className="w-full px-3 py-2 rounded-xl bg-[#F8F6F4] border border-black/10 text-xs outline-none focus:border-[#C41E3A]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-bold text-[#1A1A1A] block mb-1">New Password</label>
                <input
                  type="password"
                  required
                  value={newAdminPw}
                  onChange={(e) => setNewAdminPw(e.target.value)}
                  placeholder="At least 4 chars"
                  className="w-full px-3 py-2 rounded-xl bg-[#F8F6F4] border border-black/10 text-xs outline-none focus:border-[#C41E3A]"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-[#1A1A1A] block mb-1">Confirm New</label>
                <input
                  type="password"
                  required
                  value={confirmAdminPw}
                  onChange={(e) => setConfirmAdminPw(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full px-3 py-2 rounded-xl bg-[#F8F6F4] border border-black/10 text-xs outline-none focus:border-[#C41E3A]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#C41E3A] hover:bg-[#8B1528] text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <Key className="w-3.5 h-3.5" />
              <span>Update Admin Password</span>
            </button>
          </form>
        </div>

        {/* Database & Data Integrity */}
        <div className="bg-white rounded-3xl p-6 border border-black/10 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-black/5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#1A1A1A] font-serif">Data Backup & Archive</h3>
              <p className="text-[11px] text-[#666666]">Export athlete rosters & audit logs</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <p className="text-neutral-600 leading-relaxed">
              Export your entire gym database ({members.length} members, {payments.length} payment receipts, and {attendanceRecords.length} attendance records) in portable JSON format for offline record keeping.
            </p>

            <div className="pt-2 flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={handleExportBackup}
                className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Database Backup (.JSON)</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Restore Backup File</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleImportFile}
                className="hidden"
              />
            </div>
          </div>
        </div>

        {/* SOFTWARE LICENSE (Ultra-simple, clean & compact) */}
        <div className="md:col-span-2 bg-white rounded-3xl p-5 sm:p-6 border border-black/10 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-neutral-100 text-neutral-700 flex items-center justify-center shrink-0">
                <Key className="w-4 h-4 text-[#C41E3A]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-[#1A1A1A]">Software License</h3>
                  {centralLicense?.status === 'active' ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      {centralLicense?.status === 'expired' ? 'Expired' : 'Suspended'}
                    </span>
                  )}
                </div>
                <p className="text-xs text-neutral-500">
                  Workstation authorization and plan validity
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={handleManualHeartbeat}
                disabled={heartbeatSyncing}
                className="px-3 py-1.5 rounded-xl border border-black/10 bg-neutral-50 hover:bg-neutral-100 text-[#1A1A1A] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                title="Re-verify license status"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-neutral-600 ${heartbeatSyncing ? 'animate-spin' : ''}`} />
                <span>{heartbeatSyncing ? 'Checking...' : 'Check Status'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsEnteringNewKey(!isEnteringNewKey);
                  setKeyActivationMsg(null);
                }}
                className="px-3 py-1.5 rounded-xl border border-[#C41E3A]/20 bg-red-50 hover:bg-red-100 text-[#C41E3A] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Key className="w-3.5 h-3.5" />
                <span>{isEnteringNewKey ? 'Cancel' : 'Change Key'}</span>
              </button>
            </div>
          </div>

          {/* Inline Enter New Key Form */}
          {isEnteringNewKey && (
            <form onSubmit={handleActivateNewKey} className="p-3.5 rounded-2xl bg-[#F8F6F4] border border-black/10 space-y-2.5 animate-in fade-in">
              <div className="flex items-center justify-between text-xs font-semibold text-[#1A1A1A]">
                <span>Activate New License Key</span>
                <span className="text-[11px] text-neutral-500">e.g. GYMX-XXXX-XXXX-XXXX-2026</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  required
                  value={newKeyInput}
                  onChange={(e) => setNewKeyInput(e.target.value.toUpperCase())}
                  placeholder="Enter license key"
                  className="flex-1 px-3 py-2 rounded-xl bg-white border border-black/10 text-xs font-mono font-bold uppercase tracking-wider text-[#1A1A1A] outline-none focus:border-[#C41E3A]"
                />
                <button
                  type="submit"
                  disabled={isActivatingKey || !newKeyInput.trim()}
                  className="px-4 py-2 rounded-xl bg-[#C41E3A] hover:bg-[#8B1528] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer shrink-0"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>{isActivatingKey ? 'Verifying...' : 'Activate'}</span>
                </button>
              </div>
            </form>
          )}

          {keyActivationMsg && (
            <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in ${
              keyActivationMsg.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-rose-50 border border-rose-200 text-rose-800'
            }`}>
              {keyActivationMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
              <span>{keyActivationMsg.text}</span>
            </div>
          )}

          {heartbeatMsg && !keyActivationMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{heartbeatMsg}</span>
            </div>
          )}

          {/* Simple, Minimal Details Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            <div className="px-3.5 py-2.5 rounded-xl bg-[#F8F6F4] border border-black/5 flex items-center justify-between text-xs">
              <span className="text-neutral-500">Client</span>
              <span className="font-semibold text-[#1A1A1A] truncate max-w-[150px]">
                {centralLicense?.client_name || 'Red Apple GYM'}
                <span className="text-[10px] text-neutral-400 font-normal ml-1">({centralLicense?.tier?.toUpperCase() || 'ENTERPRISE'})</span>
              </span>
            </div>

            <div className="px-3.5 py-2.5 rounded-xl bg-[#F8F6F4] border border-black/5 flex items-center justify-between text-xs">
              <span className="text-neutral-500">Key</span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-bold text-[#1A1A1A]">
                  {centralLicense?.key
                    ? showLicenseKey
                      ? centralLicense.key
                      : `${centralLicense.key.slice(0, 5)}••••-••••-${centralLicense.key.slice(-4)}`
                    : '—'}
                </span>
                <button
                  type="button"
                  onClick={() => setShowLicenseKey(!showLicenseKey)}
                  className="text-neutral-400 hover:text-neutral-700 cursor-pointer p-0.5"
                  title={showLicenseKey ? 'Hide' : 'Reveal'}
                >
                  {showLicenseKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                </button>
                {centralLicense?.key && (
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(centralLicense.key);
                      setCopiedKey(true);
                      setTimeout(() => setCopiedKey(false), 2000);
                    }}
                    className="text-[#C41E3A] hover:underline cursor-pointer text-[11px] font-medium ml-1"
                  >
                    {copiedKey ? 'Copied' : 'Copy'}
                  </button>
                )}
              </div>
            </div>

            <div className="px-3.5 py-2.5 rounded-xl bg-[#F8F6F4] border border-black/5 flex items-center justify-between text-xs">
              <span className="text-neutral-500">Expires</span>
              <span className="font-semibold text-[#1A1A1A]">
                {centralLicense?.expires_at
                  ? new Date(centralLicense.expires_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })
                  : '26 Nov 2027'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
