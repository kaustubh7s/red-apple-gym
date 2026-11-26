'use client';

import React from 'react';
import { useApp } from '@/lib/store';
import {
  TrendingUp,
  DollarSign,
  PieChart as PieChartIcon,
  BarChart2,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Layers
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

export const RevenueAnalytics: React.FC = () => {
  const { members, payments } = useApp();

  const now = new Date();
  const currentYearStr = `${now.getFullYear()}`;
  const prevYearStr = `${now.getFullYear() - 1}`;
  const currentYm = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevYm = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`;
  const currentMonthName = now.toLocaleString('en-US', { month: 'short' });
  const prevMonthName = prevMonthDate.toLocaleString('en-US', { month: 'short' });

  // Real Metrics calculated from live database
  const currentMonthRevenue = payments
    .filter((p) => p.paymentDate && p.paymentDate.startsWith(currentYm))
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const prevMonthRevenue = payments
    .filter((p) => p.paymentDate && p.paymentDate.startsWith(prevYm))
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const monthlyGrowth = prevMonthRevenue > 0
    ? Math.round(((currentMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100)
    : (currentMonthRevenue > 0 ? 100 : 0);

  const currentYearRevenue = payments
    .filter((p) => p.paymentDate && p.paymentDate.startsWith(currentYearStr))
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const prevYearRevenue = payments
    .filter((p) => p.paymentDate && p.paymentDate.startsWith(prevYearStr))
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const yearlyGrowth = prevYearRevenue > 0
    ? Math.round(((currentYearRevenue - prevYearRevenue) / prevYearRevenue) * 100)
    : (currentYearRevenue > 0 ? 100 : 0);

  const arpu = members.length > 0
    ? Math.round(members.reduce((sum, m) => sum + (m.totalFee || 0), 0) / members.length)
    : 0;

  const retentionRate = members.length > 0
    ? Math.round((members.filter((m) => m.status === 'Active' || m.remainingDays > 0).length / members.length) * 100)
    : 100;

  // Real Revenue & Inflow Trend Data (Rolling 8 months)
  const monthlyRevenueData = React.useMemo(() => {
    const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const result = [];
    for (let i = 7; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const lastYearYm = `${d.getFullYear() - 1}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = monthLabels[d.getMonth()];

      const curRev = payments
        .filter((p) => p.paymentDate && p.paymentDate.startsWith(ym))
        .reduce((s, p) => s + (p.amount || 0), 0);

      const lastRev = payments
        .filter((p) => p.paymentDate && p.paymentDate.startsWith(lastYearYm))
        .reduce((s, p) => s + (p.amount || 0), 0);

      result.push({
        month: monthLabel,
        currentYear: curRev,
        lastYear: lastRev
      });
    }
    return result;
  }, [payments]);

  // Real Member Growth Data (Rolling 8 months)
  const memberGrowthData = React.useMemo(() => {
    const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const result = [];
    for (let i = 7; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = monthLabels[d.getMonth()];

      const newJoined = members.filter((m) => m.joinDate && m.joinDate.startsWith(ym)).length;
      const monthP = payments.filter((p) => p.paymentDate && p.paymentDate.startsWith(ym));
      const renewals = Math.max(0, monthP.length - newJoined);

      result.push({
        month: monthLabel,
        active: members.length,
        newJoined,
        renewals
      });
    }
    return result;
  }, [members, payments]);

  // Real Plan Distribution from live members
  const planDistribution = React.useMemo(() => [
    { name: 'Annual (₹7,000)', value: members.filter(m => m.plan === 'Annual').length, color: '#00F59B' },
    { name: 'Half-Yearly (₹4,000)', value: members.filter(m => m.plan === 'Half-Yearly').length, color: '#38BDF8' },
    { name: 'Quarterly (₹2,100)', value: members.filter(m => m.plan === 'Quarterly').length, color: '#FBBF24' },
    { name: 'Monthly (₹800)', value: members.filter(m => m.plan === 'Monthly').length, color: '#F43F5E' },
    { name: 'Custom Plan', value: members.filter(m => m.plan === 'Custom').length, color: '#A855F7' }
  ], [members]);

  // Real Payment Mode Distribution from live payments
  const paymentModeData = React.useMemo(() => {
    const modes: Record<string, number> = {
      'UPI / QR': 0,
      'Cash Deposit': 0,
      'Credit Cards': 0,
      'Bank Transfer': 0
    };
    payments.forEach((p) => {
      const m = p.paymentMode || 'UPI';
      if (m === 'UPI') modes['UPI / QR'] += (p.amount || 0);
      else if (m === 'Cash') modes['Cash Deposit'] += (p.amount || 0);
      else if (m === 'Card') modes['Credit Cards'] += (p.amount || 0);
      else if (m === 'Bank Transfer') modes['Bank Transfer'] += (p.amount || 0);
      else modes['UPI / QR'] += (p.amount || 0);
    });
    return Object.entries(modes).map(([mode, amount]) => ({ mode, amount }));
  }, [payments]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-[#1A1A1A] font-['Space_Grotesk']">
          Executive Revenue & Growth Analytics
        </h2>
        <p className="text-xs text-[#71717A]">
          In-depth financial telemetry, year-over-year growth trajectories, membership distribution, and cash collection rate.
        </p>
      </div>

      {/* High-Level Comparison KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Monthly Revenue */}
        <div className="p-6 rounded-3xl bg-white border border-black/10 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#71717A]">
              Monthly Inflow ({currentMonthName} {now.getFullYear()})
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#00C853]/10 text-[#00C853] flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-[#1A1A1A] font-['Space_Grotesk']">
            ₹{currentMonthRevenue.toLocaleString('en-IN')}
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#00C853]">
            <ArrowUpRight className="w-4 h-4" />
            <span>+{monthlyGrowth}% vs Last Month (₹{prevMonthRevenue.toLocaleString('en-IN')})</span>
          </div>
        </div>

        {/* Yearly Revenue */}
        <div className="p-6 rounded-3xl bg-white border border-black/10 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#71717A]">
              Yearly Inflow ({currentYearStr} YTD)
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#C41E3A]/10 text-[#C41E3A] flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-[#1A1A1A] font-['Space_Grotesk']">
            ₹{currentYearRevenue.toLocaleString('en-IN')}
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#C41E3A]">
            <ArrowUpRight className="w-4 h-4" />
            <span>+{yearlyGrowth}% vs {prevYearStr} (₹{prevYearRevenue.toLocaleString('en-IN')})</span>
          </div>
        </div>

        {/* Average Ticket Size */}
        <div className="p-6 rounded-3xl bg-white border border-black/10 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#71717A]">
              Average Plan Value (ARPU)
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-[#1A1A1A] font-['Space_Grotesk']">
            ₹{arpu.toLocaleString('en-IN')}
          </div>
          <div className="text-xs font-semibold text-[#71717A]">
            Real average fee across registered athletes
          </div>
        </div>

        {/* Renewal Retention Rate */}
        <div className="p-6 rounded-3xl bg-white border border-black/10 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#71717A]">
              Member Retention Rate
            </span>
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-[#1A1A1A] font-['Space_Grotesk']">
            {retentionRate}%
          </div>
          <div className="text-xs font-semibold text-[#71717A]">
            Active athletes maintaining valid membership
          </div>
        </div>
      </div>

      {/* Chart Grid: Revenue Trend YoY & Member Growth */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Monthly YoY Revenue Chart */}
        <div className="lg:col-span-8 p-6 sm:p-8 rounded-3xl bg-white border border-black/10 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-black/10 pb-4">
            <div>
              <h3 className="text-base font-bold text-[#1A1A1A] font-['Space_Grotesk']">
                Monthly Revenue Trend YoY ({currentYearStr} vs {prevYearStr})
              </h3>
              <p className="text-xs text-[#71717A]">
                Gross collections tracking across all payment gateways and direct POS.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-[#C41E3A] font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-[#C41E3A]" /> {currentYearStr}
              </span>
              <span className="flex items-center gap-1 text-[#71717A] font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-neutral-400" /> {prevYearStr}
              </span>
            </div>
          </div>

          <div className="h-72 w-full min-w-0 overflow-hidden">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyRevenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="color2026" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C41E3A" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#C41E3A" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#9CA3AF" fontSize={11} tickLine={false} />
                <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: 'rgba(0,0,0,0.1)', borderRadius: '12px', fontSize: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
                  formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, '']}
                />
                <Area type="monotone" dataKey="currentYear" name="2026 Inflow" stroke="#C41E3A" strokeWidth={3} fill="url(#color2026)" />
                <Area type="monotone" dataKey="lastYear" name="2025 Inflow" stroke="#9CA3AF" strokeWidth={2} strokeDasharray="3 3" fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Plan Distribution Donut */}
        <div className="lg:col-span-4 p-6 sm:p-8 rounded-3xl bg-white border border-black/10 shadow-xs space-y-6">
          <div className="border-b border-black/10 pb-4">
            <h3 className="text-base font-bold text-[#1A1A1A] font-['Space_Grotesk']">
              Membership Distribution
            </h3>
            <p className="text-xs text-[#71717A]">
              Active athlete tier breakdown.
            </p>
          </div>

          <div className="h-56 w-full relative flex items-center justify-center min-w-0 overflow-hidden">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={planDistribution}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {planDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: 'rgba(0,0,0,0.1)', borderRadius: '12px', fontSize: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 text-xs">
            {planDistribution.map((p) => (
              <div key={p.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                  <span className="text-[#4A4A4A] font-medium">{p.name}</span>
                </div>
                <span className="font-bold text-[#1A1A1A] font-mono">{p.value} Athletes</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Member Growth & Renewals Stacked Chart */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-black/10 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-black/10 pb-4">
          <div>
            <h3 className="text-base font-bold text-[#1A1A1A] font-['Space_Grotesk']">
              Athlete Acquisition vs Membership Renewals
            </h3>
            <p className="text-xs text-[#71717A]">
              Monthly velocity of new admissions compared to recurring membership renewals.
            </p>
          </div>
        </div>

        <div className="h-64 w-full min-w-0 overflow-hidden">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={memberGrowthData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <XAxis dataKey="month" stroke="#9CA3AF" fontSize={11} tickLine={false} />
              <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#FFFFFF', borderColor: 'rgba(0,0,0,0.1)', borderRadius: '12px', fontSize: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="newJoined" name="New Admissions" fill="#C41E3A" radius={[6, 6, 0, 0]} />
              <Bar dataKey="renewals" name="Renewals Succeeded" fill="#00C853" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
