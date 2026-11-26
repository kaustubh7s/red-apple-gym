export type UserRole = 'super_admin' | 'admin' | 'trainer' | 'member';

export type MembershipPlanType = 'Monthly' | 'Quarterly' | 'Half-Yearly' | 'Annual' | 'Custom';

export type MembershipStatus = 'Active' | 'Expiring Soon' | 'Expired';

export type PaymentStatus = 'Paid' | 'Pending' | 'Partially Paid' | 'Overdue';

export type PaymentMode = 'UPI' | 'Cash' | 'Card' | 'Bank Transfer';

export type MembershipCategory = 'Gym Only' | 'Gym + Cardio';

export interface MembershipPlanItem {
  id: string;
  type: MembershipPlanType;
  name: string;
  durationDays: number;
  durationLabel: string;
  gymOnlyPrice: number;
  gymCardioPrice: number;
  badge?: string;
  description: string;
  features: string[];
}

export interface PlanConfig {
  type: MembershipPlanType;
  name: string;
  durationDays: number;
  price: number;
  popular?: boolean;
  features: string[];
}

export interface ExpiryCalculation {
  joinDate: string;
  expiryDate: string;
  durationDays: number;
  remainingDays: number;
  statusBadge: MembershipStatus;
  statusColor: 'green' | 'yellow' | 'red';
  remainingDaysText: string;
}

export interface Member {
  id: string;
  memberId: string;
  fullName: string;
  photo: string;
  mobile: string;
  whatsapp: string;
  email: string;
  gender: 'Male' | 'Female' | 'Other';
  age: number;
  plan: MembershipPlanType;
  category?: MembershipCategory;
  customDurationDays?: number;
  joinDate: string; // YYYY-MM-DD
  expiryDate: string; // YYYY-MM-DD
  status: MembershipStatus;
  remainingDays: number;
  remainingDaysText: string;
  attendancePercentage: number;
  totalFee: number;
  amountPaid: number;
  dueAmount: number;
  dueDate: string;
  paymentStatus: PaymentStatus;
  notes?: string;
  emergencyContact?: string;
  bloodGroup?: string;
  dateOfBirth?: string;
  assignedWorkoutId?: string;
}

export interface Trainer {
  id: string;
  trainerId: string;
  fullName: string;
  photo: string;
  mobile: string;
  whatsapp: string;
  email: string;
  specialization: string[];
  experienceYears: number;
  certifications: string[];
  bio: string;
  rating: number;
}

export interface PaymentRecord {
  id: string;
  receiptNumber: string;
  memberId: string;
  memberName: string;
  plan: MembershipPlanType;
  amount: number;
  paymentDate: string;
  paymentMode: PaymentMode;
  status: PaymentStatus;
  taxAmount: number;
  notes?: string;
}

export interface AdmissionLead {
  id: string;
  leadId: string;
  fullName: string;
  photo: string; // Mandatory athlete photo
  mobile: string;
  whatsapp: string;
  email: string;
  gender: 'Male' | 'Female' | 'Other';
  age: number;
  dateOfBirth?: string;
  weight?: number; // Body weight in kg
  chest?: number; // Optional chest in inches
  biceps?: number; // Optional biceps in inches
  waist?: number; // Optional waist in inches
  preferredPlan: MembershipPlanType;
  category?: MembershipCategory;
  customDays?: number;
  goal: string;
  medicalConditions?: string;
  status: 'Pending' | 'Converted' | 'Contacted' | 'Rejected';
  createdAt: string;
  referredBy?: string;
  referrerMemberId?: string;
  referrerName?: string;
}

export interface AttendanceRecord {
  id: string;
  memberId: string;
  memberName: string;
  date: string; // YYYY-MM-DD
  checkInTime: string;
  status: 'Present' | 'Absent';
}

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  restSeconds: number;
  notes?: string;
}

export interface WorkoutDay {
  dayName: string;
  focus: string;
  exercises: Exercise[];
}

export interface WorkoutPlan {
  id: string;
  title: string;
  targetGoal: 'Weight Loss' | 'Muscle Hypertrophy' | 'Strength & Conditioning' | 'Endurance' | 'Mobility & Rehab';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Elite Athlete';
  days: WorkoutDay[];
  dietaryRecommendations?: string;
  createdAt: string;
}

export interface FitnessMeasurement {
  id: string;
  memberId: string;
  date: string;
  weightKg: number;
  heightCm: number;
  bmi: number;
  bodyFatPercent: number;
  chestInches: number;
  waistInches: number;
  armsInches: number;
  thighsInches: number;
  notes?: string;
  recordedByTrainerName: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'admission' | 'payment' | 'expiry' | 'attendance' | 'workout' | 'general' | 'birthday';
  timestamp: string;
  read: boolean;
  targetRole?: UserRole | 'all';
  actionUrl?: string;
}

export interface WhatsAppLog {
  id: string;
  recipientName: string;
  recipientMobile: string;
  messageType: 'admission_link' | 'payment_reminder' | 'renewal_reminder' | 'welcome_kit' | 'workout_plan' | 'birthday_wish' | 'custom';
  messageBody: string;
  sentAt: string;
  status: 'Delivered' | 'Pending' | 'Failed';
}

export interface GymSettings {
  gymName: string;
  marathiName?: string;
  ownerName?: string;
  ownerPhone?: string;
  tagline: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  city?: string;
  state?: string;
  pincode?: string;
  plusCode?: string;
  googleMapsUrl?: string;
  rating?: number;
  reviewsCount?: number;
  currency: string;
  gstNumber: string;
  openHours: string;
  bankUpiId?: string;
}
