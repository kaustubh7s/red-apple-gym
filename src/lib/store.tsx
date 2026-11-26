'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Member,
  Trainer,
  PaymentRecord,
  AdmissionLead,
  WorkoutPlan,
  FitnessMeasurement,
  NotificationItem,
  WhatsAppLog,
  UserRole,
  AttendanceRecord,
  GymSettings,
  MembershipPlanType,
  MembershipStatus,
  ExpiryCalculation,
  PaymentMode,
  PaymentStatus,
  MembershipPlanItem,
  MembershipCategory
} from './types';
import { calculateMembershipCountdown } from './dateUtils';
import {
  initialMembers,
  initialSoleTrainer,
  initialPayments,
  initialLeads,
  initialWorkoutPlans,
  initialFitnessMeasurements,
  initialNotifications,
  initialWhatsAppLogs,
  initialGymSettings,
  PREDEFINED_PLANS,
  INITIAL_MEMBERSHIP_PLANS,
  getRelativeDOB
} from './data';
import { supabase } from './supabaseClient';
import { idbGet, idbSet, safePersist } from './storage';
import { compressAthletePhoto } from './imageCompression';

interface AppContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  gymSettings: GymSettings;
  updateGymSettings: (settings: Partial<GymSettings>) => void;

  // Membership Plans & Editable Pricing
  membershipPlans: MembershipPlanItem[];
  updateMembershipPlanPrice: (type: MembershipPlanType, gymOnlyPrice: number, gymCardioPrice: number) => void;
  updateAllMembershipPlans: (plans: MembershipPlanItem[]) => void;

  // Single Master Trainer
  trainer: Trainer;
  updateTrainer: (updates: Partial<Trainer>) => void;

  // Real-Time Expiry & Remaining Days Calculation
  calculateExpiryInfo: (joinDateStr: string, plan: MembershipPlanType, customDurationDays?: number) => ExpiryCalculation;
  calculateRemainingDays: (expiryDateStr: string) => { remainingDays: number; remainingDaysText: string; status: MembershipStatus; statusColor: 'green' | 'yellow' | 'red' };

  // Members
  members: Member[];
  addMember: (member: Omit<Member, 'id' | 'memberId' | 'attendancePercentage' | 'remainingDays' | 'remainingDaysText' | 'status' | 'expiryDate'> & { expiryDate?: string }) => Member;
  updateMember: (id: string, updates: Partial<Member>) => void;
  deleteMember: (id: string) => void;
  renewMember: (
    id: string,
    plan: MembershipPlanType,
    customDays?: number,
    customAmount?: number,
    paymentDetails?: { amountPaid?: number; paymentMode?: PaymentMode }
  ) => void;

  // Payments
  payments: PaymentRecord[];
  addPayment: (payment: Omit<PaymentRecord, 'id' | 'receiptNumber'>) => PaymentRecord;

  // Admissions & Leads
  leads: AdmissionLead[];
  addLead: (lead: Omit<AdmissionLead, 'id' | 'leadId' | 'status' | 'createdAt'>) => Promise<AdmissionLead>;
  refreshLeads: () => Promise<AdmissionLead[]>;
  convertLeadToMember: (
    leadId: string,
    plan: MembershipPlanType,
    customDays?: number,
    customFee?: number,
    amountPaid?: number,
    paymentMode?: PaymentMode,
    dueAmount?: number,
    category?: MembershipCategory
  ) => Member | null;
  updateLeadStatus: (leadId: string, status: AdmissionLead['status']) => void;

  // Attendance
  attendanceRecords: AttendanceRecord[];
  checkInMember: (memberId: string) => { success: boolean; message: string };
  getMemberAttendanceHistory: (memberId: string) => AttendanceRecord[];

  // Workouts
  workoutPlans: WorkoutPlan[];
  addWorkoutPlan: (plan: Omit<WorkoutPlan, 'id' | 'createdAt'>) => WorkoutPlan;
  assignWorkoutToMember: (memberId: string, workoutId: string) => void;

  // Fitness Measurements
  fitnessMeasurements: FitnessMeasurement[];
  addFitnessMeasurement: (measurement: Omit<FitnessMeasurement, 'id'>) => void;
  deleteFitnessMeasurement: (id: string) => void;

  // Notifications
  notifications: NotificationItem[];
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;
  addNotification: (notif: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => void;

  // WhatsApp Automation
  whatsAppLogs: WhatsAppLog[];
  sendWhatsAppMessage: (recipientName: string, mobile: string, type: WhatsAppLog['messageType'], body: string) => string;
  generateWhatsAppLink: (mobile: string, text: string) => string;

  // Authentication & Security
  adminPassword: string;
  trainerPassword: string;
  isAdminAuthenticated: boolean;
  isTrainerAuthenticated: boolean;
  loginAdmin: (password: string) => boolean | Promise<boolean>;
  loginTrainer: (password: string) => boolean | Promise<boolean>;
  logoutAdmin: () => void;
  logoutTrainer: () => void;
  deactivateAdminSession: () => void;
  recordAdminActivity: () => void;
  updateAdminPassword: (currentOrMaster: string, newPass: string) => Promise<{ success: boolean; message: string }>;
  updateTrainerPassword: (currentOrMaster: string, newPass: string) => Promise<{ success: boolean; message: string }>;

  // Reset & Backup
  resetToDefaults: () => void;
  clearDemoMembers: () => void;
  importFullBackup: (data: any) => boolean;
}

export const MASTER_KEY = 'masterkey';
export const DEFAULT_ADMIN_PASSWORD = 'Prashant@123';
export const DEFAULT_TRAINER_PASSWORD = 'trainer123';

const AppContext = createContext<AppContextType | undefined>(undefined);

// Plan duration in days
export const PLAN_DAYS_MAP: Record<MembershipPlanType, number> = {
  'Monthly': 30,
  'Quarterly': 90,
  'Half-Yearly': 180,
  'Annual': 365,
  'Custom': 30
};

