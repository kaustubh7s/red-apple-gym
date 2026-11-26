-- ==============================================================================
-- REDAPPLE LUXURY GYM - SUPABASE DATABASE SCHEMA
-- Run this in your Supabase Project -> SQL Editor -> Click 'Run'
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Members Table
CREATE TABLE IF NOT EXISTS members (
  id TEXT PRIMARY KEY,
  member_id TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  photo TEXT NOT NULL,
  mobile TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  email TEXT NOT NULL,
  gender TEXT NOT NULL,
  age INTEGER NOT NULL,
  plan TEXT NOT NULL,
  custom_duration_days INTEGER,
  join_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  status TEXT NOT NULL,
  remaining_days INTEGER NOT NULL,
  remaining_days_text TEXT NOT NULL,
  attendance_percentage INTEGER DEFAULT 0,
  total_fee NUMERIC DEFAULT 0,
  amount_paid NUMERIC DEFAULT 0,
  due_amount NUMERIC DEFAULT 0,
  due_date DATE,
  payment_status TEXT DEFAULT 'Paid',
  emergency_contact TEXT,
  blood_group TEXT,
  notes TEXT,
  assigned_workout_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Admission Leads Table
CREATE TABLE IF NOT EXISTS admission_leads (
  id TEXT PRIMARY KEY,
  lead_id TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  photo TEXT NOT NULL,
  mobile TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  email TEXT NOT NULL,
  gender TEXT NOT NULL,
  age INTEGER NOT NULL,
  preferred_plan TEXT NOT NULL,
  custom_days INTEGER,
  goal TEXT NOT NULL,
  medical_conditions TEXT,
  status TEXT DEFAULT 'Pending' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Payments Table
CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  receipt_number TEXT UNIQUE NOT NULL,
  member_id TEXT NOT NULL,
  member_name TEXT NOT NULL,
  plan TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  payment_date DATE NOT NULL,
  payment_mode TEXT NOT NULL,
  status TEXT DEFAULT 'Paid' NOT NULL,
  tax_amount NUMERIC DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Attendance Records Table
CREATE TABLE IF NOT EXISTS attendance_records (
  id TEXT PRIMARY KEY,
  member_id TEXT NOT NULL,
  member_name TEXT NOT NULL,
  date DATE NOT NULL,
  check_in_time TEXT NOT NULL,
  status TEXT DEFAULT 'Present' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. System Configuration & Authentication Sync Table
CREATE TABLE IF NOT EXISTS gym_config (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Enable Row Level Security (RLS) and allow public read/write for demo
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE admission_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE gym_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read-write for members" ON members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for admission_leads" ON admission_leads FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for payments" ON payments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for attendance_records" ON attendance_records FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for gym_config" ON gym_config FOR ALL USING (true) WITH CHECK (true);
