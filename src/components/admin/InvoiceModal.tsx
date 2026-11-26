'use client';

import React from 'react';
import { Member, PaymentRecord } from '@/lib/types';
import { useApp } from '@/lib/store';
import { X, Printer, Download, Dumbbell, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface InvoiceModalProps {
  member: Member;
  payment?: PaymentRecord;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ member, payment, onClose }) => {
  const { gymSettings } = useApp();

  const receiptNo = payment?.receiptNumber || `INV-2026-${member.memberId.replace('RED-', '')}`;
  const amountPaid = payment?.amount || member.amountPaid || member.totalFee;
  const baseAmount = Math.round(amountPaid / 1.18);
  const gstAmount = amountPaid - baseAmount;
  const date = payment?.paymentDate || member.joinDate;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-black/10 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-black/10 pb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-[#1A1A1A] font-['Space_Grotesk']">
              Official Tax Invoice & Payment Receipt
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F8F6F4] hover:bg-[#EFECE8] flex items-center justify-center text-[#71717A] hover:text-[#1A1A1A] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable Invoice Document */}
        <div className="printable-area bg-[#FAF8F5] border border-black/10 rounded-2xl p-6 sm:p-8 text-[#2D2D2D] space-y-6 font-sans">
          {/* Header Row */}
          <div className="flex items-start justify-between border-b border-black/10 pb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Dumbbell className="w-5 h-5 text-[#C41E3A] -rotate-45" />
                <span className="font-extrabold text-lg text-[#1A1A1A] font-['Space_Grotesk']">
                  REDAPPLE LUXURY ATHLETICS
                </span>
              </div>
              <div className="text-xs text-[#71717A] max-w-xs leading-relaxed">
                {gymSettings.address}
                <br />
                GSTIN: <strong className="text-[#1A1A1A] font-mono">{gymSettings.gstNumber}</strong>
                <br />
                Phone: {gymSettings.phone} | Email: {gymSettings.email}
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs font-bold uppercase tracking-wider text-[#C41E3A]">
                TAX INVOICE
              </div>
              <div className="text-base font-extrabold text-[#1A1A1A] font-mono mt-0.5">
                {receiptNo}
              </div>
              <div className="text-xs text-[#71717A] mt-1">
                Date: <strong className="text-[#1A1A1A]">{date}</strong>
              </div>
              <div className="text-xs text-[#71717A]">
                Payment Mode: <strong className="text-[#00C853]">{payment?.paymentMode || 'UPI'}</strong>
              </div>
            </div>
          </div>

          {/* Bill To */}
          <div className="grid grid-cols-2 gap-4 text-xs bg-white p-4 rounded-xl border border-black/5 shadow-2xs">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#71717A] block mb-1">
                Billed To Athlete:
              </span>
              <div className="font-extrabold text-sm text-[#1A1A1A] font-['Space_Grotesk']">
                {member.fullName}
              </div>
              <div className="text-[#71717A]">Member ID: {member.memberId}</div>
              <div className="text-[#71717A]">Mobile: {member.mobile}</div>
              <div className="text-[#71717A]">Email: {member.email}</div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#71717A] block mb-1">
                Membership Details:
              </span>
              <div className="font-bold text-[#1A1A1A] text-xs">Tier: {member.plan} Plan</div>
              <div className="text-[#71717A]">Duration: {member.joinDate} to {member.expiryDate} ({member.remainingDaysText})</div>
              <div className="text-[#00C853] font-bold mt-1">Status: {member.paymentStatus}</div>
            </div>
          </div>

          {/* Line Items - Desktop Table */}
          <div className="hidden sm:block border border-black/10 rounded-xl overflow-hidden text-xs bg-white">
            <table className="w-full text-left">
              <thead className="bg-[#F0EDE8] text-[#71717A] uppercase text-[10px] font-bold border-b border-black/10">
                <tr>
                  <th className="p-3">Description</th>
                  <th className="p-3 text-center">HSN/SAC</th>
                  <th className="p-3 text-right">Taxable Value</th>
                  <th className="p-3 text-right">GST (18%)</th>
                  <th className="p-3 text-right">Total (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                <tr>
                  <td className="p-3">
                    <div className="font-bold text-[#1A1A1A]">{member.plan} Elite Club Membership Package</div>
                    <div className="text-[11px] text-[#71717A]">
                      Full Facility Access, Biometric Induction, General Trainer Floor Support
                    </div>
                  </td>
                  <td className="p-3 text-center text-[#71717A] font-mono">999723</td>
                  <td className="p-3 text-right font-mono text-[#4A4A4A]">₹{baseAmount.toLocaleString('en-IN')}</td>
                  <td className="p-3 text-right font-mono text-[#4A4A4A]">₹{gstAmount.toLocaleString('en-IN')}</td>
                  <td className="p-3 text-right font-extrabold text-[#1A1A1A] font-mono">
                    ₹{amountPaid.toLocaleString('en-IN')}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Line Items - Mobile Stacked Card */}
          <div className="sm:hidden border border-black/10 rounded-xl p-3.5 space-y-2.5 text-xs bg-white">
            <div>
              <div className="font-bold text-[#1A1A1A]">{member.plan} Membership Package</div>
              <div className="text-[10px] text-[#71717A]">Full Access, Trainer Induction</div>
            </div>
            <div className="space-y-1.5 pt-2 border-t border-black/10">
              <div className="flex justify-between text-[#71717A]">
                <span>Taxable Value:</span>
                <span className="font-mono text-[#1A1A1A]">₹{baseAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-[#71717A]">
                <span>GST (18%):</span>
                <span className="font-mono text-[#1A1A1A]">₹{gstAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between font-bold pt-1 border-t border-black/5">
                <span className="text-[#1A1A1A]">Total Amount:</span>
                <span className="font-mono text-[#00C853] text-sm">₹{amountPaid.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Summary Breakdown */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-2">
            <div className="text-[11px] text-[#71717A] max-w-xs space-y-1">
              <p>• Computer generated digital tax invoice.</p>
              <p>• Membership fees are strictly non-refundable.</p>
            </div>

            <div className="w-full sm:w-60 space-y-1.5 text-xs text-right">
              <div className="flex justify-between text-[#71717A]">
                <span>Subtotal:</span>
                <span className="font-mono text-[#1A1A1A]">₹{baseAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-[#71717A]">
                <span>CGST (9%):</span>
                <span className="font-mono text-[#1A1A1A]">₹{Math.round(gstAmount / 2).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-[#71717A]">
                <span>SGST (9%):</span>
                <span className="font-mono text-[#1A1A1A]">₹{Math.round(gstAmount / 2).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-[#1A1A1A] border-t border-black/10 pt-2 font-mono">
                <span>Grand Total:</span>
                <span className="text-[#C41E3A]">₹{amountPaid.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#F8F6F4] hover:bg-[#EFECE8] border border-black/10 text-xs font-bold text-[#1A1A1A] transition-colors"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="px-6 py-2.5 rounded-xl bg-[#C41E3A] text-white font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-[#A3182E] shadow-sm transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};
