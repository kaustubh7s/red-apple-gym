import {
  Member,
  Trainer,
  PaymentRecord,
  AdmissionLead,
  WorkoutPlan,
  FitnessMeasurement,
  NotificationItem,
  GymSettings,
  WhatsAppLog,
  PlanConfig,
  MembershipPlanItem,
  MembershipCategory
} from './types';

export const INITIAL_MEMBERSHIP_PLANS: MembershipPlanItem[] = [
  {
    id: 'plan-1m',
    type: 'Monthly',
    name: '1 Month Pass',
    durationDays: 30,
    durationLabel: '30 Days',
    gymOnlyPrice: 800,
    gymCardioPrice: 1400,
    description: 'Full gym floor access & initial coach induction.',
    features: [
      'Full Gym Floor Access (30 Days)',
      'Free Weights & Machine Arena',
      'Locker & Shower Amenities',
      'Daily Master Coach Guidance'
    ]
  },
  {
    id: 'plan-3m',
    type: 'Quarterly',
    name: '3 Months Pass',
    durationDays: 90,
    durationLabel: '90 Days',
    gymOnlyPrice: 2100,
    gymCardioPrice: 3600,
    description: 'Custom workout split & periodic progress reviews.',
    features: [
      'Full Gym Floor Access (90 Days)',
      'Custom 3-Month Workout Split',
      'Bi-Weekly InBody Biometric Scans',
      'Personalized Diet & Macro Guidance'
    ]
  },
  {
    id: 'plan-6m',
    type: 'Half-Yearly',
    name: '6 Months Pass',
    durationDays: 180,
    durationLabel: '180 Days',
    gymOnlyPrice: 4000,
    gymCardioPrice: 6500,
    badge: 'MOST POPULAR',
    description: 'Complete athletic transformation protocol.',
    features: [
      'Full Gym Floor Access (180 Days)',
      'Advanced Periodized Training Protocols',
      'Monthly Body Composition Scans',
      '2 Complimentary Guest Passes'
    ]
  },
  {
    id: 'plan-1y',
    type: 'Annual',
    name: '1 Year Pass',
    durationDays: 365,
    durationLabel: '365 Days',
    gymOnlyPrice: 7000,
    gymCardioPrice: 11500,
    badge: 'BEST VALUE',
    description: 'Maximum consistency & 365 days unlimited floor access.',
    features: [
      '365 Days Unlimited Access',
      'Complete Workout & Hypertrophy Program',
      'Continuous Coach Progress Reviews',
      'Free Membership Freeze (Up to 30 Days)'
    ]
  }
];

export const PREDEFINED_PLANS: PlanConfig[] = [
  {
    type: 'Monthly',
    name: 'Monthly Pass',
    durationDays: 30,
    price: 800,
    features: [
      'Full Gym Floor Access (30 Days)',
      'Locker & Shower Amenities',
      'Induction Workout Routine',
      'Daily Master Coach Guidance'
    ]
  },
  {
    type: 'Quarterly',
    name: 'Quarterly Transformation',
    durationDays: 90,
    price: 2100,
    features: [
      'Full Gym Floor Access (90 Days)',
      'Custom 3-Month Workout Split',
      'Bi-Weekly InBody Biometric Scans',
      'Personalized Diet & Macro Guidance'
    ]
  },
  {
    type: 'Half-Yearly',
    name: 'Half-Yearly Catalyst',
    durationDays: 180,
    price: 4000,
    popular: true,
    features: [
      'Full Gym Floor Access (180 Days)',
      'Advanced Periodized Training Protocols',
      'Monthly Body Composition Scans',
      'Recovery & Sauna Suite Privileges',
      '2 Complimentary Guest Passes'
    ]
  },
  {
    type: 'Annual',
    name: 'Annual Champion',
    durationDays: 365,
    price: 7000,
    features: [
      '365 Days Unlimited Access',
      'Complete Workout & Hypertrophy Program',
      'Continuous Coach Progress Reviews',
      'Free Membership Freeze (Up to 30 Days)',
      'Official Club Gym Bag & Shaker'
    ]
  },
  {
    type: 'Custom',
    name: 'Custom Tailored Membership',
    durationDays: 60,
    price: 1500,
    features: [
      'Flexible Duration Specified by Admin',
      'Custom Negotiated Pricing',
      'Full Facility & Coach Privileges'
    ]
  }
];

export const gymAdmissionPolicies = [
  "Membership fees are to be paid in full and regularly.",
  "Membership is strictly non-transferable.",
  "Non-member persons are not allowed in the Gym.",
  "Member must take permission from parents for admission in the Gym (in case of minors).",
  "Members must sign-in and sign-out when utilizing the gym, using the sign-in Register provided.",
  "Gym timing to be strictly followed (Closed on Sunday and Holidays).",
  "Parking of vehicles is strictly at owner's risk.",
  "Use of mobile phones in the Gym is not allowed.",
  "Member must use clean gym shoes and proper workout clothing in the Gym.",
  "Members must take care of gym equipment; equipment must only be used for its intended purpose.",
  "Do not drop weights; place them down carefully and weights must be returned to place of origin after use.",
  "Members are required to bring their own clean towels.",
  "Red Apple Gym and Fitness Center shall not be responsible for any mishap, loss of property, or any injury incurred within the Gym.",
  "Members' entry is strictly restricted under the influence of alcohol or other intoxicants in the Gym.",
  "Smoking and consuming alcohol is strictly prohibited in Gym premises.",
  "Dishonorable or disputable conduct or inconvenience caused to others shall lead to disciplinary action including immediate cancellation of membership.",
  "In case a member terminates his/her membership before the duration of membership, he/she will forfeit the rest of the fee.",
  "Red Apple Gym and Fitness Center shall have absolute discretion as to whether a person shall become or remain a member of the Gym, and shall have the right to expel or terminate the membership of any member for any good or sufficient reason(s) or if his/her continuance as a member is not in the interest of Red Apple Gym and Fitness Center without affording any explanation.",
  "The Red Apple Gym and Fitness Center reserves the right to close down the Gym for maintenance, upkeep, repairs, etc., as and when required without prior notice.",
  "Red Apple Gym and Fitness Center reserves the right to revise or modify the membership fees structure as and when required from time to time."
];

