'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { Member, PaymentMode, PaymentRecord, PaymentStatus } from '@/lib/types';
import { InvoiceModal } from './InvoiceModal';
import {
  CreditCard,
  Plus,
  DollarSign,
  AlertTriangle,
  Clock,
  TrendingUp,
  FileText,
  MessageCircle,
  CheckCircle2,
  Filter,
  Search,
  X,
  Printer
} from 'lucide-react';

export const PaymentManagement: React.FC = () => {
  const { members, payments, addPayment, updateMember, generateWhatsAppLink } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'pending' | 'history'>('pending');
  const [selectedInvoice, setSelectedInvoice] = useState<{ member: Member; payment?: PaymentRecord } | null>(null);
  const [recordPaymentModalMember, setRecordPaymentModalMember] = useState<Member | null>(null);

  // Form for recording payment
  const [payAmount, setPayAmount] = useState<number>(10000);
  const [payMode, setPayMode] = useState<PaymentMode>('UPI');
  const [payNotes, setPayNotes] = useState('');

  // Pending metrics
  const pendingMembers = members.filter((m) => m.dueAmount > 0 || m.paymentStatus !== 'Paid');
  const totalPendingAmount = pendingMembers.reduce((acc, m) => acc + (m.dueAmount || 0), 0);
  const overdueMembers = members.filter((m) => m.paymentStatus === 'Overdue');
  const overdueAmount = overdueMembers.reduce((acc, m) => acc + (m.dueAmount || 0), 0);

  const todayStr = new Date().toISOString().split('T')[0];
  const dueTodayMembers = members.filter((m) => m.dueDate === todayStr && m.dueAmount > 0);

  const totalCollectedThisYear = payments.reduce((acc, p) => acc + p.amount, 0);
  const collectionRatePercent = Math.round((totalCollectedThisYear / (totalCollectedThisYear + totalPendingAmount || 1)) * 100);

  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recordPaymentModalMember) return;

    const currentDue = recordPaymentModalMember.dueAmount;
    const newPaidTotal = recordPaymentModalMember.amountPaid + Number(payAmount);
    const newDueTotal = Math.max(0, currentDue - Number(payAmount));
    const newStatus: PaymentStatus = newDueTotal === 0 ? 'Paid' : 'Partially Paid';

    // Update Member record
    updateMember(recordPaymentModalMember.id, {
      amountPaid: newPaidTotal,
      dueAmount: newDueTotal,
      paymentStatus: newStatus
    });

    // Add Payment History log
    addPayment({
      memberId: recordPaymentModalMember.id,
      memberName: recordPaymentModalMember.fullName,
      plan: recordPaymentModalMember.plan,
      amount: Number(payAmount),
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMode: payMode,
      status: newStatus,
      taxAmount: Math.round(Number(payAmount) * 0.18),
      notes: payNotes || `Installment received via ${payMode}.`
    });

    setRecordPaymentModalMember(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-[#1A1A1A] font-serif">
          Payment Tracking & Dues Collection Dashboard
        </h2>
        <p className="text-xs text-[#666666] mt-0.5">
          Track membership fees, overdue debt recovery, partial installment logs, and official GST tax receipts.
        </p>
      </div>

      {/* Pending Payments High-Impact Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-black/10 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#71717A]">
              Total Pending Dues
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-900 font-serif">
            ₹{totalPendingAmount.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-[#8A8A8A] mt-1">
            Across {pendingMembers.length} athletes with balances
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-black/10 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#71717A]">
              Overdue Members
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-[#C41E3A] flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#C41E3A] font-serif">
            {overdueMembers.length} Athletes
          </div>
          <div className="text-[11px] text-[#8A8A8A] mt-1">
            ₹{overdueAmount.toLocaleString('en-IN')} total overdue
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-black/10 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#71717A]">
              Dues Due Today
            </span>
            <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-800 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-orange-800 font-serif">
            {dueTodayMembers.length} Members
          </div>
          <div className="text-[11px] text-[#8A8A8A] mt-1">
            Immediate WhatsApp settlement queue
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-black/10 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#71717A]">
              Collection Rate
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-800 font-serif">
            {collectionRatePercent}%
          </div>
          <div className="text-[11px] text-[#8A8A8A] mt-1">
            ₹{totalCollectedThisYear.toLocaleString('en-IN')} collected to date
          </div>
        </div>
      </div>

      {/* Sub-tab switcher */}
      <div className="flex items-center gap-2 border-b border-black/10 pb-3">
        <button
          onClick={() => setActiveSubTab('pending')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'pending'
              ? 'bg-[#1A1A1A] text-white shadow-xs'
              : 'bg-[#F8F6F4] text-[#4A4A4A] hover:bg-neutral-200'
          }`}
        >
          Pending Dues Queue ({pendingMembers.length})
        </button>

        <button
          onClick={() => setActiveSubTab('history')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'history'
              ? 'bg-[#1A1A1A] text-white shadow-xs'
              : 'bg-[#F8F6F4] text-[#4A4A4A] hover:bg-neutral-200'
          }`}
        >
          Payment Transactions Log ({payments.length})
        </button>
      </div>

      {/* VIEW 1: Pending Dues Queue */}
      {activeSubTab === 'pending' && (
        <div className="rounded-3xl bg-white border border-black/10 overflow-hidden shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-black/10 pb-4">
            <div>
              <h3 className="text-base font-bold text-[#1A1A1A] font-serif">
                Outstanding Balance & Overdue List
              </h3>
              <p className="text-xs text-[#666666]">
                1-click record payment or dispatch direct WhatsApp payment link with personalized invoice breakdown.
              </p>
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F6F4] text-[#71717A] uppercase text-[10px] font-bold tracking-wider border-b border-black/10">
                <tr>
                  <th className="p-3">Athlete</th>
                  <th className="p-3">Plan Tier</th>
                  <th className="p-3">Total Package</th>
                  <th className="p-3">Amount Paid</th>
                  <th className="p-3">Remaining Due</th>
                  <th className="p-3">Due Date</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {pendingMembers.map((m) => (
                  <tr key={m.id} className="hover:bg-black/[0.02]">
                    <td className="p-3">
                      <div className="font-bold text-[#1A1A1A] text-sm">
                        {m.fullName}
                      </div>
                      <div className="text-[10px] text-[#71717A] font-mono">
                        {m.memberId} • {m.mobile}
                      </div>
                    </td>
                    <td className="p-3 font-semibold text-[#4A4A4A]">{m.plan}</td>
                    <td className="p-3 font-mono">₹{m.totalFee.toLocaleString('en-IN')}</td>
                    <td className="p-3 font-mono text-emerald-700 font-semibold">₹{m.amountPaid.toLocaleString('en-IN')}</td>
                    <td className="p-3 font-mono font-bold text-[#C41E3A]">
                      ₹{m.dueAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3 font-mono text-[#4A4A4A]">{m.dueDate}</td>
                    <td className="p-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          m.paymentStatus === 'Overdue'
                            ? 'bg-rose-100 text-[#C41E3A] border border-rose-300'
                            : 'bg-amber-100 text-amber-900 border border-amber-300'
                        }`}
                      >
                        {m.paymentStatus}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* WhatsApp reminder */}
                        <a
                          href={generateWhatsAppLink(
                            m.whatsapp,
                            `Hello ${m.fullName}, reminder from Red Apple Gym CIDCO N-2 regarding your pending balance of ₹${m.dueAmount.toLocaleString('en-IN')} due on ${m.dueDate}. Please visit reception to settle.`
                          )}
                          target="_blank"
                          rel="noreferrer"
                          title="Send WhatsApp Payment Link"
                          className="p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </a>

                        {/* Record Payment */}
                        <button
                          onClick={() => {
                            setRecordPaymentModalMember(m);
                            setPayAmount(m.dueAmount);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-[#00C853] hover:bg-[#00B046] text-white font-bold text-xs uppercase tracking-wider shadow-xs transition-colors"
                        >
                          Record Payment
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-black/5 -mx-2">
            {pendingMembers.map((m) => (
              <div key={m.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-[#1A1A1A] text-sm">{m.fullName}</h4>
                    <span className="font-mono text-[11px] text-[#71717A] block">{m.memberId} • {m.mobile}</span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      m.paymentStatus === 'Overdue'
                        ? 'bg-rose-100 text-[#C41E3A] border border-rose-300'
                        : 'bg-amber-100 text-amber-900 border border-amber-300'
                    }`}
                  >
                    {m.paymentStatus}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 bg-[#F8F6F4] p-2.5 rounded-xl text-xs">
                  <div>
                    <span className="text-[#71717A] text-[10px] uppercase font-semibold block">Plan Fee</span>
                    <span className="font-mono text-[#1A1A1A]">₹{m.totalFee.toLocaleString('en-IN')}</span>
                  </div>
                  <div>
                    <span className="text-[#71717A] text-[10px] uppercase font-semibold block">Paid</span>
                    <span className="font-mono text-emerald-700 font-semibold">₹{m.amountPaid.toLocaleString('en-IN')}</span>
                  </div>
                  <div>
                    <span className="text-[#71717A] text-[10px] uppercase font-semibold block">Due</span>
                    <span className="font-mono font-bold text-[#C41E3A]">₹{m.dueAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-[#71717A] px-1">
                  <span>Due Date: <strong className="text-[#1A1A1A] font-mono">{m.dueDate}</strong></span>
                  <span className="text-[11px]">{m.plan}</span>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <a
                    href={generateWhatsAppLink(
                      m.whatsapp,
                      `Hello ${m.fullName}, reminder from Red Apple Gym CIDCO N-2 regarding your pending balance of ₹${m.dueAmount.toLocaleString('en-IN')} due on ${m.dueDate}. Please visit reception to settle.`
                    )}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-semibold flex items-center justify-center gap-1.5"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>

                  <button
                    onClick={() => {
                      setRecordPaymentModalMember(m);
                      setPayAmount(m.dueAmount);
                    }}
                    className="flex-1 py-2 rounded-xl bg-[#00C853] hover:bg-[#00B046] text-white font-bold text-xs uppercase tracking-wider shadow-xs flex items-center justify-center gap-1"
                  >
                    <span>Record Payment</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 2: Payment Transactions Log */}
      {activeSubTab === 'history' && (
        <div className="rounded-3xl bg-white border border-black/10 overflow-hidden shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-black/10 pb-4">
            <div>
              <h3 className="text-base font-bold text-[#1A1A1A] font-serif">
                Complete Payment History & Tax Records
              </h3>
              <p className="text-xs text-[#666666]">
                GST receipts with UPI, Card, Net Banking and Cash audit trails.
              </p>
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F6F4] text-[#71717A] uppercase text-[10px] font-bold tracking-wider border-b border-black/10">
                <tr>
                  <th className="p-3">Receipt No</th>
                  <th className="p-3">Athlete</th>
                  <th className="p-3">Plan</th>
                  <th className="p-3">Amount Received</th>
                  <th className="p-3">GST Tax (18%)</th>
                  <th className="p-3">Payment Mode</th>
                  <th className="p-3">Transaction Date</th>
                  <th className="p-3 text-right">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {payments.map((p) => {
                  const mem = members.find((m) => m.id === p.memberId);
                  return (
                    <tr key={p.id} className="hover:bg-black/[0.02]">
                      <td className="p-3 font-mono font-bold text-[#4A4A4A]">{p.receiptNumber}</td>
                      <td className="p-3 font-bold text-[#1A1A1A]">{p.memberName}</td>
                      <td className="p-3 text-[#4A4A4A]">{p.plan}</td>
                      <td className="p-3 font-mono font-bold text-emerald-700">
                        ₹{p.amount.toLocaleString('en-IN')}
                      </td>
                      <td className="p-3 font-mono text-[#71717A]">₹{p.taxAmount.toLocaleString('en-IN')}</td>
                      <td className="p-3">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-black/5 text-[#4A4A4A] uppercase">
                          {p.paymentMode}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-[#4A4A4A]">{p.paymentDate}</td>
                      <td className="p-3 text-right">
                        {mem && (
                          <button
                            onClick={() => setSelectedInvoice({ member: mem, payment: p })}
                            className="px-3 py-1.5 rounded-lg bg-[#F8F6F4] hover:bg-neutral-200 text-[#1A1A1A] border border-black/10 text-xs font-bold flex items-center gap-1.5 ml-auto"
                          >
                            <FileText className="w-3.5 h-3.5 text-emerald-600" />
                            <span>View Receipt</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View for Payment History */}
          <div className="md:hidden divide-y divide-black/5 -mx-2">
            {payments.map((p) => {
              const mem = members.find((m) => m.id === p.memberId);
              return (
                <div key={p.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-[#1A1A1A] text-sm">{p.memberName}</h4>
                      <span className="font-mono text-[11px] text-[#71717A] block">{p.receiptNumber}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-mono font-bold text-emerald-700">
                        ₹{p.amount.toLocaleString('en-IN')}
                      </div>
                      <span className="text-[10px] text-[#71717A] font-mono">{p.paymentDate}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-[#71717A] bg-[#F8F6F4] px-3 py-2 rounded-xl">
                    <span className="flex items-center gap-1.5">
                      <span>Mode:</span>
                      <strong className="text-[#1A1A1A] uppercase font-bold text-[10px] bg-white px-2 py-0.5 rounded border border-black/5">
                        {p.paymentMode}
                      </strong>
                    </span>
                    <span>Plan: <strong className="text-[#1A1A1A]">{p.plan}</strong></span>
                  </div>

                  {mem && (
                    <button
                      onClick={() => setSelectedInvoice({ member: mem, payment: p })}
                      className="w-full py-2 rounded-xl bg-[#F8F6F4] hover:bg-neutral-200 text-[#1A1A1A] border border-black/10 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5 text-emerald-600" />
                      <span>View Receipt & GST Invoice</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {recordPaymentModalMember && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white border border-black/10 rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-5 animate-in zoom-in-95 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-black/10 pb-3">
              <h3 className="text-lg font-bold text-[#1A1A1A] font-serif">
                Record Payment / Installment
              </h3>
              <button onClick={() => setRecordPaymentModalMember(null)} className="text-[#71717A] hover:text-[#1A1A1A]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmPayment} className="text-xs text-[#1A1A1A] space-y-4">
              <div className="p-3 rounded-xl bg-[#F8F6F4] space-y-1">
                <div className="font-bold text-[#1A1A1A] text-sm">
                  {recordPaymentModalMember.fullName} ({recordPaymentModalMember.memberId})
                </div>
                <div className="text-[#71717A]">
                  Total Fee: ₹{recordPaymentModalMember.totalFee.toLocaleString('en-IN')} • Current Due: <strong className="text-[#C41E3A]">₹{recordPaymentModalMember.dueAmount.toLocaleString('en-IN')}</strong>
                </div>
              </div>

              <div>
                <label className="font-bold uppercase tracking-wider text-[#71717A] block mb-1">
                  Amount Received (₹) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max={recordPaymentModalMember.dueAmount || recordPaymentModalMember.totalFee}
                  value={payAmount}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#F8F6F4] border border-black/10 text-[#1A1A1A] font-mono text-sm outline-none focus:bg-white focus:border-[#C41E3A]"
                />
              </div>

              <div>
                <label className="font-bold uppercase tracking-wider text-[#71717A] block mb-1">
                  Payment Mode *
                </label>
                <select
                  value={payMode}
                  onChange={(e) => setPayMode(e.target.value as PaymentMode)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#F8F6F4] border border-black/10 text-[#1A1A1A] outline-none focus:bg-white"
                >
                  <option value="UPI">UPI (GPay / PhonePe / QR)</option>
                  <option value="Card">Credit / Debit Card</option>
                  <option value="Cash">Cash Deposit at Front Desk</option>
                  <option value="Bank Transfer">Bank Transfer (NEFT / IMPS)</option>
                </select>
              </div>

              <div>
                <label className="font-bold uppercase tracking-wider text-[#71717A] block mb-1">
                  Transaction Notes / Bank Reference ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. UTR # 492019349102"
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#F8F6F4] border border-black/10 text-[#1A1A1A] outline-none focus:bg-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-black/10">
                <button
                  type="button"
                  onClick={() => setRecordPaymentModalMember(null)}
                  className="px-4 py-2 rounded-xl bg-[#F8F6F4] hover:bg-neutral-200 text-[#4A4A4A] font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-[#00C853] hover:bg-[#00B046] text-white font-bold uppercase tracking-wider shadow-xs cursor-pointer"
                >
                  Confirm & Issue Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {selectedInvoice && (
        <InvoiceModal
          member={selectedInvoice.member}
          payment={selectedInvoice.payment}
          onClose={() => setSelectedInvoice(null)}
        />
      )}
    </div>
  );
};