export const PLAN_PRICE_MAP: Record<MembershipPlanType, number> = {
  'Monthly': 800,
  'Quarterly': 2100,
  'Half-Yearly': 4000,
  'Annual': 7000,
  'Custom': 1000
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [role, setRole] = useState<UserRole>('super_admin');
  const [gymSettings, setGymSettings] = useState<GymSettings>(initialGymSettings);
  const [membershipPlans, setMembershipPlans] = useState<MembershipPlanItem[]>(INITIAL_MEMBERSHIP_PLANS);

  const [trainer, setTrainer] = useState<Trainer>(initialSoleTrainer);
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [payments, setPayments] = useState<PaymentRecord[]>(initialPayments);
  const [leads, setLeads] = useState<AdmissionLead[]>(initialLeads);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>(initialWorkoutPlans);
  const [fitnessMeasurements, setFitnessMeasurements] = useState<FitnessMeasurement[]>(initialFitnessMeasurements);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [whatsAppLogs, setWhatsAppLogs] = useState<WhatsAppLog[]>(initialWhatsAppLogs);

  // Authentication State
  const [adminPassword, setAdminPassword] = useState<string>(DEFAULT_ADMIN_PASSWORD);
  const [trainerPassword, setTrainerPassword] = useState<string>(DEFAULT_TRAINER_PASSWORD);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [isTrainerAuthenticated, setIsTrainerAuthenticated] = useState<boolean>(false);

  // Dynamic Remaining Days & Status Calculator - Single Source of Truth
  const calculateRemainingDays = (expiryDateStr: string) => {
    const calc = calculateMembershipCountdown(expiryDateStr);
    return {
      remainingDays: calc.remainingDays,
      remainingDaysText: calc.remainingDaysText,
      status: calc.status,
      statusColor: calc.statusColor
    };
  };

  // Automatic Expiry Calculator from Join Date & Plan Duration
  const calculateExpiryInfo = (joinDateStr: string, plan: MembershipPlanType, customDurationDays?: number): ExpiryCalculation => {
    const [year, month, day] = joinDateStr.split('-').map(Number);
    const durationDays = plan === 'Custom' ? (customDurationDays || 30) : PLAN_DAYS_MAP[plan];

    const joinDateObj = new Date(year, month - 1, day);
    const expiryDateObj = new Date(joinDateObj);
    expiryDateObj.setDate(joinDateObj.getDate() + durationDays);

    const expYear = expiryDateObj.getFullYear();
    const expMonth = String(expiryDateObj.getMonth() + 1).padStart(2, '0');
    const expDay = String(expiryDateObj.getDate()).padStart(2, '0');
    const expiryDate = `${expYear}-${expMonth}-${expDay}`;

    const rem = calculateRemainingDays(expiryDate);

    return {
      joinDate: joinDateStr,
      expiryDate,
      durationDays,
      remainingDays: rem.remainingDays,
      statusBadge: rem.status,
      statusColor: rem.statusColor,
      remainingDaysText: rem.remainingDaysText
    };
  };

  const updateMembershipPlanPrice = (type: MembershipPlanType, gymOnlyPrice: number, gymCardioPrice: number) => {
    setMembershipPlans((prev) =>
      prev.map((p) => (p.type === type ? { ...p, gymOnlyPrice, gymCardioPrice } : p))
    );
  };

  const updateAllMembershipPlans = (newPlans: MembershipPlanItem[]) => {
    setMembershipPlans(newPlans);
  };

  // Sync real-time remaining days & statuses whenever members are loaded
  const refreshMemberRemainingDays = (rawMembers: Member[]): Member[] => {
    const currentYear = new Date().getFullYear();
    return rawMembers.map((m) => {
      const rem = calculateRemainingDays(m.expiryDate);
      let dob = m.dateOfBirth;
      // Auto-assign sample demo birthdays dynamically relative to current date if missing or outdated
      if (!dob || dob === '1997-10-24' || dob === '1995-10-24' || dob === '1992-10-25' || dob === '1999-10-26') {
        if (m.id === 'mem-1' || m.memberId === 'RED-8021') dob = getRelativeDOB(0, currentYear - 29);
        else if (m.id === 'mem-4' || m.memberId === 'RED-8024') dob = getRelativeDOB(0, currentYear - 31);
        else if (m.id === 'mem-3' || m.memberId === 'RED-8023') dob = getRelativeDOB(1, currentYear - 34);
        else if (m.id === 'mem-2' || m.memberId === 'RED-8022') dob = getRelativeDOB(3, currentYear - 27);
      }
      return {
        ...m,
        dateOfBirth: dob,
        remainingDays: rem.remainingDays,
        remainingDaysText: rem.remainingDaysText,
        status: rem.status
      };
    });
  };

  // Fetch & synchronize online admission applications from Supabase Cloud
  const refreshLeads = async (): Promise<AdmissionLead[]> => {
    if (!supabase) return leads;
    try {
      const { data, error } = await supabase
        .from('admission_leads')
        .select('*')
        .neq('id', 'CONFIG_AUTH_PASSWORDS')
        .neq('status', 'SYSTEM_CONFIG')
        .order('created_at', { ascending: false });

      if (!error && data) {
        const mappedLeads: AdmissionLead[] = data.map((d: any) => {
          let extra: any = {};
          let medConditions = d.medical_conditions || 'None';
          if (typeof d.medical_conditions === 'string' && d.medical_conditions.startsWith('{')) {
            try {
              extra = JSON.parse(d.medical_conditions);
              medConditions = extra.notes || 'None';
            } catch (e) {}
          }
          return {
            id: d.id,
            leadId: d.lead_id,
            fullName: d.full_name,
            photo: d.photo,
            mobile: d.mobile,
            whatsapp: d.whatsapp,
            email: d.email,
            gender: d.gender,
            age: d.age,
            preferredPlan: d.preferred_plan,
            customDays: d.custom_days,
            goal: d.goal,
            medicalConditions: medConditions,
            category: extra.category || 'Gym Only',
            weight: extra.weight,
            dateOfBirth: extra.dateOfBirth,
            chest: extra.chest,
            biceps: extra.biceps,
            waist: extra.waist,
            referredBy: extra.referredBy || d.referred_by,
            referrerMemberId: extra.referrerMemberId,
            referrerName: extra.referrerName,
            status: d.status,
            createdAt: d.created_at
          };
        });

        let mergedList: AdmissionLead[] = [];
        setLeads((prev) => {
          const map = new Map<string, AdmissionLead>();
          prev.forEach((l) => map.set(l.id || l.leadId, l));
          mappedLeads.forEach((l) => map.set(l.id || l.leadId, l));
          mergedList = Array.from(map.values()).sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
          try {
            localStorage.setItem('redapple_leads_v3', JSON.stringify(mergedList));
          } catch (e) {}
          idbSet('redapple_leads_v3', mergedList);
          return mergedList;
        });
        return mergedList;
      }
    } catch (e) {
      console.warn('Supabase lead fetch error:', e);
    }
    return leads;
  };

  // Initialize from LocalStorage & Supabase Cloud
  useEffect(() => {
    try {
      const savedGym = localStorage.getItem('redapple_gym_v5') || localStorage.getItem('redapple_gym_v4');
      if (savedGym) {
        const parsed = JSON.parse(savedGym);
        if (parsed.phone === '+91 98220 12345' || !parsed.phone) parsed.phone = '+91 85519 19595';
        if (parsed.whatsapp === '+919822012345' || !parsed.whatsapp) parsed.whatsapp = '+918551919595';
        parsed.ownerPhone = '+91 85519 19595';
        setGymSettings({ ...initialGymSettings, ...parsed });
      } else {
        setGymSettings(initialGymSettings);
      }

      const demoIds = new Set([
        'mem-1', 'mem-2', 'mem-3', 'mem-4', 'mem-5', 'mem-6', 'mem-7', 'mem-8', 'mem-9',
        'RED-8021', 'RED-8022', 'RED-8023', 'RED-8024', 'RED-8025', 'RED-8026', 'RED-8027', 'RED-8028', 'RED-8029'
      ]);

      const savedMembers =
        localStorage.getItem('redapple_members_v4') ||
        localStorage.getItem('redapple_members_v3') ||
        localStorage.getItem('redapple_members_v2');
      let cleanedMembers: Member[] = [];
      if (savedMembers) {
        try {
          const parsed = JSON.parse(savedMembers);
          if (Array.isArray(parsed)) {
            // Filter out all sample dummy members permanently
            cleanedMembers = parsed.filter((m: Member) => !demoIds.has(m.id) && !demoIds.has(m.memberId));
          }
        } catch (e) {
          cleanedMembers = [];
        }
      }
      setMembers(refreshMemberRemainingDays(cleanedMembers));
      try {
        localStorage.setItem('redapple_members_v4', JSON.stringify(cleanedMembers));
      } catch (e) {}

      // Check IndexedDB asynchronously: load authoritative real members, filter demo ones
      idbGet<Member[]>('redapple_members_v4').then((idbMembers) => {
        if (idbMembers && Array.isArray(idbMembers)) {
          const nonDemo = idbMembers.filter((m) => !demoIds.has(m.id) && !demoIds.has(m.memberId));
          setMembers((prev) => {
            const map = new Map<string, Member>();
            prev.forEach((m) => {
              if (!demoIds.has(m.id) && !demoIds.has(m.memberId)) map.set(m.id || m.memberId, m);
            });
            nonDemo.forEach((m) => map.set(m.id || m.memberId, m));
            const merged = Array.from(map.values());
            try {
              localStorage.setItem('redapple_members_v4', JSON.stringify(merged));
            } catch (e) {}
            idbSet('redapple_members_v4', merged);
            return refreshMemberRemainingDays(merged);
          });
        }
      });

      const savedTrainer = localStorage.getItem('redapple_trainer_v3');
      if (savedTrainer) {
        setTrainer(JSON.parse(savedTrainer));
      } else {
        setTrainer(initialSoleTrainer);
      }

      const savedPayments = localStorage.getItem('redapple_payments_v3') || localStorage.getItem('redapple_payments_v2');
      if (savedPayments) setPayments(JSON.parse(savedPayments));

      const savedLeads = localStorage.getItem('redapple_leads_v3') || localStorage.getItem('redapple_leads_v2');
      if (savedLeads) {
        try {
          setLeads(JSON.parse(savedLeads));
        } catch (e) {}
      }
      idbGet<AdmissionLead[]>('redapple_leads_v3').then((idbLeads) => {
        if (idbLeads && Array.isArray(idbLeads)) {
          setLeads((prev) => {
            const map = new Map<string, AdmissionLead>();
            prev.forEach((l) => map.set(l.id || l.leadId, l));
            idbLeads.forEach((l) => map.set(l.id || l.leadId, l));
            return Array.from(map.values()).sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
          });
        }
      });

      const savedAttendance = localStorage.getItem('redapple_attendance_v3') || localStorage.getItem('redapple_attendance_v2');
      if (savedAttendance) setAttendanceRecords(JSON.parse(savedAttendance));

      const savedWorkouts = localStorage.getItem('redapple_workouts_v3') || localStorage.getItem('redapple_workouts_v2');
      if (savedWorkouts) setWorkoutPlans(JSON.parse(savedWorkouts));

      const savedMeasurements = localStorage.getItem('redapple_measurements_v3') || localStorage.getItem('redapple_measurements_v2');
      if (savedMeasurements) setFitnessMeasurements(JSON.parse(savedMeasurements));

      const savedNotifs = localStorage.getItem('redapple_notifs_v3') || localStorage.getItem('redapple_notifs_v2');
      if (savedNotifs) setNotifications(JSON.parse(savedNotifs));

      const savedPlans = localStorage.getItem('redapple_plans_v1');
      if (savedPlans) setMembershipPlans(JSON.parse(savedPlans));

      const savedRole = (localStorage.getItem('redapple_role_v3') || localStorage.getItem('redapple_role_v2')) as UserRole;
      if (savedRole) setRole(savedRole);

      // Auth Passwords & Active Session Persistence
      const savedAdminPass = localStorage.getItem('redapple_auth_admin_pass_v1');
      if (savedAdminPass) setAdminPassword(savedAdminPass);

      const savedTrainerPass = localStorage.getItem('redapple_auth_trainer_pass_v1');
      if (savedTrainerPass) setTrainerPassword(savedTrainerPass);

      const adminSession = localStorage.getItem('redapple_admin_session');
      const adminSessionTime = localStorage.getItem('redapple_admin_session_time');
      const now = Date.now();
      const ADMIN_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes inactivity limit

      if (adminSession === 'active' && adminSessionTime) {
        const elapsed = now - Number(adminSessionTime);
        if (elapsed < ADMIN_TIMEOUT_MS) {
          setIsAdminAuthenticated(true);
          localStorage.setItem('redapple_admin_session_time', String(now));
        } else {
          // Session expired due to inactivity - lock dashboard
          localStorage.removeItem('redapple_admin_session');
          localStorage.removeItem('redapple_admin_session_time');
          setIsAdminAuthenticated(false);
        }
      } else {
        setIsAdminAuthenticated(false);
      }

      const trainerSession = localStorage.getItem('redapple_trainer_session');
      if (trainerSession === 'active') setIsTrainerAuthenticated(true);

      // Async fetch from Supabase Cloud Database if configured
      if (supabase) {
        supabase
          .from('members')
          .select('*')
          .then(({ data, error }) => {
            if (!error && data && data.length > 0) {
              const mapped: Member[] = data.map((d: any) => ({
                id: d.id,
                memberId: d.member_id,
                fullName: d.full_name,
                photo: d.photo,
                mobile: d.mobile,
                whatsapp: d.whatsapp,
                email: d.email,
                gender: d.gender,
                age: d.age,
                plan: d.plan,
                customDurationDays: d.custom_duration_days,
                joinDate: d.join_date,
                expiryDate: d.expiry_date,
                status: d.status,
                remainingDays: d.remaining_days,
                remainingDaysText: d.remaining_days_text,
                attendancePercentage: d.attendance_percentage,
                totalFee: Number(d.total_fee || 0),
                amountPaid: Number(d.amount_paid || 0),
                dueAmount: Number(d.due_amount || 0),
                dueDate: d.due_date,
                paymentStatus: d.payment_status,
                emergencyContact: d.emergency_contact,
                bloodGroup: d.blood_group,
                notes: d.notes,
                assignedWorkoutId: d.assigned_workout_id
              }));
              // SAFE MERGE: Never replace or delete local members with partial cloud responses
              setMembers((prev) => {
                const map = new Map<string, Member>();
                prev.forEach((m) => map.set(m.id || m.memberId, m));
                mapped.forEach((m) => map.set(m.id || m.memberId, m));
                const merged = Array.from(map.values());
                try {
                  localStorage.setItem('redapple_members_v4', JSON.stringify(merged));
                } catch (e) {}
                idbSet('redapple_members_v4', merged);
                return refreshMemberRemainingDays(merged);
              });
            }
          });

        // Load admissions from Supabase Cloud
        refreshLeads();

        // Cross-device sync for Admin & Trainer passwords from Supabase Cloud
        const fetchCloudPasswords = async () => {
          if (!supabase) return;
          try {
            // 1. Try dedicated gym_config table first
            try {
              const { data: configData, error: configErr } = await supabase
                .from('gym_config')
                .select('value')
                .eq('key', 'AUTH_PASSWORDS')
                .maybeSingle();

              if (!configErr && configData && configData.value) {
                const cfg = configData.value as any;
                if (cfg.adminPass && typeof cfg.adminPass === 'string') {
                  setAdminPassword(cfg.adminPass);
                  localStorage.setItem('redapple_auth_admin_pass_v1', cfg.adminPass);
                }
                if (cfg.trainerPass && typeof cfg.trainerPass === 'string') {
                  setTrainerPassword(cfg.trainerPass);
                  localStorage.setItem('redapple_auth_trainer_pass_v1', cfg.trainerPass);
                }
                return;
              }
            } catch (cfgErr) {}

            // 2. Fallback to admission_leads record
            const { data, error } = await supabase
              .from('admission_leads')
              .select('medical_conditions')
              .eq('id', 'CONFIG_AUTH_PASSWORDS')
              .maybeSingle();

            if (!error && data && data.medical_conditions) {
              try {
                const cfg = JSON.parse(data.medical_conditions);
                if (cfg.adminPass && typeof cfg.adminPass === 'string') {
                  setAdminPassword(cfg.adminPass);
                  localStorage.setItem('redapple_auth_admin_pass_v1', cfg.adminPass);
                }
                if (cfg.trainerPass && typeof cfg.trainerPass === 'string') {
                  setTrainerPassword(cfg.trainerPass);
                  localStorage.setItem('redapple_auth_trainer_pass_v1', cfg.trainerPass);
                }
              } catch (parseErr) {}
            }
          } catch (syncErr) {
            console.warn('Auth cloud sync notice:', syncErr);
          }
        };

        fetchCloudPasswords();

        // Subscribe to live admission submissions and password updates from any device
        try {
          supabase.removeChannel(supabase.channel('public:admission_leads_realtime'));
          const channel = supabase
            .channel('public:admission_leads_realtime')
            .on(
              'postgres_changes',
              { event: '*', schema: 'public', table: 'admission_leads' },
              (payload: any) => {
                const recId = payload?.new?.id || payload?.old?.id;
                if (recId === 'CONFIG_AUTH_PASSWORDS') {
                  fetchCloudPasswords();
                } else {
                  refreshLeads();
                }
              }
            )
            .on(
              'postgres_changes',
              { event: '*', schema: 'public', table: 'gym_config' },
              () => {
                fetchCloudPasswords();
              }
            )
            .subscribe();
        } catch (subErr) {
          console.warn('Realtime admission sync notice:', subErr);
        }
      }
    } catch (e) {
      console.warn('Initialization error:', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem('redapple_gym_v4', JSON.stringify(gymSettings));
      localStorage.setItem('redapple_members_v4', JSON.stringify(members));
      localStorage.setItem('redapple_trainer_v3', JSON.stringify(trainer));
      localStorage.setItem('redapple_payments_v3', JSON.stringify(payments));
      localStorage.setItem('redapple_leads_v3', JSON.stringify(leads));
      localStorage.setItem('redapple_attendance_v3', JSON.stringify(attendanceRecords));
      localStorage.setItem('redapple_workouts_v3', JSON.stringify(workoutPlans));
      localStorage.setItem('redapple_measurements_v3', JSON.stringify(fitnessMeasurements));
      localStorage.setItem('redapple_notifs_v3', JSON.stringify(notifications));
      localStorage.setItem('redapple_plans_v1', JSON.stringify(membershipPlans));
      localStorage.setItem('redapple_role_v3', role);
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }, [gymSettings, members, trainer, payments, leads, attendanceRecords, workoutPlans, fitnessMeasurements, notifications, role, membershipPlans, isLoaded]);

  const addMember = (data: Omit<Member, 'id' | 'memberId' | 'attendancePercentage' | 'remainingDays' | 'remainingDaysText' | 'status' | 'expiryDate'> & { expiryDate?: string }) => {
    const id = `mem-${Date.now()}`;
    const randNum = Math.floor(1000 + Math.random() * 9000);
    const memberId = `RED-${randNum}`;

    // Calculate expiry date & remaining days automatically
    const expiryInfo = data.expiryDate
      ? {
          expiryDate: data.expiryDate,
          ...calculateRemainingDays(data.expiryDate)
        }
      : calculateExpiryInfo(data.joinDate, data.plan, data.customDurationDays);

    const cleanWhatsapp = (data.whatsapp && data.whatsapp.trim().length >= 7 ? data.whatsapp.trim() : data.mobile.trim());

    const newMember: Member = {
      ...data,
      mobile: data.mobile.trim(),
      whatsapp: cleanWhatsapp,
      id,
      memberId,
      expiryDate: expiryInfo.expiryDate,
      remainingDays: expiryInfo.remainingDays,
      remainingDaysText: expiryInfo.remainingDaysText,
      status: (expiryInfo as any).status || (expiryInfo as any).statusBadge,
      attendancePercentage: 100
    };

    setMembers((prev) => {
      const updated = [newMember, ...prev.filter((m) => m.id !== newMember.id && m.memberId !== newMember.memberId)];
      try {
        localStorage.setItem('redapple_members_v4', JSON.stringify(updated));
      } catch (e) {
        console.warn('LocalStorage quota notice, data preserved in IndexedDB:', e);
      }
      idbSet('redapple_members_v4', updated);
      return updated;
    });

    // Background write to Supabase
    if (supabase) {
      supabase
        .from('members')
        .insert({
          id: newMember.id,
          member_id: newMember.memberId,
          full_name: newMember.fullName,
          photo: newMember.photo,
          mobile: newMember.mobile,
          whatsapp: newMember.whatsapp,
          email: newMember.email,
          gender: newMember.gender,
          age: newMember.age,
          plan: newMember.plan,
          custom_duration_days: newMember.customDurationDays,
          join_date: newMember.joinDate,
          expiry_date: newMember.expiryDate,
          status: newMember.status,
          remaining_days: newMember.remainingDays,
          remaining_days_text: newMember.remainingDaysText,
          attendance_percentage: newMember.attendancePercentage,
          total_fee: newMember.totalFee,
          amount_paid: newMember.amountPaid,
          due_amount: newMember.dueAmount,
          due_date: newMember.dueDate,
          payment_status: newMember.paymentStatus,
          emergency_contact: newMember.emergencyContact,
          blood_group: newMember.bloodGroup,
          notes: newMember.notes,
          assigned_workout_id: newMember.assignedWorkoutId
        })
        .then(({ error }) => {
          if (error) console.warn('Supabase member insert error:', error.message);
        });
    }

    // Record payment if paid
    if (data.amountPaid > 0) {
      addPayment({
        memberId: id,
        memberName: data.fullName,
        plan: data.plan,
        amount: data.amountPaid,
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMode: 'UPI',
        status: data.paymentStatus,
        taxAmount: Math.round(data.amountPaid * 0.18),
        notes: `Initial membership fee for ${data.plan} plan.`
      });
    }

    // Trigger notification
    addNotification({
      title: '🌟 New Member Registered',
      message: `${data.fullName} joined on ${data.plan} plan (${memberId}). Valid until ${newMember.expiryDate} (${newMember.remainingDaysText}).`,
      type: 'admission',
      targetRole: 'all'
    });

    return newMember;
  };

  const updateMember = (id: string, updates: Partial<Member>) => {
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          const updated = { ...m, ...updates };
          if (updates.whatsapp !== undefined || updates.mobile !== undefined) {
            const finalMob = (updates.mobile ?? m.mobile).trim();
            const rawWa = updates.whatsapp ?? m.whatsapp;
            updated.mobile = finalMob;
            updated.whatsapp = rawWa && rawWa.trim().length >= 7 ? rawWa.trim() : finalMob;
          }
          if (updates.expiryDate || updates.joinDate || updates.plan) {
            const expStr = updates.expiryDate || calculateExpiryInfo(updates.joinDate || m.joinDate, updates.plan || m.plan, updates.customDurationDays || m.customDurationDays).expiryDate;
            const rem = calculateRemainingDays(expStr);
            updated.expiryDate = expStr;
            updated.remainingDays = rem.remainingDays;
            updated.remainingDaysText = rem.remainingDaysText;
            updated.status = rem.status;
          }

          if (supabase) {
            supabase
              .from('members')
              .update({
                full_name: updated.fullName,
                photo: updated.photo,
                mobile: updated.mobile,
                whatsapp: updated.whatsapp,
                email: updated.email,
                plan: updated.plan,
                custom_duration_days: updated.customDurationDays,
                join_date: updated.joinDate,
                expiry_date: updated.expiryDate,
                status: updated.status,
                remaining_days: updated.remainingDays,
                remaining_days_text: updated.remainingDaysText,
                total_fee: updated.totalFee,
                amount_paid: updated.amountPaid,
                due_amount: updated.dueAmount,
                payment_status: updated.paymentStatus,
                notes: updated.notes
              })
              .eq('id', id)
              .then(({ error }) => {
                if (error) console.warn('Supabase member update error:', error.message);
              });
          }

          return updated;
        }
        return m;
      })
    );
  };

  const deleteMember = (id: string) => {
    setMembers((prev) => {
      const updated = prev.filter((m) => m.id !== id);
      try {
        localStorage.setItem('redapple_members_v4', JSON.stringify(updated));
      } catch (e) {}
      idbSet('redapple_members_v4', updated);
      return updated;
    });
    if (supabase) {
      supabase.from('members').delete().eq('id', id).then(({ error }) => {
        if (error) console.warn('Supabase member delete error:', error.message);
      });
    }
  };

  const renewMember = (
    id: string,
    plan: MembershipPlanType,
    customDays?: number,
    customAmount?: number,
    paymentDetails?: { amountPaid?: number; paymentMode?: PaymentMode }
  ) => {
    const member = members.find((m) => m.id === id);
    if (!member) return;

    const durationDays = plan === 'Custom' ? (customDays || 30) : PLAN_DAYS_MAP[plan];
    const price = plan === 'Custom' ? (customAmount || 1000) : PLAN_PRICE_MAP[plan];

    const actualPaid = paymentDetails?.amountPaid !== undefined ? paymentDetails.amountPaid : price;
    const due = Math.max(0, price - actualPaid);
    const paymentMode = paymentDetails?.paymentMode || 'UPI';
    const paymentStatus: PaymentStatus = due === 0 ? 'Paid' : actualPaid > 0 ? 'Partially Paid' : 'Pending';

    // Extend expiry from existing expiry date if in future, else from today
    const [expYear, expMonth, expDay] = member.expiryDate.split('-').map(Number);
    const currentExp = new Date(expYear, expMonth - 1, expDay);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const baseDate = currentExp > today ? currentExp : today;
    const newExpObj = new Date(baseDate);
    newExpObj.setDate(baseDate.getDate() + durationDays);

    const newExpYear = newExpObj.getFullYear();
    const newExpMonth = String(newExpObj.getMonth() + 1).padStart(2, '0');
    const newExpDay = String(newExpObj.getDate()).padStart(2, '0');
    const newExpiryStr = `${newExpYear}-${newExpMonth}-${newExpDay}`;

    const rem = calculateRemainingDays(newExpiryStr);

    updateMember(id, {
      plan,
      customDurationDays: customDays,
      expiryDate: newExpiryStr,
      remainingDays: rem.remainingDays,
      remainingDaysText: rem.remainingDaysText,
      status: rem.status,
      totalFee: member.totalFee + price,
      amountPaid: member.amountPaid + actualPaid,
      dueAmount: due,
      dueDate: newExpiryStr,
      paymentStatus
    });

    if (actualPaid > 0) {
      addPayment({
        memberId: id,
        memberName: member.fullName,
        plan,
        amount: actualPaid,
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMode,
        status: paymentStatus,
        taxAmount: Math.round(actualPaid * 0.18),
        notes: `Membership renewal (${durationDays} days added). New expiry: ${newExpiryStr}.`
      });
    }

    addNotification({
      title: '🎉 Membership Renewed',
      message: `${member.fullName} renewed ${plan} plan (+${durationDays} days) until ${newExpiryStr} (${rem.remainingDaysText}).`,
      type: 'payment',
      targetRole: 'all'
    });
  };

  const updateTrainer = (updates: Partial<Trainer>) => {
    setTrainer((prev) => ({ ...prev, ...updates }));
  };

  const addPayment = (data: Omit<PaymentRecord, 'id' | 'receiptNumber'>): PaymentRecord => {
    const id = `pay-${Date.now()}`;
    const receiptNumber = `RCP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newPay: PaymentRecord = {
      ...data,
      id,
      receiptNumber
    };
    setPayments((prev) => [newPay, ...prev]);

    if (supabase) {
      supabase
        .from('payments')
        .insert({
          id: newPay.id,
          receipt_number: newPay.receiptNumber,
          member_id: newPay.memberId,
          member_name: newPay.memberName,
          plan: newPay.plan,
          amount: newPay.amount,
          payment_date: newPay.paymentDate,
          payment_mode: newPay.paymentMode,
          status: newPay.status,
          tax_amount: newPay.taxAmount,
          notes: newPay.notes
        })
        .then(({ error }) => {
          if (error) console.warn('Supabase payment insert error:', error.message);
        });
    }

    return newPay;
  };

  const addLead = async (data: Omit<AdmissionLead, 'id' | 'leadId' | 'status' | 'createdAt'>): Promise<AdmissionLead> => {
    const id = `lead-${Date.now()}`;
    const leadId = `LD-${Math.floor(1000 + Math.random() * 9000)}`;

    let cleanPhoto = data.photo;
    if (cleanPhoto) {
      try {
        cleanPhoto = await compressAthletePhoto(cleanPhoto);
      } catch (e) {
        console.warn('Photo compression error in addLead:', e);
      }
    }

    const cleanWhatsapp = (data.whatsapp && data.whatsapp.trim().length >= 7 ? data.whatsapp.trim() : data.mobile.trim());

    const newLead: AdmissionLead = {
      ...data,
      mobile: data.mobile.trim(),
      whatsapp: cleanWhatsapp,
      photo: cleanPhoto,
      id,
      leadId,
      status: 'Pending',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };

    // Immediate dual persistence (LocalStorage + IndexedDB)
    setLeads((prev) => {
      const updated = [newLead, ...prev.filter((l) => l.id !== newLead.id && l.leadId !== newLead.leadId)];
      try {
        localStorage.setItem('redapple_leads_v3', JSON.stringify(updated));
      } catch (e) {
        console.warn('LocalStorage quota notice, data preserved in IndexedDB:', e);
      }
      idbSet('redapple_leads_v3', updated);
      return updated;
    });

    // Package extended metadata (category, weight, measurements, referral) safely into medical_conditions
    const packedMedical = JSON.stringify({
      notes: data.medicalConditions || 'None',
      category: data.category || 'Gym Only',
      weight: data.weight,
      dateOfBirth: data.dateOfBirth,
      chest: data.chest,
      biceps: data.biceps,
      waist: data.waist,
      referredBy: data.referredBy,
      referrerMemberId: data.referrerMemberId,
      referrerName: data.referrerName
    });

    if (supabase) {
      try {
        const { error } = await supabase
          .from('admission_leads')
          .insert({
            id: newLead.id,
            lead_id: newLead.leadId,
            full_name: newLead.fullName,
            photo: cleanPhoto,
            mobile: newLead.mobile,
            whatsapp: newLead.whatsapp,
            email: newLead.email,
            gender: newLead.gender,
            age: newLead.age,
            preferred_plan: newLead.preferredPlan,
            custom_days: newLead.customDays,
            goal: newLead.goal,
            medical_conditions: packedMedical,
            status: newLead.status
          });

        if (error) {
          console.warn('Supabase lead insert notice:', error.message);
        }
      } catch (err) {
        console.warn('Supabase lead insert network error:', err);
      }
    }

    addNotification({
      title: '⚡ New Admission Form Submitted',
      message: `${data.fullName} applied for ${data.preferredPlan} membership (${leadId}).`,
      type: 'admission',
      targetRole: 'all'
    });

    return newLead;
  };

  const convertLeadToMember = (
    leadId: string,
    plan: MembershipPlanType,
    customDays?: number,
    customFee?: number,
    amountPaid?: number,
    paymentMode: PaymentMode = 'UPI',
    dueAmount: number = 0,
    category?: MembershipCategory
  ): Member | null => {
    const lead = leads.find((l) => l.id === leadId || l.leadId === leadId);
    if (!lead) return null;

    const today = new Date().toISOString().split('T')[0];
    const durationDays = plan === 'Custom' ? (customDays || 30) : PLAN_DAYS_MAP[plan];
    const chosenCat = category || lead.category || 'Gym Only';
    const planItem = membershipPlans.find((p) => p.type === plan);
    const defaultPrice = planItem
      ? (chosenCat === 'Gym + Cardio' ? planItem.gymCardioPrice : planItem.gymOnlyPrice)
      : (plan === 'Custom' ? 1000 : PLAN_PRICE_MAP[plan]);
    const fee = customFee !== undefined ? customFee : defaultPrice;
    const paid = amountPaid !== undefined ? amountPaid : fee;
    const balance = dueAmount !== undefined ? dueAmount : Math.max(0, fee - paid);

    const expiryInfo = calculateExpiryInfo(today, plan, durationDays);

    const cleanWhatsapp = (lead.whatsapp && lead.whatsapp.trim().length >= 7 ? lead.whatsapp.trim() : lead.mobile.trim());

    const newMem = addMember({
      fullName: lead.fullName,
      photo: lead.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80',
      mobile: lead.mobile.trim(),
      whatsapp: cleanWhatsapp,
      email: lead.email,
      gender: lead.gender,
      age: lead.age,
      dateOfBirth: lead.dateOfBirth,
      plan,
      category: chosenCat,
      customDurationDays: customDays,
      joinDate: today,
      expiryDate: expiryInfo.expiryDate,
      totalFee: fee,
      amountPaid: paid,
      dueAmount: balance,
      dueDate: expiryInfo.expiryDate,
      paymentStatus: balance > 0 ? (paid > 0 ? 'Partially Paid' : 'Pending') : 'Paid',
      notes: `Goal: ${lead.goal}. Medical: ${lead.medicalConditions || 'None'}${lead.weight ? ` • Weight: ${lead.weight}kg` : ''}${lead.referredBy ? ` • Referred by: ${lead.referredBy}` : ''}`
    });

    updateLeadStatus(lead.id, 'Converted');
    return newMem;
  };

  const updateLeadStatus = (leadId: string, status: AdmissionLead['status']) => {
    setLeads((prev) => {
      const updated = prev.map((l) => (l.id === leadId || l.leadId === leadId ? { ...l, status } : l));
      try {
        localStorage.setItem('redapple_leads_v3', JSON.stringify(updated));
      } catch (e) {}
      idbSet('redapple_leads_v3', updated);
      return updated;
    });

    if (supabase) {
      supabase
        .from('admission_leads')
        .update({ status })
        .or(`id.eq.${leadId},lead_id.eq.${leadId}`)
        .then(({ error }) => {
          if (error) console.warn('Supabase lead update error:', error.message);
        });
    }
  };

  const checkInMember = (memberId: string) => {
    const member = members.find((m) => m.id === memberId || m.memberId.toLowerCase() === memberId.toLowerCase());
    if (!member) return { success: false, message: 'Member not found with this ID.' };

    const rem = calculateRemainingDays(member.expiryDate);
    if (rem.status === 'Expired') {
      return { success: false, message: `Access Denied: Membership expired (${rem.remainingDaysText}). Please renew at front desk.` };
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const existing = attendanceRecords.find((a) => a.memberId === member.id && a.date === todayStr);
    if (existing) {
      return { success: true, message: `Already Checked-In at ${existing.checkInTime} today! (${rem.remainingDaysText})` };
    }

    const newRecord: AttendanceRecord = {
      id: `att-${Date.now()}`,
      memberId: member.id,
      memberName: member.fullName,
      date: todayStr,
      checkInTime: timeStr,
      status: 'Present'
    };

    setAttendanceRecords((prev) => [newRecord, ...prev]);

    if (supabase) {
      supabase
        .from('attendance_records')
        .insert({
          id: newRecord.id,
          member_id: newRecord.memberId,
          member_name: newRecord.memberName,
          date: newRecord.date,
          check_in_time: newRecord.checkInTime,
          status: newRecord.status
        })
        .then(({ error }) => {
          if (error) console.warn('Supabase attendance insert error:', error.message);
        });
    }

    return { success: true, message: `Welcome ${member.fullName}! Check-in verified. [${rem.remainingDaysText}]` };
  };

  const getMemberAttendanceHistory = (memberId: string) => {
    return attendanceRecords.filter((a) => a.memberId === memberId);
  };

  const addWorkoutPlan = (planData: Omit<WorkoutPlan, 'id' | 'createdAt'>): WorkoutPlan => {
    const newPlan: WorkoutPlan = {
      ...planData,
      id: `wk-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setWorkoutPlans((prev) => [newPlan, ...prev]);
    return newPlan;
  };

  const assignWorkoutToMember = (memberId: string, workoutId: string) => {
    updateMember(memberId, { assignedWorkoutId: workoutId });
    const workout = workoutPlans.find((w) => w.id === workoutId);
    const member = members.find((m) => m.id === memberId);

    if (member && workout) {
      addNotification({
        title: '📋 Workout Plan Assigned',
        message: `${workout.title} assigned to ${member.fullName}.`,
        type: 'workout',
        targetRole: 'all'
      });
    }
  };

  const addFitnessMeasurement = (measurement: Omit<FitnessMeasurement, 'id'>) => {
    const newMeasurement: FitnessMeasurement = {
      ...measurement,
      id: `ms-${Date.now()}`
    };
    setFitnessMeasurements((prev) => [newMeasurement, ...prev]);
  };

  const deleteFitnessMeasurement = (id: string) => {
    setFitnessMeasurements((prev) => prev.filter((m) => m.id !== id));
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const addNotification = (notif: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => {
    const newItem: NotificationItem = {
      ...notif,
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: 'Just now',
      read: false
    };
    setNotifications((prev) => [newItem, ...prev]);
  };

  const generateWhatsAppLink = (mobile: string, text: string) => {
    const cleanNumber = mobile.replace(/[^0-9]/g, '');
    return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(text)}`;
  };

  const sendWhatsAppMessage = (recipientName: string, mobile: string, type: WhatsAppLog['messageType'], body: string) => {
    const newLog: WhatsAppLog = {
      id: `wa-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      recipientName,
      recipientMobile: mobile,
      messageType: type,
      messageBody: body,
      sentAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      status: 'Delivered'
    };
    setWhatsAppLogs((prev) => [newLog, ...prev]);
    return generateWhatsAppLink(mobile, body);
  };

  const updateGymSettings = (settings: Partial<GymSettings>) => {
    setGymSettings((prev) => ({ ...prev, ...settings }));
  };

  const loginAdmin = async (password: string): Promise<boolean> => {
    const clean = password.trim();
    if (clean === adminPassword || clean === MASTER_KEY) {
      setIsAdminAuthenticated(true);
      localStorage.setItem('redapple_admin_session', 'active');
      localStorage.setItem('redapple_admin_session_time', String(Date.now()));
      setRole('super_admin');
      return true;
    }
    // Fallback live cloud verification if admin password was updated on another device
    if (supabase) {
      try {
        const { data } = await supabase
          .from('admission_leads')
          .select('medical_conditions')
          .eq('id', 'CONFIG_AUTH_PASSWORDS')
          .maybeSingle();
        if (data?.medical_conditions) {
          const cfg = JSON.parse(data.medical_conditions);
          if (cfg.adminPass === clean) {
            setAdminPassword(clean);
            localStorage.setItem('redapple_auth_admin_pass_v1', clean);
            setIsAdminAuthenticated(true);
            localStorage.setItem('redapple_admin_session', 'active');
            localStorage.setItem('redapple_admin_session_time', String(Date.now()));
            setRole('super_admin');
            return true;
          }
        }
      } catch (err) {}
    }
    return false;
  };

  const recordAdminActivity = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('redapple_admin_session_time', String(Date.now()));
    }
  };

  const loginTrainer = async (password: string): Promise<boolean> => {
    const clean = password.trim();
    if (clean === trainerPassword || clean === MASTER_KEY) {
      setIsTrainerAuthenticated(true);
      localStorage.setItem('redapple_trainer_session', 'active');
      setRole('trainer');
      // STRICT ISOLATION: Trainer login must NEVER give admin access!
      setIsAdminAuthenticated(false);
      localStorage.removeItem('redapple_admin_session');
      localStorage.removeItem('redapple_admin_session_time');
      return true;
    }
    // Cross-device fallback check if password was updated on admin console
    if (supabase) {
      try {
        const { data } = await supabase
          .from('admission_leads')
          .select('medical_conditions')
          .eq('id', 'CONFIG_AUTH_PASSWORDS')
          .maybeSingle();
        if (data?.medical_conditions) {
          const cfg = JSON.parse(data.medical_conditions);
          if (cfg.trainerPass === clean) {
            setTrainerPassword(clean);
            localStorage.setItem('redapple_auth_trainer_pass_v1', clean);
            setIsTrainerAuthenticated(true);
            localStorage.setItem('redapple_trainer_session', 'active');
            setRole('trainer');
            // STRICT ISOLATION: Trainer login must NEVER give admin access!
            setIsAdminAuthenticated(false);
            localStorage.removeItem('redapple_admin_session');
            localStorage.removeItem('redapple_admin_session_time');
            return true;
          }
        }
      } catch (err) {}
    }
    return false;
  };

  const logoutAdmin = () => {
    setIsAdminAuthenticated(false);
    localStorage.removeItem('redapple_admin_session');
    localStorage.removeItem('redapple_admin_session_time');
  };

  const deactivateAdminSession = () => {
    logoutAdmin();
  };

  const logoutTrainer = () => {
    setIsTrainerAuthenticated(false);
    localStorage.removeItem('redapple_trainer_session');
  };

  const updateAdminPassword = async (currentOrMaster: string, newPass: string): Promise<{ success: boolean; message: string }> => {
    if (currentOrMaster !== adminPassword && currentOrMaster !== MASTER_KEY) {
      return { success: false, message: 'Invalid current password or master key.' };
    }
    if (!newPass || newPass.trim().length < 4) {
      return { success: false, message: 'Password must be at least 4 characters long.' };
    }
    const cleanPass = newPass.trim();
    setAdminPassword(cleanPass);
    localStorage.setItem('redapple_auth_admin_pass_v1', cleanPass);

    // Sync to Supabase Cloud so all devices receive the new admin password
    if (supabase) {
      try {
        await supabase
          .from('admission_leads')
          .upsert({
            id: 'CONFIG_AUTH_PASSWORDS',
            lead_id: 'CONFIG_AUTH_PASSWORDS',
            full_name: 'SYSTEM_AUTH_SYNC',
            photo: 'NONE',
            mobile: '0000000000',
            whatsapp: '0000000000',
            email: 'sys@redapple.local',
            gender: 'system',
            age: 0,
            preferred_plan: 'CONFIG',
            goal: 'AUTH_PASSWORDS',
            medical_conditions: JSON.stringify({ adminPass: cleanPass, trainerPass: trainerPassword }),
            status: 'SYSTEM_CONFIG'
          }, { onConflict: 'id' });
      } catch (e) {
        console.warn('Cloud admin password sync notice:', e);
      }

      try {
        await supabase
          .from('gym_config')
          .upsert({
            key: 'AUTH_PASSWORDS',
            value: { adminPass: cleanPass, trainerPass: trainerPassword }
          }, { onConflict: 'key' });
      } catch (cfgErr) {}
    }
    return { success: true, message: 'Admin master password updated and synced across all devices!' };
  };

  const updateTrainerPassword = async (currentOrMaster: string, newPass: string): Promise<{ success: boolean; message: string }> => {
    if (currentOrMaster !== adminPassword && currentOrMaster !== trainerPassword && currentOrMaster !== MASTER_KEY) {
      return { success: false, message: 'Invalid authorization password or master key.' };
    }
    if (!newPass || newPass.trim().length < 4) {
      return { success: false, message: 'Password must be at least 4 characters long.' };
    }
    const cleanPass = newPass.trim();
    setTrainerPassword(cleanPass);
    localStorage.setItem('redapple_auth_trainer_pass_v1', cleanPass);

    // Sync to Supabase Cloud so all devices (trainer phones, tablets) receive the new trainer password
    if (supabase) {
      try {
        await supabase
          .from('admission_leads')
          .upsert({
            id: 'CONFIG_AUTH_PASSWORDS',
            lead_id: 'CONFIG_AUTH_PASSWORDS',
            full_name: 'SYSTEM_AUTH_SYNC',
            photo: 'NONE',
            mobile: '0000000000',
            whatsapp: '0000000000',
            email: 'sys@redapple.local',
            gender: 'system',
            age: 0,
            preferred_plan: 'CONFIG',
            goal: 'AUTH_PASSWORDS',
            medical_conditions: JSON.stringify({ adminPass: adminPassword, trainerPass: cleanPass }),
            status: 'SYSTEM_CONFIG'
          }, { onConflict: 'id' });
      } catch (e) {
        console.warn('Cloud trainer password sync notice:', e);
      }

      try {
        await supabase
          .from('gym_config')
          .upsert({
            key: 'AUTH_PASSWORDS',
            value: { adminPass: adminPassword, trainerPass: cleanPass }
          }, { onConflict: 'key' });
      } catch (cfgErr) {}
    }
    return { success: true, message: 'Trainer password updated and synced across all devices!' };
  };

  const resetToDefaults = () => {
    localStorage.clear();
    setMembers(refreshMemberRemainingDays(initialMembers));
    setTrainer(initialSoleTrainer);
    setPayments(initialPayments);
    setLeads(initialLeads);
    setWorkoutPlans(initialWorkoutPlans);
    setFitnessMeasurements(initialFitnessMeasurements);
    setNotifications(initialNotifications);
    setWhatsAppLogs(initialWhatsAppLogs);
    setGymSettings(initialGymSettings);
    setRole('super_admin');
    setAdminPassword(DEFAULT_ADMIN_PASSWORD);
    setTrainerPassword(DEFAULT_TRAINER_PASSWORD);
    setIsAdminAuthenticated(false);
    setIsTrainerAuthenticated(false);
  };

  const clearDemoMembers = () => {
    const demoIds = new Set([
      'mem-1', 'mem-2', 'mem-3', 'mem-4', 'mem-5', 'mem-6', 'mem-7', 'mem-8', 'mem-9',
      'RED-8021', 'RED-8022', 'RED-8023', 'RED-8024', 'RED-8025', 'RED-8026', 'RED-8027', 'RED-8028', 'RED-8029'
    ]);
    setMembers((prev) => {
      const realOnly = prev.filter((m) => !demoIds.has(m.id) && !demoIds.has(m.memberId));
      try {
        localStorage.setItem('redapple_members_v4', JSON.stringify(realOnly));
      } catch (e) {}
      idbSet('redapple_members_v4', realOnly);
      return realOnly;
    });
  };

  const importFullBackup = (data: any): boolean => {
    try {
      if (!data || typeof data !== 'object') return false;
      if (Array.isArray(data.members)) {
        setMembers(data.members);
        try {
          localStorage.setItem('redapple_members_v4', JSON.stringify(data.members));
        } catch (e) {}
        idbSet('redapple_members_v4', data.members);
      }
      if (Array.isArray(data.leads)) {
        setLeads(data.leads);
        try {
          localStorage.setItem('redapple_leads_v3', JSON.stringify(data.leads));
        } catch (e) {}
        idbSet('redapple_leads_v3', data.leads);
      }
      if (Array.isArray(data.payments)) {
        setPayments(data.payments);
        try {
          localStorage.setItem('redapple_payments_v3', JSON.stringify(data.payments));
        } catch (e) {}
        idbSet('redapple_payments_v3', data.payments);
      }
      if (Array.isArray(data.attendanceRecords)) {
        setAttendanceRecords(data.attendanceRecords);
        try {
          localStorage.setItem('redapple_attendance_v3', JSON.stringify(data.attendanceRecords));
        } catch (e) {}
        idbSet('redapple_attendance_v3', data.attendanceRecords);
      }
      if (data.gymSettings) {
        setGymSettings(data.gymSettings);
        try {
          localStorage.setItem('redapple_gym_v4', JSON.stringify(data.gymSettings));
        } catch (e) {}
      }
      return true;
    } catch (e) {
      console.warn('Backup import error:', e);
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        gymSettings,
        updateGymSettings,
        membershipPlans,
        updateMembershipPlanPrice,
        updateAllMembershipPlans,
        trainer,
        updateTrainer,
        calculateExpiryInfo,
        calculateRemainingDays,
        members,
        addMember,
        updateMember,
        deleteMember,
        renewMember,
        payments,
        addPayment,
        leads,
        addLead,
        refreshLeads,
        convertLeadToMember,
        updateLeadStatus,
        attendanceRecords,
        checkInMember,
        getMemberAttendanceHistory,
        workoutPlans,
        addWorkoutPlan,
        assignWorkoutToMember,
        fitnessMeasurements,
        addFitnessMeasurement,
        deleteFitnessMeasurement,
        notifications,
        markNotificationRead,
        clearAllNotifications,
        addNotification,
        whatsAppLogs,
        sendWhatsAppMessage,
        generateWhatsAppLink,
        adminPassword,
        trainerPassword,
        isAdminAuthenticated,
        isTrainerAuthenticated,
        loginAdmin,
        loginTrainer,
        logoutAdmin,
        logoutTrainer,
        deactivateAdminSession,
        recordAdminActivity,
        updateAdminPassword,
        updateTrainerPassword,
        resetToDefaults,
        clearDemoMembers,
        importFullBackup
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
