/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { NavigationTab, MeditationPracticeId, StressToolId } from './types';
import { TopBar } from './components/navigation/TopBar';
import { BottomTabBar } from './components/navigation/BottomTabBar';
import { HomeScreen } from './components/home/HomeScreen';
import { MeditateScreen } from './components/meditate/MeditateScreen';
import { StressToolsView } from './components/stress/StressToolsView';
import { NotesView } from './components/notes/NotesView';
import { StressToolsModal } from './components/stress/StressToolsModal';
import { SettingsModal } from './components/modals/SettingsModal';
import { storageService } from './services/storage';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('home');
  const [activeSubId, setActiveSubId] = useState<string | undefined>(undefined);

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isStressModalOpen, setIsStressModalOpen] = useState(false);
  const [activeStressTool, setActiveStressTool] = useState<StressToolId>('teddy_bop');

  // Theme & Preferences
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>(() => {
    return storageService.getPreferences().theme;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (currentTheme === 'dark') {
      root.classList.add('dark');
      document.body.style.backgroundColor = '#141D17';
      document.body.style.color = '#EDE9DC';
    } else {
      root.classList.remove('dark');
      document.body.style.backgroundColor = '#F7F5EE';
      document.body.style.color = '#27332C';
    }
  }, [currentTheme]);

  const handleNavigate = (tab: NavigationTab, extraId?: string) => {
    setCurrentTab(tab);
    setActiveSubId(extraId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenStressTools = (toolId: StressToolId = 'teddy_bop') => {
    setActiveStressTool(toolId);
    setIsStressModalOpen(true);
  };

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${
        currentTheme === 'dark' ? 'bg-[#141D17] text-[#EDE9DC]' : 'bg-[#F7F5EE] text-[#27332C]'
      }`}
    >
      {/* Top App Bar */}
      <TopBar
        currentTab={currentTab}
        onNavigate={(tab) => handleNavigate(tab)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenJournal={() => handleNavigate('notes')}
        onOpenStressTools={() => handleOpenStressTools('teddy_bop')}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full pt-3 sm:pt-4">
        {currentTab === 'home' && (
          <HomeScreen
            onNavigate={handleNavigate}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenJournal={() => handleNavigate('notes')}
            onOpenStressTools={handleOpenStressTools}
          />
        )}

        {currentTab === 'meditate' && (
          <MeditateScreen
            initialPracticeId={(activeSubId as MeditationPracticeId) || 'three_minute_breath'}
            onBackToHome={() => handleNavigate('home')}
            onOpenStressTools={handleOpenStressTools}
          />
        )}

        {currentTab === 'stress' && (
          <StressToolsView
            initialToolId={(activeSubId as StressToolId) || 'sigh'}
            onBackToHome={() => handleNavigate('home')}
          />
        )}

        {currentTab === 'notes' && (
          <NotesView onBackToHome={() => handleNavigate('home')} />
        )}
      </main>

      {/* Mobile Bottom Tab Bar */}
      <BottomTabBar
        currentTab={currentTab}
        onNavigate={(tab) => handleNavigate(tab)}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onThemeChange={(theme) => setCurrentTheme(theme)}
      />

      {/* Quick Stress Tools Modal */}
      <StressToolsModal
        isOpen={isStressModalOpen}
        onClose={() => setIsStressModalOpen(false)}
        initialToolId={activeStressTool}
      />
    </div>
  );
}
