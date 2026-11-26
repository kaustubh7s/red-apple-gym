'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { WorkoutPlan, Exercise, WorkoutDay, Member } from '@/lib/types';
import {
  Dumbbell,
  Plus,
  Trash2,
  Edit,
  CheckCircle2,
  Sparkles,
  UserCheck,
  X,
  Clock,
  Layers,
  ChevronDown
} from 'lucide-react';

export const WorkoutManagement: React.FC = () => {
  const {
    workoutPlans,
    addWorkoutPlan,
    assignWorkoutToMember,
    members,
    trainer
  } = useApp();

  const [formOpen, setFormOpen] = useState(false);
  const [assignModalPlan, setAssignModalPlan] = useState<WorkoutPlan | null>(null);
  const [selectedMemberToAssign, setSelectedMemberToAssign] = useState<string>(members[0]?.id || '');
  const [assignSuccessMsg, setAssignSuccessMsg] = useState<string | null>(null);

  // New Workout Form Fields
  const [title, setTitle] = useState('');
  const [targetGoal, setTargetGoal] = useState<WorkoutPlan['targetGoal']>('Muscle Hypertrophy');
  const [difficulty, setDifficulty] = useState<WorkoutPlan['difficulty']>('Intermediate');
  const [dietaryRecommendations, setDietaryRecommendations] = useState('High protein (2.2g/kg), 4L water daily.');
  const [days, setDays] = useState<WorkoutDay[]>([
    {
      dayName: 'Day 1: Chest & Triceps Hypertrophy',
      focus: 'Upper Pushing & Mechanical Tension',
      exercises: [
        { id: 'ex-1', name: 'Incline Barbell Bench Press', sets: 4, reps: '8-10', restSeconds: 90, notes: 'Full clavicular stretch' },
        { id: 'ex-2', name: 'Flat Dumbbell Press', sets: 4, reps: '10-12', restSeconds: 75 }
      ]
    },
    {
      dayName: 'Day 2: Back & Biceps Width',
      focus: 'Latissimus Dorsi & Rhomboid Power',
      exercises: [
        { id: 'ex-3', name: 'Conventional Deadlift', sets: 4, reps: '5 reps', restSeconds: 150 },
        { id: 'ex-4', name: 'Chest-Supported Row', sets: 4, reps: '10-12', restSeconds: 75 }
      ]
    }
  ]);

  const handleAddDay = () => {
    setDays((prev) => [
      ...prev,
      {
        dayName: `Day ${prev.length + 1}: Lower Body & Core`,
        focus: 'Quad & Hamstring Power',
        exercises: [{ id: `ex-${Date.now()}`, name: 'Barbell Back Squat', sets: 4, reps: '8 reps', restSeconds: 120 }]
      }
    ]);
  };

  const handleAddExerciseToDay = (dayIdx: number) => {
    setDays((prev) => {
      const updated = [...prev];
      updated[dayIdx].exercises.push({
        id: `ex-${Date.now()}`,
        name: 'Cable Triceps Pushdown',
        sets: 3,
        reps: '12-15 reps',
        restSeconds: 60
      });
      return updated;
    });
  };

  const handleRemoveExercise = (dayIdx: number, exIdx: number) => {
    setDays((prev) => {
      const updated = [...prev];
      updated[dayIdx].exercises.splice(exIdx, 1);
      return updated;
    });
  };

  const handleSaveWorkout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addWorkoutPlan({
      title,
      targetGoal,
      difficulty,
      dietaryRecommendations,
      days
    });

    setFormOpen(false);
  };

  const handleConfirmAssign = () => {
    if (!assignModalPlan || !selectedMemberToAssign) return;
    assignWorkoutToMember(selectedMemberToAssign, assignModalPlan.id);
    const assignedMem = members.find((m) => m.id === selectedMemberToAssign);
    setAssignSuccessMsg(`Assigned "${assignModalPlan.title}" to ${assignedMem?.fullName}!`);
    setTimeout(() => setAssignSuccessMsg(null), 3500);
    setAssignModalPlan(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white font-['Space_Grotesk']">
            Workout Protocols & Split Designer
          </h2>
          <p className="text-xs text-neutral-400">
            Build custom periodized routines, supersets, and assign them directly to your athletes.
          </p>
        </div>

        <button
          onClick={() => {
            setTitle('');
            setFormOpen(true);
          }}
          className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 hover:brightness-110 shadow-lg shadow-blue-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Split</span>
        </button>
      </div>

      {assignSuccessMsg && (
        <div className="p-4 rounded-2xl bg-[#00F59B]/15 border border-[#00F59B]/40 text-xs font-bold text-[#00F59B] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{assignSuccessMsg}</span>
        </div>
      )}

      {/* Workout Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {workoutPlans.map((plan) => (
          <div
            key={plan.id}
            className="p-6 rounded-3xl bg-[#11131A] border border-white/10 shadow-xl space-y-5 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30 uppercase">
                    {plan.targetGoal} • {plan.difficulty}
                  </span>
                  <h3 className="text-lg font-extrabold text-white font-['Space_Grotesk'] mt-1.5 leading-snug">
                    {plan.title}
                  </h3>
                </div>
                <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-blue-400 shrink-0">
                  <Dumbbell className="w-4 h-4 -rotate-45" />
                </div>
              </div>

              <div className="text-xs text-neutral-400">
                Created by Head Coach <strong className="text-white">{trainer.fullName}</strong> ({plan.createdAt})
              </div>

              {/* Days List */}
              <div className="space-y-2.5 pt-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                  {plan.days.length} Routine Split Days:
                </div>
                {plan.days.map((day, idx) => (
                  <div key={idx} className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1.5">
                    <div className="font-bold text-white text-xs flex items-center justify-between">
                      <span>{day.dayName}</span>
                      <span className="text-[10px] text-neutral-400">{day.exercises.length} Exercises</span>
                    </div>
                    <div className="text-[11px] text-[#00F59B]">{day.focus}</div>
                    <div className="text-[10px] text-neutral-400 line-clamp-1">
                      {day.exercises.map((e) => e.name).join(', ')}
                    </div>
                  </div>
                ))}
              </div>

              {/* Dietary notes */}
              {plan.dietaryRecommendations && (
                <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-xs text-neutral-300">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-0.5">
                    Diet & Recovery Protocol:
                  </span>
                  {plan.dietaryRecommendations}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-white/5 flex items-center justify-between gap-3">
              <button
                onClick={() => setAssignModalPlan(plan)}
                className="w-full py-2.5 rounded-xl bg-[#00F59B] text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:brightness-110 shadow-lg shadow-[#00F59B]/20"
              >
                <UserCheck className="w-4 h-4" />
                <span>Assign to Client</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Assign Modal */}
      {assignModalPlan && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#11131A] border border-white/10 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold text-white font-['Space_Grotesk']">
                Assign Routine to Athlete
              </h3>
              <button onClick={() => setAssignModalPlan(null)} className="text-neutral-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-neutral-300 space-y-3">
              <div className="p-3 rounded-xl bg-white/5">
                <div className="font-bold text-white">{assignModalPlan.title}</div>
                <div className="text-neutral-400">Goal: {assignModalPlan.targetGoal}</div>
              </div>

              <div>
                <label className="font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                  Select Athlete from your Roster:
                </label>
                <select
                  value={selectedMemberToAssign}
                  onChange={(e) => setSelectedMemberToAssign(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#181A24] border border-white/10 text-white outline-none"
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.fullName} ({m.memberId})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
              <button
                onClick={() => setAssignModalPlan(null)}
                className="px-4 py-2 rounded-xl bg-white/5 text-neutral-300 font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAssign}
                className="px-5 py-2 rounded-xl bg-[#00F59B] text-black font-extrabold uppercase tracking-wider shadow-lg shadow-[#00F59B]/20"
              >
                Assign Routine
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create New Workout Split Modal Form */}
      {formOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#11131A] border border-white/10 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto text-xs text-neutral-300">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-xl font-bold text-white font-['Space_Grotesk']">
                Design New Workout Protocol
              </h3>
              <button onClick={() => setFormOpen(false)} className="text-neutral-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveWorkout} className="space-y-4">
              <div>
                <label className="font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                  Routine Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Spartan Strength & Powerlifting Protocol"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-blue-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                    Primary Goal
                  </label>
                  <select
                    value={targetGoal}
                    onChange={(e) => setTargetGoal(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#181A24] border border-white/10 text-white outline-none"
                  >
                    <option value="Muscle Hypertrophy">Muscle Hypertrophy</option>
                    <option value="Weight Loss">Weight Loss</option>
                    <option value="Strength & Conditioning">Strength & Conditioning</option>
                    <option value="Endurance">Endurance</option>
                    <option value="Mobility & Rehab">Mobility & Rehab</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                    Difficulty Level
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#181A24] border border-white/10 text-white outline-none"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Elite Athlete">Elite Athlete</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                  Nutrition & Recovery Recommendations
                </label>
                <textarea
                  rows={2}
                  value={dietaryRecommendations}
                  onChange={(e) => setDietaryRecommendations(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white outline-none"
                />
              </div>

              {/* Days Editor */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold uppercase tracking-wider text-neutral-300">
                    Split Days Configuration ({days.length} Days)
                  </span>
                  <button
                    type="button"
                    onClick={handleAddDay}
                    className="px-3 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Day</span>
                  </button>
                </div>

                {days.map((day, dIdx) => (
                  <div key={dIdx} className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={day.dayName}
                        onChange={(e) => {
                          const updated = [...days];
                          updated[dIdx].dayName = e.target.value;
                          setDays(updated);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white font-bold"
                      />
                      <input
                        type="text"
                        value={day.focus}
                        onChange={(e) => {
                          const updated = [...days];
                          updated[dIdx].focus = e.target.value;
                          setDays(updated);
                        }}
                        placeholder="Focus Area"
                        className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[#00F59B]"
                      />
                    </div>

                    {/* Exercises */}
                    <div className="space-y-2">
                      {day.exercises.map((ex, eIdx) => (
                        <div key={ex.id} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={ex.name}
                            onChange={(e) => {
                              const updated = [...days];
                              updated[dIdx].exercises[eIdx].name = e.target.value;
                              setDays(updated);
                            }}
                            className="flex-1 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white"
                          />
                          <input
                            type="number"
                            value={ex.sets}
                            onChange={(e) => {
                              const updated = [...days];
                              updated[dIdx].exercises[eIdx].sets = Number(e.target.value);
                              setDays(updated);
                            }}
                            className="w-16 px-2 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-center"
                            placeholder="Sets"
                          />
                          <input
                            type="text"
                            value={ex.reps}
                            onChange={(e) => {
                              const updated = [...days];
                              updated[dIdx].exercises[eIdx].reps = e.target.value;
                              setDays(updated);
                            }}
                            className="w-20 px-2 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-center"
                            placeholder="Reps"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveExercise(dIdx, eIdx)}
                            className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-lg"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => handleAddExerciseToDay(dIdx)}
                        className="text-[11px] text-blue-400 hover:text-white font-bold flex items-center gap-1 mt-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Exercise</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-neutral-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-blue-600 text-white font-extrabold uppercase tracking-wider shadow-lg shadow-blue-500/20"
                >
                  Save Workout Routine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
