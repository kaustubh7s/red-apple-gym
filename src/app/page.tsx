'use client';

import React, { useState, useEffect } from 'react';
import PassClient from './pass/[id]/PassClient';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Hero } from '@/components/public/Hero';
import { About } from '@/components/public/About';
import { Facilities } from '@/components/public/Facilities';
import { Trainers } from '@/components/public/Trainers';
import { Pricing } from '@/components/public/Pricing';
import { Transformations } from '@/components/public/Transformations';
import { Testimonials } from '@/components/public/Testimonials';
import { BmiCalculator } from '@/components/public/BmiCalculator';
import { ContactSection } from '@/components/public/ContactSection';
import { WhatsAppWidget } from '@/components/public/WhatsAppWidget';

export default function Home() {
  const [interceptedPassId, setInterceptedPassId] = useState<string | null>(null);

  // Fallback for static hosting rewrites: If Netlify serves index.html for a /pass/... request,
  // or if user is offline / opened standalone PWA with a saved pass, immediately mount digital pass.
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      if (pathname.startsWith('/pass')) {
        const segments = pathname.split('/').filter(Boolean);
        // segments might be ['pass', 'RED-1071']
        const id = segments[1] || new URLSearchParams(window.location.search).get('id') || '';
        setInterceptedPassId(id || 'lookup');
        return;
      }

      // If user has a saved member pass and is OFFLINE, OR launched as standalone PWA:
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const browsingSite = urlParams.has('site');
        const savedPass = localStorage.getItem('redapple_saved_pass_id');
        const role = localStorage.getItem('redapple_device_role');
        const isOffline = !navigator.onLine;
        const isStandalone =
          window.matchMedia('(display-mode: standalone)').matches ||
          Boolean((navigator as unknown as { standalone?: boolean }).standalone);

        let validPass = savedPass && savedPass !== '[id]' && !savedPass.includes('[') ? savedPass : null;

        if (!validPass) {
          const lastPassStr = localStorage.getItem('redapple_last_offline_pass');
          if (lastPassStr) {
            try {
              const parsed = JSON.parse(lastPassStr);
              if (parsed && (parsed.memberId || parsed.id)) {
                validPass = parsed.memberId || parsed.id;
              }
            } catch {}
          }
        }

        // When offline, always open the digital pass if saved on device
        if (validPass && (isOffline || (isStandalone && !browsingSite) || (role === 'member' && isOffline))) {
          setInterceptedPassId(validPass);
        }
      } catch (e) {
        console.warn('Home pass routing notice:', e);
      }
    }
  }, []);

  if (interceptedPassId !== null) {
    return <PassClient id={interceptedPassId === 'lookup' ? '' : interceptedPassId} />;
  }

  return (
    <main className="min-h-screen bg-[#F8F6F4] text-[#1A1A1A] flex flex-col justify-between selection:bg-[#C41E3A] selection:text-white">
      {/* Fixed Luxury Navigation Header */}
      <Navbar />

      {/* Hero Section */}
      <Hero />

      {/* About Gym Section */}
      <About />

      {/* Facilities Showcase */}
      <Facilities />

      {/* Master Trainers Roster */}
      <Trainers />

      {/* Membership Tiers & Pricing */}
      <Pricing />

      {/* Client Transformations */}
      <Transformations />

      {/* Google Reviews & Testimonials */}
      <Testimonials />

      {/* Live Interactive BMI Diagnostic */}
      <BmiCalculator />

      {/* Contact & Facility Location Map */}
      <ContactSection />

      {/* Persistent Floating WhatsApp Concierge */}
      <WhatsAppWidget />

      {/* Global Luxury Footer */}
      <Footer />
    </main>
  );
}
