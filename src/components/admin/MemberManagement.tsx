'use client';

import React, { useState, useMemo } from 'react';
import { useApp, PLAN_PRICE_MAP } from '@/lib/store';
import { Member, MembershipPlanType, MembershipStatus, PaymentStatus } from '@/lib/types';
import { MemberIdCardModal } from './MemberIdCardModal';
import { InvoiceModal } from './InvoiceModal';
import { QuickRenewModal } from './QuickRenewModal';
import { MemberProfileModal } from './MemberProfileModal';
import { PhotoCapture } from '@/components/common/PhotoCapture';
import {
  Search,
  UserPlus,
  RefreshCw,
  Eye,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  Printer,
  FileText,
  Clock,
  Calendar,
  X,
  CheckCircle2,
  Phone,
  Filter,
  Check,
  Gift
} from 'lucide-react';

interface MemberManagementProps {
  initialAddOpen?: boolean;
}

export const MemberManagement: React.FC<MemberManagementProps> = ({ initialAddOpen = false }) => {
  const {
    members,
    addMember,
    updateMember,
    deleteMember,
    calculateExpiryInfo
  } = useApp();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Active' | 'Expiring Soon' | 'Expired'>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [expiryFilter, setExpiryFilter] = useState<'all' | 'expired' | 'today' | '3days' | '7days' | '30days'>('all');

  // Active More Dropdown
  const [activeMoreMenuId, setActiveMoreMenuId] = useState<string | null>(null);

  // Modals state
  const [profileModalMember, setProfileModalMember] = useState<Member | null>(null);
  const [idCardMember, setIdCardMember] = useState<Member | null>(null);
  const [invoiceMember, setInvoiceMember] = useState<Member | null>(null);
  const [renewModalMember, setRenewModalMember] = useState<Member | null>(null);
  const [deleteConfirmMember, setDeleteConfirmMember] = useState<Member | null>(null);

  // Add / Edit Member Modal
  const [formOpen, setFormOpen] = useState(initialAddOpen);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [photo, setPhoto] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80');
  const [mobile, setMobile] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [dateOfBirth, setDateOfBirth] = useState<string>('');
  const [age, setAge] = useState<number>(26);
  const [plan, setPlan] = useState<MembershipPlanType>('Monthly');
  const [customDays, setCustomDays] = useState<number>(30);
  const [customPrice, setCustomPrice] = useState<number>(800);
  const [joinDate, setJoinDate] = useState(new Date().toISOString().split('T')[0]);
  const [amountPaid, setAmountPaid] = useState<number>(800);
  const [dueAmount, setDueAmount] = useState<number>(0);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('Paid');
  const [notes, setNotes] = useState('');

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Live calculation for form
  const formExpiryInfo = calculateExpiryInfo(joinDate, plan, customDays);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Summary counts
  const summary = useMemo(() => {
    let total = members.length;
    let active = 0;
    let expiringSoon = 0;
    let expired = 0;

    members.forEach((m) => {
      if (m.remainingDays < 0 || (m.remainingDays === 0 && m.status === 'Expired')) {
        expired++;
      } else if (m.remainingDays <= 3) {
        expiringSoon++;
      } else {
        active++;
      }
    });

    return { total, active, expiringSoon, expired };
  }, [members]);

  // Filter members
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const digits = searchQuery.replace(/\D/g, '');
        const matchName = m.fullName.toLowerCase().includes(q);
        const matchId = m.memberId.toLowerCase().includes(q);
        const matchMobile = digits && m.mobile.replace(/\D/g, '').includes(digits);
        if (!matchName && !matchId && !matchMobile) return false;
      }

      // Status filter
      if (statusFilter !== 'all') {
        if (statusFilter === 'Active' && (m.remainingDays <= 3 || m.status === 'Expired')) return false;
        if (statusFilter === 'Expiring Soon' && (m.remainingDays > 3 || m.remainingDays < 0)) return false;
        if (statusFilter === 'Expired' && !(m.remainingDays < 0 || (m.remainingDays === 0 && m.status === 'Expired'))) return false;
      }

      // Plan filter
      if (planFilter !== 'all' && m.plan !== planFilter) {
        return false;
      }

      // Expiry filter
      if (expiryFilter === 'expired') {
        return m.remainingDays < 0 || (m.remainingDays === 0 && m.status === 'Expired');
      }
      if (expiryFilter === 'today') {
        return m.remainingDays === 0;
      }
      if (expiryFilter === '3days') {
        return m.remainingDays >= 1 && m.remainingDays <= 3;
      }
      if (expiryFilter === '7days') {
        return m.remainingDays >= 1 && m.remainingDays <= 7;
      }
      if (expiryFilter === '30days') {
        return m.remainingDays >= 1 && m.remainingDays <= 30;
      }

      return true;
    });
  }, [members, searchQuery, statusFilter, planFilter, expiryFilter]);

  const handleOpenAdd = () => {
    setEditingMemberId(null);
    setFullName('');
    setPhoto('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80');
    setMobile('');
    setWhatsapp('');
    setEmail('');
    setGender('Male');
    setDateOfBirth('');
    setAge(26);
    setPlan('Monthly');
    setCustomDays(30);
    setCustomPrice(800);
    setJoinDate(new Date().toISOString().split('T')[0]);
    setAmountPaid(800);
    setDueAmount(0);
    setPaymentStatus('Paid');
    setNotes('');
    setFormOpen(true);
  };

  const handleEdit = (m: Member) => {
    setEditingMemberId(m.id);
    setFullName(m.fullName);
    setPhoto(m.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80');
    setMobile(m.mobile);
    setWhatsapp(m.whatsapp);
    setEmail(m.email);
    setGender(m.gender);
    setDateOfBirth(m.dateOfBirth || '');
    setAge(m.age);
    setPlan(m.plan);
    setCustomDays(m.customDurationDays || 30);
    setCustomPrice(m.totalFee);
    setJoinDate(m.joinDate);
    setAmountPaid(m.amountPaid);
    setDueAmount(m.dueAmount);
    setPaymentStatus(m.paymentStatus);
    setNotes(m.notes || '');
    setFormOpen(true);
    setActiveMoreMenuId(null);
  };

  const handleCopyAdmissionLink = (m: Member) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://redapplefitness.com';
    const link = `${baseUrl}/admission?ref=${encodeURIComponent(m.memberId)}`;
    navigator.clipboard.writeText(link);
    showToast(`Copied admission link for ${m.fullName}`);
    setActiveMoreMenuId(null);
  };

  const handleSaveMember = (e: React.FormEvent) => {
    e.preventDefault();
    const fee = plan === 'Custom' ? Number(customPrice) : PLAN_PRICE_MAP[plan];

    if (editingMemberId) {
      updateMember(editingMemberId, {
        fullName,
        photo,
        mobile: mobile.trim(),
        whatsapp: (whatsapp.trim() || mobile.trim()),
        email,
        gender,
        dateOfBirth: dateOfBirth || undefined,
        age: Number(age),
        plan,
        customDurationDays: plan === 'Custom' ? Number(customDays) : undefined,
        joinDate,
        expiryDate: formExpiryInfo.expiryDate,
        totalFee: fee,
        amountPaid: Number(amountPaid),
        dueAmount: Number(dueAmount),
        dueDate: formExpiryInfo.expiryDate,
        paymentStatus,
        notes
      });
      showToast('Member profile updated successfully');
    } else {
      addMember({
        fullName,
        photo,
        mobile: mobile.trim(),
        whatsapp: (whatsapp.trim() || mobile.trim()),
        email: email || `${fullName.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
        gender,
        dateOfBirth: dateOfBirth || undefined,
        age: Number(age),
        plan,
        customDurationDays: plan === 'Custom' ? Number(customDays) : undefined,
        joinDate,
        expiryDate: formExpiryInfo.expiryDate,
        totalFee: fee,
        amountPaid: Number(amountPaid),
        dueAmount: Number(dueAmount),
        dueDate: formExpiryInfo.expiryDate,
        paymentStatus,
        notes
      });
      showToast('New member registered successfully');
    }

    setFormOpen(false);
  };

  const handleDeleteMember = () => {
    if (!deleteConfirmMember) return;
    deleteMember(deleteConfirmMember.id);
    showToast(`Removed ${deleteConfirmMember.fullName}`);
    setDeleteConfirmMember(null);
    setActiveMoreMenuId(null);
  };

  // Status Badge
  const renderStatusBadge = (m: Member) => {
    if (m.remainingDays < 0 || (m.remainingDays === 0 && m.status === 'Expired')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#C41E3A]/10 text-[#C41E3A] border border-[#C41E3A]/20">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C41E3A]" />
          Expired
        </span>
      );
    }
    if (m.remainingDays <= 3) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          Expiring Soon
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        Active
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm font-medium flex items-center justify-between shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#1A1A1A] font-['Playfair_Display']">
            Members
          </h2>
          <p className="text-xs text-[#71717A] mt-0.5">
            Manage memberships, expiry dates and renewals.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#C41E3A] text-white text-xs font-semibold shadow-xs hover:bg-[#A3182E] transition-colors self-start sm:self-auto"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>+ Add Member</span>
        </button>
      </div>

      {/* Summary Strip (4 Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            id: 'all' as const,
            label: 'All Members',
            count: summary.total,
            color: 'text-[#1A1A1A]'
          },
          {
            id: 'Active' as const,
            label: 'Active',
            count: summary.active,
            color: 'text-emerald-700'
          },
          {
            id: 'Expiring Soon' as const,
            label: 'Expiring Soon',
            count: summary.expiringSoon,
            color: 'text-amber-700'
          },
          {
            id: 'Expired' as const,
            label: 'Expired',
            count: summary.expired,
            color: 'text-[#C41E3A]'
          }
        ].map((item) => {
          const isActive = statusFilter === item.id || (item.id === 'all' && statusFilter === 'all');
          return (
            <button
              key={item.id}
              onClick={() => {
                setStatusFilter(item.id);
                setExpiryFilter('all');
              }}
              className={`p-4 rounded-xl border text-left transition-all bg-white shadow-2xs ${
                isActive ? 'border-black/30 bg-[#F8F6F4]' : 'border-black/10 hover:border-black/20'
              }`}
            >
              <div className="text-xs font-medium text-[#71717A]">{item.label}</div>
              <div className={`text-2xl font-bold font-['Playfair_Display'] mt-1 ${item.color}`}>
                {item.count}
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Card with Filters and Directory Table */}
      <div className="bg-white rounded-xl border border-black/10 shadow-2xs overflow-hidden">
        {/* Filters Bar */}
        <div className="p-4 border-b border-black/10 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative w-full md:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#71717A]" />
            <input
              type="text"
              placeholder="Search by name, ID or mobile..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs border border-black/10 bg-[#F8F6F4] text-[#1A1A1A] placeholder:text-[#A1A1AA] focus:outline-none focus:ring-1 focus:ring-[#C41E3A] focus:bg-white"
            />
          </div>

          {/* Select dropdown filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-lg text-xs border border-black/10 bg-[#F8F6F4] text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#C41E3A]"
            >
              <option value="all">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Expiring Soon">Expiring Soon (≤3d)</option>
              <option value="Expired">Expired</option>
            </select>

            {/* Plan */}
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg text-xs border border-black/10 bg-[#F8F6F4] text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#C41E3A]"
            >
              <option value="all">All Plans</option>
              <option value="Monthly">Monthly</option>
              <option value="Quarterly">Quarterly</option>
              <option value="Half-Yearly">Half-Yearly</option>
              <option value="Annual">Annual</option>
              <option value="Custom">Custom</option>
            </select>

            {/* Expiry Window */}
            <select
              value={expiryFilter}
              onChange={(e) => setExpiryFilter(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-lg text-xs border border-black/10 bg-[#F8F6F4] text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#C41E3A]"
            >
              <option value="all">All Expiries</option>
              <option value="today">Expires Today</option>
              <option value="3days">Expires in ≤3 Days</option>
              <option value="7days">Expires in ≤7 Days</option>
              <option value="30days">Expires in ≤30 Days</option>
              <option value="expired">Already Expired</option>
            </select>

            {(searchQuery || statusFilter !== 'all' || planFilter !== 'all' || expiryFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setPlanFilter('all');
                  setExpiryFilter('all');
                }}
                className="px-2.5 py-1.5 text-xs text-[#71717A] hover:text-[#C41E3A] underline"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Directory Content */}
        {filteredMembers.length === 0 ? (
          <div className="py-16 text-center text-[#71717A] text-xs space-y-1">
            <p className="font-semibold text-sm text-[#1A1A1A]">No members found</p>
            <p>Try modifying your search or filter options.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8F6F4] text-[#71717A] font-semibold border-b border-black/10 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Member</th>
                    <th className="py-3 px-4">Member ID</th>
                    <th className="py-3 px-4">Mobile</th>
                    <th className="py-3 px-4">Plan</th>
                    <th className="py-3 px-4">Join Date</th>
                    <th className="py-3 px-4">Expiry Date</th>
                    <th className="py-3 px-4">Days Remaining</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 text-[#1A1A1A]">
                  {filteredMembers.map((m) => {
                    const isExpired = m.remainingDays < 0 || (m.remainingDays === 0 && m.status === 'Expired');
                    const isSoon = m.remainingDays >= 0 && m.remainingDays <= 3;

                    return (
                      <tr key={m.id} className="hover:bg-black/[0.02] transition-colors">
                        {/* Member */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            {m.photo ? (
                              <img
                                src={m.photo}
                                alt={m.fullName}
                                className="w-7 h-7 rounded-full object-cover border border-black/10 shrink-0"
                              />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-black/5 border border-black/10 flex items-center justify-center font-bold text-[11px] text-[#1A1A1A] shrink-0">
                                {m.fullName.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-semibold text-[#1A1A1A]">{m.fullName}</span>
                              {m.dateOfBirth && m.dateOfBirth.slice(5) === `${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}` && (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse" title="Birthday Today! 🎂">
                                  🎂 Today
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Member ID */}
                        <td className="py-3 px-4">
                          <span className="font-mono text-[11px] text-[#71717A] bg-black/5 px-2 py-0.5 rounded">
                            {m.memberId}
                          </span>
                        </td>

                        {/* Mobile */}
                        <td className="py-3 px-4 font-mono text-[#71717A]">{m.mobile}</td>

                        {/* Plan */}
                        <td className="py-3 px-4 font-medium">
                          <div>{m.plan}</div>
                          <span
                            className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded mt-0.5 ${
                              m.category === 'Gym + Cardio'
                                ? 'bg-red-50 text-[#C41E3A] border border-red-200'
                                : 'bg-neutral-100 text-neutral-600'
                            }`}
                          >
                            {m.category || 'Gym Only'}
                          </span>
                        </td>

                        {/* Join Date */}
                        <td className="py-3 px-4 text-[#71717A]">{m.joinDate}</td>

                        {/* Expiry Date (Highly visible) */}
                        <td className="py-3 px-4 font-semibold text-[#1A1A1A]">{m.expiryDate}</td>

                        {/* Days Remaining (Highly visible countdown) */}
                        <td className="py-3 px-4">
                          <span
                            className={`font-semibold ${
                              isExpired
                                ? 'text-[#C41E3A]'
                                : isSoon
                                ? 'text-amber-700'
                                : 'text-emerald-700'
                            }`}
                          >
                            {m.remainingDaysText}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4">{renderStatusBadge(m)}</td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5 justify-end relative">
                            {/* Profile Action */}
                            <button
                              onClick={() => setProfileModalMember(m)}
                              className="px-2 py-1 rounded-md border border-black/10 text-[#71717A] hover:text-[#1A1A1A] hover:bg-black/5 text-[11px] font-semibold transition-colors"
                            >
                              Profile
                            </button>

                            {/* Renew Action */}
                            <button
                              onClick={() => setRenewModalMember(m)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#C41E3A] text-white font-semibold text-[11px] hover:bg-[#A3182E] transition-colors"
                            >
                              <RefreshCw className="w-3 h-3" />
                              <span>Renew</span>
                            </button>

                            {/* More Actions Menu */}
                            <div className="relative">
                              <button
                                onClick={() =>
                                  setActiveMoreMenuId(activeMoreMenuId === m.id ? null : m.id)
                                }
                                className="p-1 rounded-md border border-black/10 text-[#71717A] hover:text-[#1A1A1A] hover:bg-black/5 transition-colors"
                                title="More actions"
                              >
                                <MoreVertical className="w-3.5 h-3.5" />
                              </button>

                              {activeMoreMenuId === m.id && (
                                <>
                                  <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setActiveMoreMenuId(null)}
                                  />
                                  <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-lg border border-black/10 shadow-lg py-1 z-50 text-left animate-in fade-in zoom-in-95 duration-100">
                                    <button
                                      onClick={() => handleEdit(m)}
                                      className="w-full px-3 py-1.5 text-xs text-[#1A1A1A] hover:bg-black/5 flex items-center gap-2"
                                    >
                                      <Edit className="w-3.5 h-3.5 text-[#71717A]" />
                                      <span>Edit Member</span>
                                    </button>
                                    <button
                                      onClick={() => handleCopyAdmissionLink(m)}
                                      className="w-full px-3 py-1.5 text-xs text-[#1A1A1A] hover:bg-black/5 flex items-center gap-2"
                                    >
                                      <Copy className="w-3.5 h-3.5 text-[#71717A]" />
                                      <span>Copy Admission Link</span>
                                    </button>
                                    <button
                                      onClick={() => {
                                        setIdCardMember(m);
                                        setActiveMoreMenuId(null);
                                      }}
                                      className="w-full px-3 py-1.5 text-xs text-[#1A1A1A] hover:bg-black/5 flex items-center gap-2"
                                    >
                                      <Printer className="w-3.5 h-3.5 text-[#71717A]" />
                                      <span>Print Member Card</span>
                                    </button>
                                    <button
                                      onClick={() => {
                                        setInvoiceMember(m);
                                        setActiveMoreMenuId(null);
                                      }}
                                      className="w-full px-3 py-1.5 text-xs text-[#1A1A1A] hover:bg-black/5 flex items-center gap-2"
                                    >
                                      <FileText className="w-3.5 h-3.5 text-[#71717A]" />
                                      <span>View Invoice</span>
                                    </button>
                                    <div className="border-t border-black/5 my-1" />
                                    <button
                                      onClick={() => {
                                        setDeleteConfirmMember(m);
                                        setActiveMoreMenuId(null);
                                      }}
                                      className="w-full px-3 py-1.5 text-xs text-[#C41E3A] hover:bg-[#C41E3A]/5 flex items-center gap-2"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                      <span>Delete Member</span>
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile View: Compact Member Cards */}
            <div className="md:hidden divide-y divide-black/5">
              {filteredMembers.map((m) => {
                const isExpired = m.remainingDays < 0 || (m.remainingDays === 0 && m.status === 'Expired');
                const isSoon = m.remainingDays >= 0 && m.remainingDays <= 3;

                return (
                  <div key={m.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        {m.photo ? (
                          <img
                            src={m.photo}
                            alt={m.fullName}
                            className="w-9 h-9 rounded-full object-cover border border-black/10 shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-black/5 border border-black/10 flex items-center justify-center font-bold text-xs text-[#1A1A1A] shrink-0">
                            {m.fullName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="font-semibold text-sm text-[#1A1A1A] leading-tight">{m.fullName}</h4>
                            {m.dateOfBirth && m.dateOfBirth.slice(5) === `${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}` && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                                🎂 Today
                              </span>
                            )}
                          </div>
                          <span className="font-mono text-[11px] text-[#71717A]">{m.memberId} • {m.mobile}</span>
                        </div>
                      </div>
                      {renderStatusBadge(m)}
                    </div>

                    {/* Expiry & Countdown Details */}
                    <div className="grid grid-cols-2 gap-2 bg-[#F8F6F4] p-2.5 rounded-lg text-xs">
                      <div>
                        <span className="text-[#71717A] text-[10px] uppercase font-medium block">Plan & Expiry</span>
                        <span className="font-semibold text-[#1A1A1A]">{m.plan} • {m.expiryDate}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[#71717A] text-[10px] uppercase font-medium block">Countdown</span>
                        <span
                          className={`font-semibold ${
                            isExpired ? 'text-[#C41E3A]' : isSoon ? 'text-amber-700' : 'text-emerald-700'
                          }`}
                        >
                          {m.remainingDaysText}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        onClick={() => setProfileModalMember(m)}
                        className="px-3 py-1.5 rounded-lg border border-black/10 text-xs font-semibold text-[#71717A] hover:bg-black/5"
                      >
                        Profile
                      </button>
                      <button
                        onClick={() => setRenewModalMember(m)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#C41E3A] text-white text-xs font-semibold hover:bg-[#A3182E]"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Renew</span>
                      </button>
                      <button
                        onClick={() => handleEdit(m)}
                        className="p-1.5 rounded-lg border border-black/10 text-[#71717A]"
                        title="Edit Member"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Add / Edit Member Modal */}
      {formOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-black/10 shadow-2xl p-6 space-y-5 my-8 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-black/10 pb-3">
              <div>
                <h3 className="text-lg font-bold text-[#1A1A1A] font-['Playfair_Display']">
                  {editingMemberId ? 'Edit Member Details' : 'Register New Member'}
                </h3>
                <p className="text-xs text-[#71717A]">
                  Membership dates and expiry countdown will update automatically.
                </p>
              </div>
              <button
                onClick={() => setFormOpen(false)}
                className="text-[#71717A] hover:text-[#1A1A1A] p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMember} className="space-y-4 text-xs">
              {/* Photo & Basic Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <PhotoCapture
                    value={photo}
                    onChange={(url: string) => setPhoto(url)}
                    label="Member Profile Photo"
                  />
                </div>

                <div>
                  <label className="font-semibold text-[#71717A] block mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Aarav Mehta"
                    className="w-full px-3 py-2 rounded-lg border border-black/10 bg-[#F8F6F4] text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#C41E3A] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-[#71717A] block mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 rounded-lg border border-black/10 bg-[#F8F6F4] text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#C41E3A] focus:bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-[#71717A] block mb-1">WhatsApp Number</label>
                  <input
                    type="tel"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder={mobile.trim() ? mobile.trim() : 'Same as mobile'}
                    className="w-full px-3 py-2 rounded-lg border border-black/10 bg-[#F8F6F4] text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#C41E3A] focus:bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-[#71717A] block mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="member@example.com"
                    className="w-full px-3 py-2 rounded-lg border border-black/10 bg-[#F8F6F4] text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#C41E3A] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-[#71717A] block mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-black/10 bg-[#F8F6F4] text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#C41E3A]"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-[#71717A] block mb-1">
                    🎂 Date of Birth <span className="text-[10px] text-amber-700 font-normal">(for Perks)</span>
                  </label>
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => {
                      const dob = e.target.value;
                      setDateOfBirth(dob);
                      if (dob) {
                        const birthYear = new Date(dob).getFullYear();
                        const currentYear = new Date().getFullYear();
                        const diff = currentYear - birthYear;
                        if (diff > 0 && diff < 120) setAge(diff);
                      }
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-black/10 bg-[#F8F6F4] text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#C41E3A] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-[#71717A] block mb-1">Age</label>
                  <input
                    type="number"
                    min="12"
                    max="90"
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-black/10 bg-[#F8F6F4] text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#C41E3A] focus:bg-white"
                  />
                </div>
              </div>

              {/* Membership Plan Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-black/5">
                <div>
                  <label className="font-semibold text-[#71717A] block mb-1">Membership Plan</label>
                  <select
                    value={plan}
                    onChange={(e) => {
                      const p = e.target.value as MembershipPlanType;
                      setPlan(p);
                      if (p === 'Monthly') setAmountPaid(800);
                      if (p === 'Quarterly') setAmountPaid(2100);
                      if (p === 'Half-Yearly') setAmountPaid(4000);
                      if (p === 'Annual') setAmountPaid(7000);
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-black/10 bg-[#F8F6F4] text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#C41E3A]"
                  >
                    <option value="Monthly">1 Month — ₹800</option>
                    <option value="Quarterly">3 Months — ₹2,100</option>
                    <option value="Half-Yearly">6 Months — ₹4,000</option>
                    <option value="Annual">1 Year — ₹7,000</option>
                    <option value="Custom">Custom Duration</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-[#71717A] block mb-1">Join Date</label>
                  <input
                    type="date"
                    value={joinDate}
                    onChange={(e) => setJoinDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-black/10 bg-[#F8F6F4] text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#C41E3A]"
                  />
                </div>

                {plan === 'Custom' && (
                  <>
                    <div>
                      <label className="font-semibold text-[#71717A] block mb-1">Duration (Days)</label>
                      <input
                        type="number"
                        min="1"
                        value={customDays}
                        onChange={(e) => setCustomDays(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-lg border border-black/10 bg-[#F8F6F4] text-[#1A1A1A] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-[#71717A] block mb-1">Fee Amount (₹)</label>
                      <input
                        type="number"
                        min="1"
                        value={customPrice}
                        onChange={(e) => {
                          setCustomPrice(Number(e.target.value));
                          setAmountPaid(Number(e.target.value));
                        }}
                        className="w-full px-3 py-2 rounded-lg border border-black/10 bg-[#F8F6F4] text-[#1A1A1A] focus:outline-none"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Automatic Expiry Preview */}
              <div className="p-3 rounded-lg bg-[#F8F6F4] border border-black/10 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[#71717A]">Expiry Date: </span>
                  <span className="font-bold text-[#1A1A1A] font-mono">{formExpiryInfo.expiryDate}</span>
                </div>
                <div>
                  <span className="text-[#71717A]">Remaining: </span>
                  <span className="font-bold text-[#C41E3A]">{formExpiryInfo.remainingDaysText}</span>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-black/5">
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="px-4 py-2 rounded-lg border border-black/10 text-xs font-semibold text-[#71717A] hover:bg-black/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#C41E3A] text-white text-xs font-semibold hover:bg-[#A3182E] transition-colors"
                >
                  {editingMemberId ? 'Save Changes' : 'Register Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmMember && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full border border-black/10 shadow-xl p-5 space-y-4 animate-in zoom-in-95 duration-150">
            <div>
              <h3 className="text-base font-bold text-[#1A1A1A]">Delete Member</h3>
              <p className="text-xs text-[#71717A] mt-1">
                Are you sure you want to remove <strong>{deleteConfirmMember.fullName}</strong> ({deleteConfirmMember.memberId})? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmMember(null)}
                className="px-3.5 py-1.5 rounded-lg border border-black/10 text-xs font-semibold text-[#71717A] hover:bg-black/5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteMember}
                className="px-3.5 py-1.5 rounded-lg bg-[#C41E3A] text-white text-xs font-semibold hover:bg-[#A3182E]"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Renew Modal */}
      {renewModalMember && (
        <QuickRenewModal
          member={renewModalMember}
          onClose={() => setRenewModalMember(null)}
        />
      )}

      {/* Profile Modal */}
      {profileModalMember && (
        <MemberProfileModal
          member={profileModalMember}
          onClose={() => setProfileModalMember(null)}
          onOpenIdCard={() => {
            setIdCardMember(profileModalMember);
            setProfileModalMember(null);
          }}
        />
      )}

      {/* ID Card Modal */}
      {idCardMember && (
        <MemberIdCardModal
          member={idCardMember}
          onClose={() => setIdCardMember(null)}
        />
      )}

      {/* Invoice Modal */}
      {invoiceMember && (
        <InvoiceModal
          member={invoiceMember}
          onClose={() => setInvoiceMember(null)}
        />
      )}
    </div>
  );
};