export const initialGymSettings: GymSettings = {
  gymName: 'Red Apple Gym and Fitness Center',
  marathiName: 'रेड ॲपल जिम अँड फिटनेस सेंटर',
  ownerName: 'Prashant Magre',
  ownerPhone: '+91 85519 19595',
  tagline: 'Great Atmosphere • Professional Coaching • Transform Your Physique',
  phone: '+91 85519 19595',
  whatsapp: '+918551919595',
  email: 'redapplegym.cidco@gmail.com',
  address: 'Jalna Road, Ram Nagar, N 2, Cidco, Chhatrapati Sambhajinagar, Maharashtra 431006',
  city: 'Chhatrapati Sambhajinagar',
  state: 'Maharashtra',
  pincode: '431006',
  plusCode: 'V9CP+FV Chhatrapati Sambhajinagar, Maharashtra',
  googleMapsUrl: 'https://maps.app.goo.gl/UYPmZrpZEJWEn84F9',
  rating: 4.7,
  reviewsCount: 34,
  currency: '₹',
  gstNumber: '27AABCR4921M1Z5',
  openHours: 'Mon - Sat: 5:00 AM – 10:30 PM | Sun: Closed',
  bankUpiId: 'redapplegym@oksbi'
};

// Sole Trainer of the Gym
export const initialSoleTrainer: Trainer = {
  id: 'tr-1',
  trainerId: 'TR-101',
  fullName: 'Mohaseen Subedar',
  photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
  mobile: '+91 85519 19595',
  whatsapp: '+918551919595',
  email: 'mohaseen.trainer@redapplegym.com',
  specialization: ['Personal Training & Transformation', 'Hypertrophy & Strength', 'Fat Loss & Conditioning', 'Form Correction & Biomechanics'],
  experienceYears: 8,
  certifications: ['Certified Personal Trainer (CPT)', 'Advanced Fitness & Physique Coach', 'Sports Nutrition & Diet Coach'],
  bio: 'Head Master Coach & Personal Trainer at Red Apple Gym, Cidco N-2, Chhatrapati Sambhajinagar. Dedicated to providing supportive, high-energy personal coaching and customized body transformations.',
  rating: 4.95
};

export const getRelativeDOB = (offsetDays: number, birthYear: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${birthYear}-${mm}-${dd}`;
};

// Production member records: Clean slate for real gym members
export const initialMembers: Member[] = [];

export const initialPayments: PaymentRecord[] = [];

export const initialLeads: AdmissionLead[] = [];

export const initialWorkoutPlans: WorkoutPlan[] = [
  {
    id: 'wk-1',
    title: 'Titan Hypertrophy & Density Protocol (4-Day Split)',
    targetGoal: 'Muscle Hypertrophy',
    difficulty: 'Advanced',
    createdAt: '2026-05-10',
    dietaryRecommendations: '3,000 kcal | 180g Protein, 350g Carbs, 65g Fats. 4L Water daily.',
    days: [
      {
        dayName: 'Day 1: Heavy Chest & Triceps',
        focus: 'Upper Body Pushing & Triceps Peak Contraction',
        exercises: [
          { id: 'ex-1', name: 'Incline Barbell Bench Press (30°)', sets: 4, reps: '8-10 reps', restSeconds: 90, notes: 'Full clavicular stretch' },
          { id: 'ex-2', name: 'Flat Dumbbell Press', sets: 4, reps: '10-12 reps', restSeconds: 75 },
          { id: 'ex-3', name: 'Weighted Chest Dips', sets: 3, reps: '10-12 reps', restSeconds: 60 }
        ]
      },
      {
        dayName: 'Day 2: Back & Biceps Density',
        focus: 'Latissimus Dorsi & Rhomboids Power',
        exercises: [
          { id: 'ex-4', name: 'Conventional Barbell Deadlifts', sets: 4, reps: '5 reps', restSeconds: 150 },
          { id: 'ex-5', name: 'Chest-Supported Rows', sets: 4, reps: '8-10 reps', restSeconds: 75 }
        ]
      }
    ]
  },
  {
    id: 'wk-2',
    title: 'Metabolic Conditioning & Core Shred',
    targetGoal: 'Endurance',
    difficulty: 'Intermediate',
    createdAt: '2026-06-15',
    dietaryRecommendations: 'High hydration + electrolyte balance around workout window.',
    days: [
      {
        dayName: 'Day 1: HIIT & Plyometrics',
        focus: 'Heart Rate Spike & Core Stability',
        exercises: [
          { id: 'ex-6', name: 'Assault AirBike Sprints', sets: 5, reps: '30s on / 30s off', restSeconds: 60 },
          { id: 'ex-7', name: 'Kettlebell Swings (24kg)', sets: 4, reps: '20 reps', restSeconds: 45 }
        ]
      }
    ]
  }
];

export const initialFitnessMeasurements: FitnessMeasurement[] = [];

export const initialNotifications: NotificationItem[] = [];

export const initialWhatsAppLogs: WhatsAppLog[] = [];
