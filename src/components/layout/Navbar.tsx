'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import {
  Dumbbell,
  Menu,
  X,
  MessageCircle,
  ArrowRight,
  Clock,
  Sparkles
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { gymSettings, generateWhatsAppLink } = useApp();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Philosophy', href: '#about' },
    { name: 'Facilities', href: '#facilities' },
    { name: 'Coaches', href: '#trainers' },
    { name: 'Memberships', href: '#pricing' },
    { name: 'Results', href: '#transformations' },
    { name: 'Diagnostic', href: '#bmi' },
    { name: 'Location', href: '#contact' }
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 px-3 sm:px-6 pt-2 sm:pt-3 transition-all duration-300">
        <div
          className={`max-w-7xl mx-auto rounded-2xl sm:rounded-3xl transition-all duration-300 px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between ${
            scrolled
              ? 'bg-white/95 backdrop-blur-xl border border-black/10 shadow-[0_12px_35px_rgba(0,0,0,0.08)]'
              : 'bg-white/90 backdrop-blur-lg border border-black/[0.06] shadow-[0_6px_25px_rgba(0,0,0,0.04)]'
          }`}
        >
          {/* Brand Logo & Heritage Title */}
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white p-0.5 shadow-md shadow-[#C41E3A]/20 border border-[#D4A574]/40 group-hover:shadow-[#C41E3A]/40 transition-all overflow-hidden flex items-center justify-center shrink-0">
              <img
                src="/images/logo.png"
                alt="Red Apple Gym and Fitness Center"
                className="w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-[#1A1A1A] font-serif leading-tight">
                  RED APPLE GYM
                </span>
                <span className="text-[8px] sm:text-[9px] font-bold tracking-widest px-1.5 py-0.5 rounded-full bg-[#D4A574]/15 text-[#9E6B32] border border-[#D4A574]/40">
                  CIDCO N-2
                </span>
              </div>
              <span className="text-[9px] sm:text-[10px] tracking-wider text-[#666666] block -mt-0.5 font-semibold uppercase">
                AND FITNESS CENTER • 4.7 ★ Club
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 bg-[#F8F6F4]/90 px-3 py-1 rounded-full border border-black/5">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-[10px] font-bold text-emerald-800 shrink-0 mr-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>05:00 - 22:00</span>
            </div>

            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="px-2.5 py-1.5 rounded-full text-xs font-semibold text-[#4A4A4A] hover:text-[#C41E3A] hover:bg-white hover:shadow-2xs transition-all whitespace-nowrap"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Action CTAs (WhatsApp & Join Club) */}
          <div className="hidden sm:flex items-center gap-2.5 shrink-0">
            {/* WhatsApp Concierge */}
            <a
              href={generateWhatsAppLink(
                gymSettings.whatsapp,
                'Hello Red Apple Gym Concierge! I want to inquire about membership packages & personal training.'
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#1A1A1A] hover:bg-neutral-100 border border-black/10 bg-white transition-all shadow-2xs group"
            >
              <MessageCircle className="w-4 h-4 text-[#25D366] group-hover:scale-110 transition-transform" />
              <span>WhatsApp</span>
            </a>

            {/* Direct Join CTA */}
            <Link
              href="/admission"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#C41E3A] to-[#9E1228] hover:shadow-lg hover:shadow-[#C41E3A]/30 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Join Club</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mobile menu button & quick join */}
          <div className="flex lg:hidden items-center gap-2">
            <Link
              href="/admission"
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-[#C41E3A] shadow-xs"
            >
              Join
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-[#F8F6F4] border border-black/10 text-[#1A1A1A]"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden max-w-7xl mx-auto mt-2 bg-white/98 backdrop-blur-2xl border border-black/10 rounded-2xl p-4 space-y-3 shadow-2xl animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800">
              <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Now Open • Mon–Sat 05:00 AM to 10:00 PM</span>
            </div>

            <div className="space-y-1">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3.5 py-2.5 rounded-xl text-sm font-semibold text-[#4A4A4A] hover:text-[#C41E3A] hover:bg-neutral-50 transition-colors"
                >
                  {link.name}
                </a>
              ))}
            </div>

            <div className="pt-3 border-t border-black/5 flex flex-col gap-2.5">
              <Link
                href="/admission"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-3 rounded-xl bg-[#C41E3A] text-white font-bold text-center text-sm shadow-md flex items-center justify-center gap-2"
              >
                <span>Apply for Membership</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <a
                href={generateWhatsAppLink(gymSettings.whatsapp, 'Hello! I want to inquire about Red Apple Gym membership.')}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 rounded-xl bg-white border border-[#D4A574]/60 text-[#1A1A1A] font-semibold text-center text-xs flex items-center justify-center gap-2 shadow-2xs"
              >
                <MessageCircle className="w-4 h-4 text-[#25D366]" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
