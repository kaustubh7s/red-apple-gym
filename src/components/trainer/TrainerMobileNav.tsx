'use client';

import React from 'react';
import { TrainerTab } from './TrainerSidebar';
import {
  LayoutDashboard,
  Users,
  Dumbbell,
  Activity,
  Sparkles
} from 'lucide-react';

interface TrainerMobileNavProps {
  currentTab: TrainerTab;
  setCurrentTab: (tab: TrainerTab) => void;
}

export const TrainerMobileNav: React.FC<TrainerMobileNavProps> = ({
  currentTab,
  setCurrentTab
}) => {
  const tabs: { id: TrainerTab; label: string; icon: any }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'clients', label: 'Athletes', icon: Users },
    { id: 'workouts', label: 'Workouts', icon: Dumbbell },
    { id: 'progress', label: 'Biometrics', icon: Activity },
    { id: 'referrals', label: 'Add Lead', icon: Sparkles }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0A0B0F]/95 backdrop-blur-xl border-t border-white/10 lg:hidden px-2 py-2">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
                isActive ? 'text-blue-400 font-bold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] mt-1">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
