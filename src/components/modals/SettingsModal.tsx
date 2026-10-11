import React, { useState } from 'react';
import {
  X,
  Moon,
  Sun,
  Trash2,
  Volume2,
} from 'lucide-react';
import { storageService } from '../../services/storage';
import { soundEngine } from '../../services/soundEngine';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onThemeChange?: (theme: 'light' | 'dark') => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onThemeChange,
}) => {
  const [prefs, setPrefs] = useState(storageService.getPreferences());
  const [clearedNotice, setClearedNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleUpdate = (updated: Parameters<typeof storageService.savePreferences>[0]) => {
    const newPrefs = storageService.savePreferences(updated);
    setPrefs(newPrefs);
    if (updated.theme && onThemeChange) {
      onThemeChange(updated.theme);
    }
  };

  const handleClearHistory = () => {
    storageService.clearSessionHistory();
    setClearedNotice('Session history cleared.');
    setTimeout(() => setClearedNotice(null), 2500);
  };

  const handleDeleteAllData = () => {
    storageService.clearAllData();
    setPrefs(storageService.getPreferences());
    setClearedNotice('Stress Go reset to defaults.');
    setTimeout(() => setClearedNotice(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div
        className="w-full max-w-sm bg-[#F7F5EE] rounded-3xl shadow-2xl border border-[#91A88C]/30 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-labelledby="settings-title"
      >
        {/* Header */}
        <div className="p-4 border-b border-[#91A88C]/20 flex items-center justify-between bg-[#EDE9DC]/60">
          <h2 id="settings-title" className="font-serif text-lg font-medium text-[#244C3A]">
            Settings
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#827666] hover:text-[#244C3A]"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 text-xs text-[#27332C]">
          {clearedNotice && (
            <div className="p-2.5 bg-emerald-100/60 rounded-xl text-emerald-800 text-center font-medium">
              {clearedNotice}
            </div>
          )}

          {/* Theme */}
          <div className="space-y-2">
            <span className="font-semibold text-[#244C3A]">Theme</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleUpdate({ theme: 'light' })}
                className={`py-2 px-3 rounded-xl border text-center font-medium transition-colors ${
                  prefs.theme === 'light'
                    ? 'bg-[#244C3A] text-[#F7F5EE] border-[#244C3A]'
                    : 'bg-[#EDE9DC]/70 text-[#27332C] border-[#91A88C]/30'
                }`}
              >
                Light
              </button>

              <button
                onClick={() => handleUpdate({ theme: 'dark' })}
                className={`py-2 px-3 rounded-xl border text-center font-medium transition-colors ${
                  prefs.theme === 'dark'
                    ? 'bg-[#244C3A] text-[#F7F5EE] border-[#244C3A]'
                    : 'bg-[#EDE9DC]/70 text-[#27332C] border-[#91A88C]/30'
                }`}
              >
                Dark
              </button>
            </div>
          </div>

          {/* Reduced Motion */}
          <div className="flex items-center justify-between py-1">
            <span className="font-medium text-[#244C3A]">Reduced Motion</span>
            <input
              type="checkbox"
              checked={prefs.reducedMotion}
              onChange={(e) => handleUpdate({ reducedMotion: e.target.checked })}
              className="w-4 h-4 accent-[#244C3A] cursor-pointer"
            />
          </div>

          {/* Master Volume */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[#827666]">
              <span className="font-medium text-[#244C3A]">Master Volume</span>
              <span className="font-mono">{Math.round(prefs.masterVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={prefs.masterVolume}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                handleUpdate({ masterVolume: val });
                soundEngine.setMasterVolume(val);
              }}
              className="w-full accent-[#244C3A] h-1.5 bg-[#EDE9DC] rounded-lg cursor-pointer"
            />
          </div>

          {/* Data Controls */}
          <div className="pt-2 border-t border-[#91A88C]/20 flex items-center justify-between gap-2">
            <button
              onClick={handleClearHistory}
              className="px-3 py-1.5 rounded-xl bg-[#EDE9DC] text-[#244C3A] text-xs font-medium hover:bg-[#91A88C]/30"
            >
              Clear history
            </button>

            <button
              onClick={handleDeleteAllData}
              className="px-3 py-1.5 rounded-xl text-red-800 text-xs font-medium hover:bg-red-50"
            >
              Reset app
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#91A88C]/20 bg-[#EDE9DC]/60 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-full bg-[#244C3A] text-[#F7F5EE] text-xs font-medium hover:bg-[#193629]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
