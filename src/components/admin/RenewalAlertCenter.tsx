'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/lib/store';
import { Member } from '@/lib/types';
import { QuickRenewModal } from './QuickRenewModal';
import { MemberProfileModal } from './MemberProfileModal';
import { BulkWhatsAppQueueModal, BulkQueueItem } from './BulkWhatsAppQueueModal';
import { generateShareablePassUrl } from '@/lib/passUtils';
import {
  MessageCircle,
  RefreshCw,
  Eye,
  Search,
  CheckSquare,
  Square,
  Send,
  AlertTriangle,
  Clock,
  Calendar,
  X,
  CheckCircle2
} from 'lucide-react';

type RenewalFilterTab = 'all' | 'expired' | 'today' | '1-3days' | '4-7days';

export const RenewalAlertCenter: React.FC = () => {
  const { members, sendWhatsAppMessage, generateWhatsAppLink } = useApp();

  const [activeTab, setActiveTab] = useState<RenewalFilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMemberIds, setSelectedMemberIds] = useState<Set<string>>(new Set());
  const [showBulkConfirmModal, setShowBulkConfirmModal] = useState(false);
  const [bulkQueueOpen, setBulkQueueOpen] = useState(false);
  const [bulkQueueItems, setBulkQueueItems] = useState<BulkQueueItem[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [selectedMemberForRenew, setSelectedMemberForRenew] = useState<Member | null>(null);
  const [selectedMemberForProfile, setSelectedMemberForProfile] = useState<Member | null>(null);

  // Categorize counts across all members
  const counts = useMemo(() => {
    let expired = 0;
    let today = 0;
    let next1to3 = 0;
    let next4to7 = 0;

    members.forEach((m) => {
      if (m.remainingDays < 0 || (m.remainingDays === 0 && m.status === 'Expired')) {
        expired++;
      } else if (m.remainingDays === 0) {
        today++;
      } else if (m.remainingDays >= 1 && m.remainingDays <= 3) {
        next1to3++;
      } else if (m.remainingDays >= 4 && m.remainingDays <= 7) {
        next4to7++;
      }
    });

    return { expired, today, next1to3, next4to7 };
  }, [members]);

  // Filtered members list
  const filteredMembers = useMemo(() => {
    return members
      .filter((m) => {
        // Tab filter
        if (activeTab === 'expired') {
          return m.remainingDays < 0 || (m.remainingDays === 0 && m.status === 'Expired');
        }
        if (activeTab === 'today') {
          return m.remainingDays === 0;
        }
        if (activeTab === '1-3days') {
          return m.remainingDays >= 1 && m.remainingDays <= 3;
        }
        if (activeTab === '4-7days') {
          return m.remainingDays >= 4 && m.remainingDays <= 7;
        }
        // 'all' shows members needing attention (<= 7 days or expired)
        return m.remainingDays <= 7 || m.status === 'Expired';
      })
      .filter((m) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase().trim();
        return (
          m.fullName.toLowerCase().includes(q) ||
          m.whatsapp.includes(q) ||
          m.memberId.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => a.remainingDays - b.remainingDays);
  }, [members, activeTab, searchQuery]);

  // Bulk selection handlers
  const handleToggleSelectAll = () => {
    if (selectedMemberIds.size === filteredMembers.length && filteredMembers.length > 0) {
      setSelectedMemberIds(new Set());
    } else {
      setSelectedMemberIds(new Set(filteredMembers.map((m) => m.id)));
    }
  };

  const handleToggleSelect = (id: string) => {
    const next = new Set(selectedMemberIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedMemberIds(next);
  };

  // WhatsApp Single Reminder
  const handleSendWhatsAppReminder = (m: Member) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://redapplefitness.com';
    const passUrl = generateShareablePassUrl(m, baseUrl);
    const text = `Hello ${m.fullName},\n\nThis is a renewal reminder from Red Apple Gym (CIDCO N-2).\n\nYour ${m.plan} membership ${m.remainingDays <= 0 ? 'expired on' : 'expires on'} ${m.expiryDate} (${m.remainingDaysText}).\n\n📱 Member Pass: ${passUrl}\n\nPlease renew at reception to keep your gym access active!\n\nRed Apple Gym Management`;

    sendWhatsAppMessage(m.fullName, m.whatsapp, 'renewal_reminder', text);
    const link = generateWhatsAppLink(m.whatsapp, text);
    window.open(link, '_blank');
  };

  // Bulk WhatsApp Dispatch
  const handleConfirmBulkWhatsApp = () => {
    const selectedList = members.filter((m) => selectedMemberIds.has(m.id));
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://redapplefitness.com';

    const queue: BulkQueueItem[] = selectedList.map((m) => {
      const passUrl = generateShareablePassUrl(m, baseUrl);
      const text = `Hello ${m.fullName},\n\nThis is a renewal reminder from Red Apple Gym (CIDCO N-2).\n\nYour ${m.plan} membership ${m.remainingDays <= 0 ? 'expired on' : 'expires on'} ${m.expiryDate} (${m.remainingDaysText}).\n\n📱 Member Pass: ${passUrl}\n\nPlease renew at reception to keep your gym access active!\n\nRed Apple Gym Management`;
      return {
        id: m.id,
        name: m.fullName,
        mobile: m.whatsapp || m.mobile,
        message: text,
        subtext: `${m.plan} • ${m.remainingDaysText}`,
        avatar: m.photo
      };
    });

    setShowBulkConfirmModal(false);
    setBulkQueueItems(queue);
    setBulkQueueOpen(true);
    setSelectedMemberIds(new Set());
  };

  // Helper for status badge style
  const getStatusBadge = (m: Member) => {
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
      {/* Toast Notification */}
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-[#1A1A1A] font-['Playfair_Display']">
            Renewal Alert Center
          </h2>
          <p className="text-xs text-[#71717A] mt-0.5">
            Monitor approaching expiries and send 1-click WhatsApp reminders.
          </p>
        </div>

        {/* Bulk Action Trigger when members selected */}
        {selectedMemberIds.size > 0 && (
          <button
            onClick={() => setShowBulkConfirmModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#C41E3A] text-white text-xs font-semibold shadow-xs hover:bg-[#A3182E] transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Bulk WhatsApp ({selectedMemberIds.size})</span>
          </button>
        )}
      </div>

      {/* Summary Strip (4 Compact Counters) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            id: 'expired' as const,
            label: 'Expired',
            count: counts.expired,
            badgeClass: 'text-[#C41E3A]',
            bgActive: 'bg-[#C41E3A]/5 border-[#C41E3A]'
          },
          {
            id: 'today' as const,
            label: 'Expires Today',
            count: counts.today,
            badgeClass: 'text-amber-700',
            bgActive: 'bg-amber-50/50 border-amber-400'
          },
          {
            id: '1-3days' as const,
            label: 'Expires in 1–3 Days',
            count: counts.next1to3,
            badgeClass: 'text-amber-600',
            bgActive: 'bg-amber-50/40 border-amber-300'
          },
          {
            id: '4-7days' as const,
            label: 'Expires in 4–7 Days',
            count: counts.next4to7,
            badgeClass: 'text-[#1A1A1A]',
            bgActive: 'bg-black/5 border-black/30'
          }
        ].map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(isActive ? 'all' : item.id)}
              className={`p-4 rounded-xl border text-left transition-all bg-white shadow-2xs ${
                isActive ? item.bgActive : 'border-black/10 hover:border-black/20'
              }`}
            >
              <div className="text-xs font-medium text-[#71717A]">{item.label}</div>
              <div className={`text-2xl font-bold font-['Playfair_Display'] mt-1 ${item.badgeClass}`}>
                {item.count}
              </div>
            </button>
          );
        })}
      </div>

      {/* Operational Table Card */}
      <div className="bg-white rounded-xl border border-black/10 shadow-2xs overflow-hidden">
        {/* Controls Bar: Tabs & Search */}
        <div className="p-4 border-b border-black/10 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Tabs (Smooth horizontal swipe on mobile) */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 md:pb-0 scroll-smooth w-full md:w-auto">
            {[
              { id: 'all' as const, label: 'All Urgencies' },
              { id: 'expired' as const, label: `Expired (${counts.expired})` },
              { id: 'today' as const, label: `Today (${counts.today})` },
              { id: '1-3days' as const, label: `Next 3 Days (${counts.next1to3})` },
              { id: '4-7days' as const, label: `Next 7 Days (${counts.next4to7})` }
            ].map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-[#C41E3A] text-white shadow-2xs'
                      : 'text-[#71717A] hover:text-[#1A1A1A] hover:bg-black/5'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Search box */}
          <div className="relative w-full md:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#71717A]" />
            <input
              type="text"
              placeholder="Search member or mobile..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs border border-black/10 bg-[#F8F6F4] text-[#1A1A1A] placeholder:text-[#A1A1AA] focus:outline-none focus:ring-1 focus:ring-[#C41E3A] focus:bg-white"
            />
          </div>
        </div>

        {/* Selected Banner */}
        {selectedMemberIds.size > 0 && (
          <div className="px-4 py-2 bg-amber-50 border-b border-amber-200/60 text-xs font-medium text-amber-900 flex items-center justify-between">
            <span>
              {selectedMemberIds.size} of {filteredMembers.length} members selected for bulk reminder
            </span>
            <button
              onClick={() => setSelectedMemberIds(new Set())}
              className="text-amber-800 underline hover:text-amber-950"
            >
              Deselect All
            </button>
          </div>
        )}

        {/* Table Content */}
        {filteredMembers.length === 0 ? (
          <div className="py-16 text-center text-[#71717A] text-xs space-y-1">
            <AlertTriangle className="w-8 h-8 text-[#A1A1AA] mx-auto stroke-1" />
            <p className="font-semibold text-sm text-[#1A1A1A]">No renewal alerts in this view</p>
            <p>All members in this category have active memberships or no search matches found.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8F6F4] text-[#71717A] font-semibold border-b border-black/10 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4 w-10 text-center">
                      <button
                        type="button"
                        onClick={handleToggleSelectAll}
                        className="text-[#71717A] hover:text-[#1A1A1A]"
                        title="Select all"
                      >
                        {selectedMemberIds.size === filteredMembers.length && filteredMembers.length > 0 ? (
                          <CheckSquare className="w-4 h-4 text-[#C41E3A]" />
                        ) : (
                          <Square className="w-4 h-4 text-[#A1A1AA]" />
                        )}
                      </button>
                    </th>
                    <th className="py-3 px-4">Member</th>
                    <th className="py-3 px-4">Mobile</th>
                    <th className="py-3 px-4">Plan</th>
                    <th className="py-3 px-4">Expiry Date</th>
                    <th className="py-3 px-4">Remaining Days</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 text-[#1A1A1A]">
                  {filteredMembers.map((m) => {
                    const isSelected = selectedMemberIds.has(m.id);
                    const isExpired = m.remainingDays < 0 || (m.remainingDays === 0 && m.status === 'Expired');
                    const isSoon = m.remainingDays >= 0 && m.remainingDays <= 3;

                    return (
                      <tr
                        key={m.id}
                        className={`hover:bg-black/[0.02] transition-colors ${
                          isSelected ? 'bg-[#C41E3A]/[0.03]' : ''
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleSelect(m.id)}
                            className="text-[#71717A] hover:text-[#1A1A1A]"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-[#C41E3A]" />
                            ) : (
                              <Square className="w-4 h-4 text-[#A1A1AA]" />
                            )}
                          </button>
                        </td>

                        {/* Member */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-black/5 border border-black/10 flex items-center justify-center font-bold text-[11px] text-[#1A1A1A] shrink-0">
                              {m.fullName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <span className="font-semibold text-[#1A1A1A] block">{m.fullName}</span>
                              <span className="text-[11px] text-[#71717A] font-mono">{m.memberId}</span>
                            </div>
                          </div>
                        </td>

                        {/* Mobile */}
                        <td className="py-3 px-4 font-mono text-[#71717A]">{m.whatsapp}</td>

                        {/* Plan */}
                        <td className="py-3 px-4 font-medium">{m.plan}</td>

                        {/* Expiry Date */}
                        <td className="py-3 px-4 font-medium">{m.expiryDate}</td>

                        {/* Remaining Days */}
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
                        <td className="py-3 px-4">{getStatusBadge(m)}</td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5 justify-end">
                            <button
                              onClick={() => handleSendWhatsAppReminder(m)}
                              title="Send WhatsApp Reminder"
                              className="p-1.5 rounded-lg border border-black/10 text-[#71717A] hover:text-[#25D366] hover:border-[#25D366]/40 hover:bg-[#25D366]/5 transition-colors"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setSelectedMemberForRenew(m)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#C41E3A] text-white font-semibold text-[11px] hover:bg-[#A3182E] transition-colors"
                            >
                              <RefreshCw className="w-3 h-3" />
                              <span>Renew</span>
                            </button>
                            <button
                              onClick={() => setSelectedMemberForProfile(m)}
                              title="View Profile"
                              className="p-1.5 rounded-lg border border-black/10 text-[#71717A] hover:text-[#1A1A1A] hover:bg-black/5 transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="md:hidden divide-y divide-black/5">
              {filteredMembers.map((m) => {
                const isSelected = selectedMemberIds.has(m.id);
                const isExpired = m.remainingDays < 0 || (m.remainingDays === 0 && m.status === 'Expired');
                const isSoon = m.remainingDays >= 0 && m.remainingDays <= 3;

                return (
                  <div
                    key={m.id}
                    className={`p-4 space-y-3 ${isSelected ? 'bg-[#C41E3A]/[0.03]' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => handleToggleSelect(m.id)}
                          className="text-[#71717A] hover:text-[#1A1A1A] p-0.5 shrink-0"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-[#C41E3A]" />
                          ) : (
                            <Square className="w-4 h-4 text-[#A1A1AA]" />
                          )}
                        </button>

                        <div className="w-8 h-8 rounded-full bg-black/5 border border-black/10 flex items-center justify-center font-bold text-xs text-[#1A1A1A] shrink-0">
                          {m.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm text-[#1A1A1A] leading-tight">{m.fullName}</h4>
                          <span className="font-mono text-[11px] text-[#71717A]">{m.memberId} • {m.whatsapp}</span>
                        </div>
                      </div>

                      {getStatusBadge(m)}
                    </div>

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

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        onClick={() => handleSendWhatsAppReminder(m)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#25D366]/40 text-[#128C7E] bg-[#25D366]/5 text-xs font-semibold"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </button>

                      <button
                        onClick={() => setSelectedMemberForRenew(m)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#C41E3A] text-white text-xs font-semibold hover:bg-[#A3182E]"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Renew</span>
                      </button>

                      <button
                        onClick={() => setSelectedMemberForProfile(m)}
                        className="p-1.5 rounded-lg border border-black/10 text-[#71717A] hover:bg-black/5"
                        title="View Profile"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Floating Mobile Bulk WhatsApp Trigger */}
      {selectedMemberIds.size > 0 && (
        <div className="fixed bottom-20 left-4 right-4 z-40 md:hidden animate-in slide-in-from-bottom duration-200">
          <button
            onClick={() => setShowBulkConfirmModal(true)}
            className="w-full py-3.5 px-4 rounded-2xl bg-[#C41E3A] text-white font-bold text-xs shadow-xl shadow-[#C41E3A]/40 flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Send Bulk WhatsApp ({selectedMemberIds.size} Selected)</span>
          </button>
        </div>
      )}

      {/* Bulk WhatsApp Confirmation Modal */}
      {showBulkConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-black/10 shadow-xl p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-[#1A1A1A]">Confirm Bulk WhatsApp Alert</h3>
                <p className="text-xs text-[#71717A] mt-0.5">
                  Send renewal reminder to {selectedMemberIds.size} selected members.
                </p>
              </div>
              <button
                onClick={() => setShowBulkConfirmModal(false)}
                className="text-[#71717A] hover:text-[#1A1A1A] p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F8F6F4] border border-black/5 text-xs text-[#1A1A1A] space-y-2">
              <p className="font-semibold text-[#71717A] uppercase text-[10px] tracking-wider">
                Message Preview
              </p>
              <p className="italic text-[#1A1A1A] leading-relaxed">
                &ldquo;Hello [Member Name], this is a renewal reminder from Red Apple Gym (CIDCO N-2). Your membership expires on [Expiry Date] ([Remaining Days]). Please renew at reception...&rdquo;
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowBulkConfirmModal(false)}
                className="px-4 py-2 rounded-lg border border-black/10 text-xs font-semibold text-[#71717A] hover:bg-black/5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmBulkWhatsApp}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#C41E3A] text-white text-xs font-semibold hover:bg-[#A3182E] transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Dispatch to {selectedMemberIds.size} Members</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Renew Modal */}
      {selectedMemberForRenew && (
        <QuickRenewModal
          member={selectedMemberForRenew}
          onClose={() => setSelectedMemberForRenew(null)}
        />
      )}

      {/* Member Profile Modal */}
      {selectedMemberForProfile && (
        <MemberProfileModal
          member={selectedMemberForProfile}
          onClose={() => setSelectedMemberForProfile(null)}
        />
      )}

      {/* Bulk WhatsApp Queue Modal */}
      <BulkWhatsAppQueueModal
        isOpen={bulkQueueOpen}
        onClose={() => setBulkQueueOpen(false)}
        title="Bulk WhatsApp Renewal Dispatch"
        subtitle={`Sending renewal alerts to ${bulkQueueItems.length} selected members`}
        items={bulkQueueItems}
        messageType="renewal_reminder"
      />
    </div>
  );
};
