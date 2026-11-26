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
  // immediately mount the digital pass component instead of rendering the homepage.
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      if (pathname.startsWith('/pass')) {
        const segments = pathname.split('/').filter(Boolean);
        // segments might be ['pass', 'RED-1071']
        const id = segments[1] || new URLSearchParams(window.location.search).get('id') || '';
        setInterceptedPassId(id || 'lookup');
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
