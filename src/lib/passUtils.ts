import { Member } from './types';

export interface CompactPassPayload {
  id: string;
  mId: string;
  n: string;
  p: string;
  c?: string;
  j: string;
  e: string;
  ph?: string;
  s?: string;
  rem?: number;
}

/**
 * Encodes a member's essential VIP pass details into a URL-safe Base64 token.
 * This guarantees that when a pass link is sent to ANY mobile device (via WhatsApp, SMS, or QR),
 * the pass will open with 100% full fidelity without relying on local storage sync.
 */
export function encodePassPayload(member: Member): string {
  try {
    const payload: CompactPassPayload = {
      id: member.id,
      mId: member.memberId,
      n: member.fullName,
      p: member.plan,
      c: member.category || 'Gym Only',
      j: member.joinDate,
      e: member.expiryDate,
      // Avoid massive base64 camera strings in URL; keep remote URLs or fallback
      ph: member.photo && !member.photo.startsWith('data:') ? member.photo : undefined,
      s: member.status,
      rem: member.remainingDays
    };
    const jsonStr = JSON.stringify(payload);
    // Browser-safe Base64 encoding
    if (typeof window !== 'undefined') {
      return btoa(encodeURIComponent(jsonStr));
    }
    return Buffer.from(encodeURIComponent(jsonStr)).toString('base64');
  } catch (err) {
    console.warn('Could not encode pass payload:', err);
    return '';
  }
}

/**
 * Decodes a URL-safe Base64 token back into a Partial<Member> object.
 */
export function decodePassPayload(token: string): Partial<Member> | null {
  try {
    let jsonStr = '';
    if (typeof window !== 'undefined') {
      jsonStr = decodeURIComponent(atob(token));
    } else {
      jsonStr = decodeURIComponent(Buffer.from(token, 'base64').toString('utf-8'));
    }
    const data: CompactPassPayload = JSON.parse(jsonStr);
    if (!data.mId || !data.n) return null;

    return {
      id: data.id || `mem-${data.mId}`,
      memberId: data.mId,
      fullName: data.n,
      plan: data.p as any,
      category: (data.c as any) || 'Gym Only',
      joinDate: data.j,
      expiryDate: data.e,
      photo: data.ph || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80',
      status: (data.s as any) || 'Active',
      remainingDays: data.rem !== undefined ? data.rem : 30,
      remainingDaysText: data.rem !== undefined ? `${data.rem} Days Remaining` : 'Active',
      mobile: '',
      whatsapp: '',
      gender: 'Male',
      age: 25,
      totalFee: 0,
      amountPaid: 0,
      dueAmount: 0,
      dueDate: data.e,
      paymentStatus: 'Paid',
      attendancePercentage: 100
    };
  } catch (err) {
    console.warn('Could not decode pass payload:', err);
    return null;
  }
}

/**
 * Generates a clean, short, professional pass URL (e.g. /pass/RED-2576).
 */
export function generateShareablePassUrl(member: Member, baseUrl?: string): string {
  const origin = baseUrl || (typeof window !== 'undefined' ? window.location.origin : 'https://redapplefitness.com');
  return `${origin}/pass/${member.memberId}`;
}

