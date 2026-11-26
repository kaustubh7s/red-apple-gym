import { MembershipPlanType, MembershipStatus } from './types';

export interface ExpiryCalculationResult {
  remainingDays: number;
  remainingDaysText: string;
  status: MembershipStatus;
  statusColor: 'green' | 'yellow' | 'red';
  badgeBgClass: string;
  badgeTextClass: string;
  badgeBorderClass: string;
}

/**
 * Standardized date-only parser that avoids UTC/local timezone shifts.
 * Expects 'YYYY-MM-DD' format.
 */
export function parseDateOnly(dateStr: string): Date {
  if (!dateStr) return new Date();
  const parts = dateStr.split('T')[0].split('-').map(Number);
  if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
    return new Date(parts[0], parts[1] - 1, parts[2], 0, 0, 0, 0);
  }
  const fallback = new Date(dateStr);
  return new Date(fallback.getFullYear(), fallback.getMonth(), fallback.getDate(), 0, 0, 0, 0);
}

/**
 * Formats a Date object or 'YYYY-MM-DD' into 'YYYY-MM-DD'.
 */
export function toDateString(d: Date | string): string {
  if (typeof d === 'string') {
    return d.split('T')[0];
  }
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Friendly display format (e.g., '15 Sep 2026')
 */
export function formatFriendlyDate(dateStr: string): string {
  if (!dateStr) return '';
  const d = parseDateOnly(dateStr);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

/**
 * Standardized single source of truth for remaining days & membership status calculation.
 * Date-only comparison guarantees 100% agreement across Overview, Renewals, Members, and Attendance.
 */
export function calculateMembershipCountdown(expiryDateStr: string): ExpiryCalculationResult {
  if (!expiryDateStr) {
    return {
      remainingDays: 0,
      remainingDaysText: 'No Expiry Set',
      status: 'Expired',
      statusColor: 'red',
      badgeBgClass: 'bg-rose-50',
      badgeTextClass: 'text-[#C41E3A]',
      badgeBorderClass: 'border-rose-200'
    };
  }

  const expiryDate = parseDateOnly(expiryDateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

  const diffTime = expiryDate.getTime() - today.getTime();
  const remainingDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  let status: MembershipStatus = 'Active';
  let statusColor: 'green' | 'yellow' | 'red' = 'green';
  let remainingDaysText = '';
  let badgeBgClass = 'bg-emerald-50';
  let badgeTextClass = 'text-emerald-700';
  let badgeBorderClass = 'border-emerald-200';

  if (remainingDays < 0) {
    status = 'Expired';
    statusColor = 'red';
    const abs = Math.abs(remainingDays);
    remainingDaysText = `Expired ${abs} ${abs === 1 ? 'day' : 'days'} ago`;
    badgeBgClass = 'bg-rose-50';
    badgeTextClass = 'text-[#C41E3A]';
    badgeBorderClass = 'border-rose-200';
  } else if (remainingDays === 0) {
    status = 'Expired';
    statusColor = 'red';
    remainingDaysText = 'Expires today';
    badgeBgClass = 'bg-rose-50';
    badgeTextClass = 'text-[#C41E3A]';
    badgeBorderClass = 'border-rose-200';
  } else if (remainingDays === 1) {
    status = 'Expiring Soon';
    statusColor = 'yellow';
    remainingDaysText = 'Expires tomorrow';
    badgeBgClass = 'bg-amber-50';
    badgeTextClass = 'text-amber-800';
    badgeBorderClass = 'border-amber-200';
  } else if (remainingDays <= 7) {
    status = 'Expiring Soon';
    statusColor = 'yellow';
    remainingDaysText = `${remainingDays} days left`;
    badgeBgClass = 'bg-amber-50';
    badgeTextClass = 'text-amber-800';
    badgeBorderClass = 'border-amber-200';
  } else {
    status = 'Active';
    statusColor = 'green';
    remainingDaysText = `${remainingDays} days left`;
    badgeBgClass = 'bg-emerald-50';
    badgeTextClass = 'text-emerald-700';
    badgeBorderClass = 'border-emerald-200';
  }

  return {
    remainingDays,
    remainingDaysText,
    status,
    statusColor,
    badgeBgClass,
    badgeTextClass,
    badgeBorderClass
  };
}

/**
 * Calculate renewal new expiry date. If currently active, extends from current expiry;
 * if already expired, starts from today.
 */
export function calculateRenewalExpiryDate(
  currentExpiryDateStr: string,
  additionalDays: number
): { newExpiryDate: string; startsFrom: string } {
  const currentExpiry = parseDateOnly(currentExpiryDateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

  // If current expiry is in the future, extend from current expiry. If expired, extend from today.
  const baseDate = currentExpiry.getTime() >= today.getTime() ? new Date(currentExpiry) : new Date(today);
  const newDate = new Date(baseDate);
  newDate.setDate(baseDate.getDate() + additionalDays);

  return {
    newExpiryDate: toDateString(newDate),
    startsFrom: toDateString(baseDate)
  };
}

/**
 * Attendance calculation for a month.
 * Starts evaluation strictly from the member's admission date (joinDate),
 * and avoids counting pre-admission dates or future dates as absences.
 */
export function calculateMonthAttendanceStats(
  memberId: string,
  records: Array<{ memberId: string; date: string }>,
  year: number,
  month: number, // 1-indexed (1 = Jan, 12 = Dec)
  joinDateStr?: string
) {
  const now = new Date();
  const isCurrentMonth = now.getFullYear() === year && now.getMonth() + 1 === month;
  const daysInMonth = new Date(year, month, 0).getDate();
  const maxEvalDay = isCurrentMonth ? Math.min(now.getDate(), daysInMonth) : daysInMonth;

  let minEvalDay = 1;
  let isBeforeJoinMonth = false;

  if (joinDateStr) {
    const parts = joinDateStr.split('-').map(Number);
    if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
      const [jYear, jMonth, jDay] = parts;
      if (year < jYear || (year === jYear && month < jMonth)) {
        isBeforeJoinMonth = true;
      } else if (year === jYear && month === jMonth) {
        minEvalDay = Math.max(1, Math.min(jDay, daysInMonth));
      }
    }
  }

  const presentDays = new Set<number>();
  records.forEach((r) => {
    if (r.memberId === memberId && r.date.startsWith(`${year}-${String(month).padStart(2, '0')}`)) {
      const day = parseInt(r.date.split('-')[2], 10);
      if (!isNaN(day)) {
        presentDays.add(day);
      }
    }
  });

  let presentCount = 0;
  let eligibleDays = 0;

  if (!isBeforeJoinMonth && minEvalDay <= maxEvalDay) {
    for (let d = minEvalDay; d <= maxEvalDay; d++) {
      eligibleDays++;
      if (presentDays.has(d)) {
        presentCount++;
      }
    }
  }

  // Include any extra punches that might have been recorded before formal join date
  presentDays.forEach((d) => {
    if (d < minEvalDay && d <= maxEvalDay) {
      presentCount++;
      eligibleDays++;
    }
  });

  const percentage = eligibleDays > 0 ? Math.round((presentCount / eligibleDays) * 100) : (presentCount > 0 ? 100 : 100);
  const absentCount = Math.max(0, eligibleDays - presentCount);

  return {
    daysInMonth,
    minEvalDay,
    maxEvalDay,
    isBeforeJoinMonth,
    eligibleDays,
    presentCount,
    absentCount,
    percentage,
    presentDays
  };
}

/**
 * Calculates how many days have elapsed since the member's last attendance check-in.
 * If the member has never checked in, calculates days since their join date.
 */
export function calculateDaysAbsent(
  memberJoinDate: string,
  attendanceRecords: { date: string; memberId: string }[],
  memberId: string,
  secondaryMemberId?: string
): { lastCheckInDate: string | null; daysAbsent: number } {
  const memberPunches = attendanceRecords.filter(
    (r) => r.memberId === memberId || (secondaryMemberId && r.memberId === secondaryMemberId)
  );

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

  if (memberPunches.length > 0) {
    const dates = memberPunches.map((p) => p.date).sort().reverse();
    const latestDateStr = dates[0];
    const latestDate = parseDateOnly(latestDateStr);
    const diffDays = Math.max(0, Math.floor((today.getTime() - latestDate.getTime()) / (1000 * 60 * 60 * 24)));
    return { lastCheckInDate: latestDateStr, daysAbsent: diffDays };
  }

  if (memberJoinDate) {
    const joinDate = parseDateOnly(memberJoinDate);
    const diffDays = Math.max(0, Math.floor((today.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24)));
    return { lastCheckInDate: null, daysAbsent: diffDays };
  }

  return { lastCheckInDate: null, daysAbsent: 0 };
}

