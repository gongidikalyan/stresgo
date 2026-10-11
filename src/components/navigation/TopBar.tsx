import React from 'react';
import {
  Sliders,
  BookOpen,
  Compass,
  Wind,
  Fingerprint,
} from 'lucide-react';
import { NavigationTab } from '../../types';

interface TopBarProps {
  currentTab: NavigationTab;
  onNavigate: (tab: NavigationTab) => void;
  onOpenSettings: () => void;
  onOpenJournal: () => void;
  onOpenStressTools: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentTab,
  onNavigate,
  onOpenSettings,
  onOpenJournal,
  onOpenStressTools,
}) => {
  const navItems: { id: NavigationTab; label: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'stress', label: 'Stress Relief' },
    { id: 'meditate', label: 'Meditate' },
    { id: 'notes', label: 'Notes' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#F7F5EE]/95 backdrop-blur-md border-b border-[#91A88C]/25 transition-colors">
      <div className="max-w-xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        {/* Brand Logo / Home */}
        <button
          onClick={() => onNavigate('home')}
          className="text-left flex items-center gap-2 shrink-0 group focus:outline-none"
        >
          <span className="font-serif text-xl sm:text-2xl font-medium tracking-tight text-[#244C3A] group-hover:text-[#193629] transition-colors">
            Stress Go
          </span>
        </button>

        {/* Desktop / Tablet Nav Links */}
        <nav className="hidden sm:flex items-center gap-5 text-xs font-medium text-[#27332C]">
          {navItems.map((item) => {
            const isSelected = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`whitespace-nowrap shrink-0 py-1 transition-colors relative ${
                  isSelected
                    ? 'text-[#244C3A] font-semibold'
                    : 'text-[#827666] hover:text-[#244C3A]'
                }`}
              >
                {item.label}
                {isSelected && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#244C3A] rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Quick Utilities */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={onOpenStressTools}
            className="px-2.5 py-1.5 rounded-full bg-amber-50 hover:bg-amber-100 border border-amber-200 text-[#8C5827] text-xs font-medium transition-colors flex items-center gap-1 active:scale-95 shadow-2xs"
            title="Bop the Stress Teddy"
          >
            <span className="text-sm">🧸</span>
            <span className="text-[11px] font-semibold">Teddy Bop</span>
          </button>

          <button
            onClick={onOpenJournal}
            className="p-2 text-[#827666] hover:text-[#244C3A] rounded-xl hover:bg-[#EDE9DC] transition-colors"
            title="Notes"
            aria-label="Notes"
          >
            <BookOpen size={16} />
          </button>

          <button
            onClick={onOpenSettings}
            className="p-2 text-[#827666] hover:text-[#244C3A] rounded-xl hover:bg-[#EDE9DC] transition-colors"
            title="Settings"
            aria-label="Settings"
          >
            <Sliders size={16} />
          </button>
        </div>
      </div>
    </header>
  );
};
