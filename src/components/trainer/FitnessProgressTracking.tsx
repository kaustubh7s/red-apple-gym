'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/lib/store';
import {
  Activity,
  Plus,
  Calendar,
  X,
  Trash2,
  TrendingDown,
  TrendingUp,
  Scale
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

export const FitnessProgressTracking: React.FC = () => {
  const {
    members,
    trainer,
    fitnessMeasurements,
    addFitnessMeasurement,
    deleteFitnessMeasurement
  } = useApp();

  const [selectedMemberId, setSelectedMemberId] = useState<string>(members[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'charts' | 'history'>('charts');
  const [formOpen, setFormOpen] = useState(false);

  // New Measurement Form State
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [weightKg, setWeightKg] = useState<number>(78.5);
  const [heightCm, setHeightCm] = useState<number>(178);
  const [bodyFatPercent, setBodyFatPercent] = useState<number>(16.0);
  const [chestInches, setChestInches] = useState<number>(41.0);
  const [waistInches, setWaistInches] = useState<number>(33.0);
  const [armsInches, setArmsInches] = useState<number>(15.0);
  const [thighsInches, setThighsInches] = useState<number>(23.5);
  const [notes, setNotes] = useState('');

  const activeMember = members.find((m) => m.id === selectedMemberId) || members[0];

  // Filter measurements for this active member sorted by date (oldest first)
  const memberMeasurements = useMemo(() => {
    if (!activeMember) return [];
    return fitnessMeasurements
      .filter((m) => m.memberId === activeMember.id || m.memberId === activeMember.memberId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [fitnessMeasurements, activeMember]);

  const latestScan = memberMeasurements[memberMeasurements.length - 1] || null;
  const initialScan = memberMeasurements[0] || null;
  const totalWeightDelta = latestScan && initialScan ? parseFloat((latestScan.weightKg - initialScan.weightKg).toFixed(1)) : 0;

  // Handle Save Measurement
  const handleSaveMeasurement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMember) return;

    const heightM = Number(heightCm) / 100;
    const bmi = heightM > 0 ? parseFloat((Number(weightKg) / (heightM * heightM)).toFixed(1)) : 24.0;

    addFitnessMeasurement({
      memberId: activeMember.id,
      date,
      weightKg: Number(weightKg),
      heightCm: Number(heightCm),
      bmi,
      bodyFatPercent: Number(bodyFatPercent),
      chestInches: Number(chestInches),
      waistInches: Number(waistInches),
      armsInches: Number(armsInches),
      thighsInches: Number(thighsInches),
      notes: notes || 'Routine biometric assessment.',
      recordedByTrainerName: trainer?.fullName || 'Prashant Kakde'
    });

    setNotes('');
    setFormOpen(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Header & Athlete Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-extrabold text-white font-['Space_Grotesk']">
              Athlete Biometrics & Measurement Tracker
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#00F59B]/10 text-[#00F59B] border border-[#00F59B]/30 uppercase tracking-wider">
              Coach Biometrics Lab
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Track weight progression, body fat percentage, and muscle circumferences over time.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={selectedMemberId}
            onChange={(e) => setSelectedMemberId(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl bg-[#11131A] border border-white/10 text-xs font-semibold text-white outline-none focus:border-[#00F59B] shadow-inner"
          >
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.fullName} ({m.memberId})
              </option>
            ))}
          </select>

          <button
            onClick={() => setFormOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[#00F59B] text-black font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 hover:brightness-110 shadow-lg shadow-[#00F59B]/20 shrink-0 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Log Measurements</span>
          </button>
        </div>
      </div>

      {/* Selected Athlete Snapshot Banner */}
      {activeMember && (
        <div className="p-6 rounded-3xl bg-[#11131A] border border-white/10 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            {activeMember.photo ? (
              <img
                src={activeMember.photo}
                alt={activeMember.fullName}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-[#C41E3A] shadow-md shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center font-bold text-lg text-white shrink-0">
                {activeMember.fullName.charAt(0)}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-extrabold text-white font-['Space_Grotesk']">
                  {activeMember.fullName}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30">
                  {activeMember.memberId}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  {activeMember.plan}
                </span>
              </div>
              <div className="text-xs text-neutral-400 mt-1">
                Joined: {activeMember.joinDate} • Membership Expiry: {activeMember.expiryDate} ({activeMember.remainingDaysText})
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs text-right w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-white/5">
            <div>
              <span className="text-[10px] text-neutral-400 uppercase font-semibold block">Total Scans</span>
              <span className="font-extrabold text-white text-base font-['Space_Grotesk']">
                {memberMeasurements.length} Records
              </span>
            </div>
            <div>
              <span className="text-[10px] text-neutral-400 uppercase font-semibold block">Current Weight</span>
              <span className="font-extrabold text-[#00F59B] text-base font-['Space_Grotesk']">
                {latestScan?.weightKg || 78.5} kg
              </span>
            </div>
            <div>
              <span className="text-[10px] text-neutral-400 uppercase font-semibold block">Body Fat</span>
              <span className="font-extrabold text-sky-400 text-base font-['Space_Grotesk']">
                {latestScan?.bodyFatPercent || 16}%
              </span>
            </div>
            {memberMeasurements.length > 1 && (
              <div>
                <span className="text-[10px] text-neutral-400 uppercase font-semibold block">Net Change</span>
                <span className={`font-extrabold text-base font-['Space_Grotesk'] flex items-center justify-end gap-1 ${
                  totalWeightDelta <= 0 ? 'text-[#00F59B]' : 'text-amber-400'
                }`}>
                  {totalWeightDelta <= 0 ? <TrendingDown className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
                  {totalWeightDelta > 0 ? `+${totalWeightDelta}` : totalWeightDelta} kg
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation Tab Bar */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
        <button
          onClick={() => setActiveTab('charts')}
          className={`px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
            activeTab === 'charts'
              ? 'bg-[#00F59B] text-black shadow-lg shadow-[#00F59B]/20'
              : 'bg-[#11131A] text-neutral-300 hover:text-white'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Biometric Curves & Charts</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
            activeTab === 'history'
              ? 'bg-[#00F59B] text-black shadow-lg shadow-[#00F59B]/20'
              : 'bg-[#11131A] text-neutral-300 hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Measurement History Log ({memberMeasurements.length})</span>
        </button>
      </div>

      {/* TAB 1: BIOMETRIC CURVES & CHARTS */}
      {activeTab === 'charts' && (
        <div className="space-y-6">
          {memberMeasurements.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-[#11131A] border border-white/10 space-y-4">
              <Scale className="w-12 h-12 text-neutral-600 mx-auto" />
              <div>
                <h3 className="text-base font-bold text-white font-['Space_Grotesk']">
                  No Biometric Scans Recorded Yet
                </h3>
                <p className="text-xs text-neutral-400 mt-1 max-w-md mx-auto">
                  Log the initial baseline scan to start tracking weight trends, body fat reduction, and muscle circumferences.
                </p>
              </div>
              <button
                onClick={() => setFormOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-[#00F59B] text-black font-extrabold text-xs uppercase tracking-wider inline-flex items-center gap-2 hover:brightness-110 shadow-lg shadow-[#00F59B]/20"
              >
                <Plus className="w-4 h-4" />
                <span>Log Initial Baseline Scan</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Graph 1: Weight & Body Fat Trend */}
              <div className="lg:col-span-6 p-6 sm:p-8 rounded-3xl bg-[#11131A] border border-white/10 shadow-2xl space-y-6">
                <div className="border-b border-white/10 pb-4">
                  <h3 className="text-base font-bold text-white font-['Space_Grotesk']">
                    Weight (kg) vs Body Fat (%) Progression
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Lean mass retention and visceral fat reduction timeline.
                  </p>
                </div>

                <div className="h-64 w-full min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={memberMeasurements} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <XAxis dataKey="date" stroke="#6B7280" fontSize={11} tickLine={false} />
                      <YAxis stroke="#6B7280" fontSize={11} tickLine={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#181A22', borderColor: '#374151', borderRadius: '12px', fontSize: '12px' }}
                      />
                      <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                      <Line type="monotone" dataKey="weightKg" name="Weight (kg)" stroke="#00F59B" strokeWidth={3} dot={{ r: 5 }} />
                      <Line type="monotone" dataKey="bodyFatPercent" name="Body Fat %" stroke="#38BDF8" strokeWidth={3} dot={{ r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Graph 2: Muscle Circumferences */}
              <div className="lg:col-span-6 p-6 sm:p-8 rounded-3xl bg-[#11131A] border border-white/10 shadow-2xl space-y-6">
                <div className="border-b border-white/10 pb-4">
                  <h3 className="text-base font-bold text-white font-['Space_Grotesk']">
                    Circumference Metrics (Inches)
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Chest hypertrophy, waist contraction, and bicep/thigh density.
                  </p>
                </div>

                <div className="h-64 w-full min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={memberMeasurements} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <XAxis dataKey="date" stroke="#6B7280" fontSize={11} tickLine={false} />
                      <YAxis stroke="#6B7280" fontSize={11} tickLine={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#181A22', borderColor: '#374151', borderRadius: '12px', fontSize: '12px' }}
                      />
                      <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                      <Line type="monotone" dataKey="chestInches" name="Chest (in)" stroke="#A855F7" strokeWidth={2} dot={{ r: 4 }} />
                      <Line type="monotone" dataKey="waistInches" name="Waist (in)" stroke="#F43F5E" strokeWidth={2} dot={{ r: 4 }} />
                      <Line type="monotone" dataKey="armsInches" name="Arms (in)" stroke="#FBBF24" strokeWidth={2} dot={{ r: 4 }} />
                      <Line type="monotone" dataKey="thighsInches" name="Thighs (in)" stroke="#00F59B" strokeWidth={2} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MEASUREMENT HISTORY LOG */}
      {activeTab === 'history' && (
        <div className="p-6 rounded-3xl bg-[#11131A] border border-white/10 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h3 className="text-base font-bold text-white font-['Space_Grotesk']">
                Historical Assessment Scans ({memberMeasurements.length})
              </h3>
              <p className="text-xs text-neutral-400">
                Detailed biometric records and clinical logs for {activeMember.fullName}.
              </p>
            </div>

            <button
              onClick={() => setFormOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-[#00F59B] text-black font-bold text-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Entry</span>
            </button>
          </div>

          {memberMeasurements.length === 0 ? (
            <div className="text-center py-12 text-xs text-neutral-400">
              No scan entries found. Tap "New Entry" to log biometric measurements.
            </div>
          ) : (
            <div className="space-y-3">
              {[...memberMeasurements].reverse().map((scan) => (
                <div
                  key={scan.id}
                  className="p-4 rounded-2xl bg-black/30 border border-white/5 hover:border-white/15 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-white">{scan.date}</span>
                      <span className="text-[10px] text-neutral-400">by {scan.recordedByTrainerName}</span>
                    </div>
                    <p className="text-xs text-neutral-300 mt-1">
                      <strong className="text-[#00F59B] text-sm">{scan.weightKg} kg</strong> • {scan.bodyFatPercent}% Body Fat • BMI {scan.bmi}
                    </p>
                    <p className="text-[11px] text-neutral-500 mt-0.5">
                      Chest: {scan.chestInches}" • Waist: {scan.waistInches}" • Arms: {scan.armsInches}" • Thighs: {scan.thighsInches}"
                    </p>
                  </div>

                  <div className="flex items-center gap-3 self-end md:self-center">
                    {scan.notes && (
                      <span className="text-xs text-neutral-400 italic max-w-xs truncate hidden lg:inline">
                        "{scan.notes}"
                      </span>
                    )}

                    <button
                      onClick={() => {
                        if (confirm('Delete this measurement entry?')) {
                          deleteFitnessMeasurement(scan.id);
                        }
                      }}
                      className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-neutral-400 hover:text-rose-400 transition-colors"
                      title="Delete Entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL: LOG BODY MEASUREMENTS */}
      {formOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#11131A] border border-white/10 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-in zoom-in-95 text-xs text-neutral-300 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white font-['Space_Grotesk']">
                  Record Biometrics: {activeMember?.fullName}
                </h3>
                <p className="text-[11px] text-neutral-400">
                  Assess body composition metrics, BMI, and circumferences.
                </p>
              </div>
              <button onClick={() => setFormOpen(false)} className="text-neutral-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMeasurement} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                    Assessment Date
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-[#00F59B]"
                  />
                </div>

                <div>
                  <label className="font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={heightCm}
                    onChange={(e) => setHeightCm(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-[#00F59B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={weightKg}
                    onChange={(e) => setWeightKg(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-[#00F59B]"
                  />
                </div>

                <div>
                  <label className="font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                    Body Fat (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={bodyFatPercent}
                    onChange={(e) => setBodyFatPercent(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-[#00F59B]"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3">
                <span className="font-bold uppercase tracking-wider text-neutral-400 block text-[10px]">
                  Circumference Tape Measurements (Inches)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div>
                    <label className="text-[10px] text-neutral-400 block mb-0.5">Chest</label>
                    <input
                      type="number"
                      step="0.25"
                      value={chestInches}
                      onChange={(e) => setChestInches(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white font-mono text-center outline-none focus:border-[#00F59B]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-neutral-400 block mb-0.5">Waist</label>
                    <input
                      type="number"
                      step="0.25"
                      value={waistInches}
                      onChange={(e) => setWaistInches(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white font-mono text-center outline-none focus:border-[#00F59B]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-neutral-400 block mb-0.5">Arms / Biceps</label>
                    <input
                      type="number"
                      step="0.25"
                      value={armsInches}
                      onChange={(e) => setArmsInches(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white font-mono text-center outline-none focus:border-[#00F59B]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-neutral-400 block mb-0.5">Thighs</label>
                    <input
                      type="number"
                      step="0.25"
                      value={thighsInches}
                      onChange={(e) => setThighsInches(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white font-mono text-center outline-none focus:border-[#00F59B]"
                    />
                  </div>
                </div>
              </div>

              {/* Coach Clinical Notes */}
              <div>
                <label className="font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                  Coach Clinical Notes & Observations
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Good strength retention. Recommend adding 150ml water and keeping protein at 140g."
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-[#00F59B]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-neutral-300 font-bold hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-[#00F59B] text-black font-extrabold uppercase tracking-wider shadow-lg shadow-[#00F59B]/20 hover:brightness-110"
                >
                  Save Biometrics
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
