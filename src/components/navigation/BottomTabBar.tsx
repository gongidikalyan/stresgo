import React from 'react';
import {
  Compass,
  TreePine,
  Music,
  Wind,
  Activity,
} from 'lucide-react';
import { NavigationTab } from '../../types';

interface BottomTabBarProps {
  currentTab: NavigationTab;
  onNavigate: (tab: NavigationTab) => void;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  currentTab,
  onNavigate,
}) => {
  const tabs: { id: NavigationTab; label: string; icon: React.FC<{ size: number; className?: string }> }[] = [
    { id: 'home', label: 'Home', icon: Compass },
    { id: 'nature', label: 'Nature', icon: TreePine },
    { id: 'listen', label: 'Listen', icon: Music },
    { id: 'meditate', label: 'Meditate', icon: Wind },
    { id: 'yoga', label: 'Yoga', icon: Activity },
  ];

  return (
    <nav
      aria-label="Mobile navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#F7F5EE]/95 backdrop-blur-md border-t border-[#91A88C]/30 pb-[env(safe-area-inset-bottom)] shadow-lg"
    >
      <div className="grid grid-cols-5 h-14 items-center px-1 max-w-md mx-auto">
        {tabs.map((tab) => {
          const isSelected = currentTab === tab.id;
          const IconComponent = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] h-full py-1 text-center transition-all relative ${
                isSelected ? 'text-[#244C3A]' : 'text-[#827666] hover:text-[#244C3A]'
              }`}
              aria-label={tab.label}
              aria-current={isSelected ? 'page' : undefined}
            >
              <IconComponent size={19} className={isSelected ? 'scale-110 transition-transform' : ''} />
              <span className={`text-[10px] tracking-tight mt-0.5 ${isSelected ? 'font-semibold' : 'font-normal'}`}>
                {tab.label}
              </span>
              {isSelected && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#244C3A] absolute bottom-1" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
