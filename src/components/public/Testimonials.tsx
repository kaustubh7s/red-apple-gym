'use client';

import React from 'react';
import { Star, CheckCircle, Quote, Sparkles, MapPin, ExternalLink } from 'lucide-react';
import { useApp } from '@/lib/store';

export const Testimonials: React.FC = () => {
  const { gymSettings } = useApp();

  const reviews = [
    {
      author: 'Mohaseen Subedar',
      role: 'Local Guide · 15 reviews',
      text: 'Very good for workout. Personal trainer available Mohaseen Subedar. Dedicated coaching and great gym vibe.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      badge: 'Local Guide'
    },
    {
      author: 'Tushar Jadhav',
      role: 'Verified Google Reviewer',
      text: 'Red Apple Gym it is very good gym. Great atmosphere to workout every day with top-notch motivation.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
      badge: 'Verified Member'
    },
    {
      author: 'Imran Khan',
      role: 'Google Reviewer · 5 reviews',
      text: 'Very nice gym so I must suggest for everyone must visit! 5 star from my side for clean space and equipment.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
      badge: 'Verified Review'
    },
    {
      author: 'Gym Community Review',
      role: 'Verified Member',
      text: 'Gym with decent people, trainer (Avinash & Mohaseen) is much co-operative. Great atmosphere for both beginners and athletes!',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=120&auto=format&fit=crop&q=80',
      badge: 'Google Review'
    }
  ];

  return (
    <section className="py-24 bg-[#F8F6F4] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#D4A574]/40 text-[#9E6B32] text-xs font-bold uppercase tracking-wider shadow-sm">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
            <span>4.7 ★ Google Maps Rating (34 Reviews)</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold text-[#1A1A1A] font-serif tracking-tight">
            Authentic Google Reviews &amp; Community Voices
          </h2>

          <p className="text-xs sm:text-sm text-[#666666] max-w-xl mx-auto">
            What our members in Cidco N-2, Chhatrapati Sambhajinagar say about Red Apple Gym, Head Trainer Mohaseen Subedar &amp; Founder Prashant Magre.
          </p>

          {/* Google Maps External Badge Link */}
          <div className="pt-2">
            <a
              href={gymSettings.googleMapsUrl || 'https://maps.app.goo.gl/UYPmZrpZEJWEn84F9'}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white hover:bg-neutral-50 border border-black/10 text-xs font-bold text-[#1A1A1A] transition-colors shadow-sm"
            >
              <MapPin className="w-3.5 h-3.5 text-[#C41E3A]" />
              <span>Read All 34 Reviews on Google Maps</span>
              <ExternalLink className="w-3 h-3 text-neutral-400" />
            </a>
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reviews.map((rev, idx) => (
            <div
              key={idx}
              className="p-6 rounded-3xl bg-white border border-black/10 flex flex-col justify-between hover:border-[#D4A574] transition-all duration-300 shadow-[0_8px_30px_rgba(0,0,0,0.04)] relative"
            >
              <div className="space-y-4">
                {/* Stars + Badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#F8F6F4] text-[#666666] border border-black/5">
                    {rev.badge}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-[#4A4A4A] leading-relaxed italic">
                  "{rev.text}"
                </p>
              </div>

              {/* Author */}
              <div className="pt-5 border-t border-black/5 flex items-center gap-3 mt-6">
                <img
                  src={rev.avatar}
                  alt={rev.author}
                  className="w-10 h-10 rounded-full object-cover border border-[#D4A574]/50"
                />
                <div>
                  <div className="text-xs font-bold text-[#1A1A1A] flex items-center gap-1 font-serif">
                    <span>{rev.author}</span>
                    <CheckCircle className="w-3 h-3 text-[#2E7D32]" />
                  </div>
                  <div className="text-[10px] text-[#8A8A8A]">{rev.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
