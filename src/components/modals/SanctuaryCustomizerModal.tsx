import React, { useState } from 'react';
import {
  X,
  Sparkles,
  TreePine,
  Music,
  Clock,
  Play,
  BookmarkCheck,
  Check,
} from 'lucide-react';
import {
  NatureEnvironmentId,
  CustomSanctuaryPreset,
} from '../../types';
import { NATURE_ENVIRONMENTS } from '../../data/sanctuaryContent';
import { NatureVisual } from '../nature/NatureVisual';
import { soundEngine } from '../../services/soundEngine';
import { storageService } from '../../services/storage';

interface SanctuaryCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartCustomSanctuary: (preset: {
    environmentId: NatureEnvironmentId;
    soundType: 'flute' | 'tanpura' | 'nature' | 'silence';
    durationMinutes: number;
  }) => void;
}

export const SanctuaryCustomizerModal: React.FC<SanctuaryCustomizerModalProps> = ({
  isOpen,
  onClose,
  onStartCustomSanctuary,
}) => {
  const [selectedEnv, setSelectedEnv] = useState<NatureEnvironmentId>('forest');
  const [selectedSound, setSelectedSound] = useState<'flute' | 'tanpura' | 'nature' | 'silence'>('flute');
  const [selectedDuration, setSelectedDuration] = useState<number>(10);
  const [presetName, setPresetName] = useState('');
  const [savedNotice, setSavedNotice] = useState(false);

  if (!isOpen) return null;

  const handleSavePreset = (e: React.FormEvent) => {
    e.preventDefault();
    const envObj = NATURE_ENVIRONMENTS.find((n) => n.id === selectedEnv);
    const finalName =
      presetName.trim() || `${envObj?.name || 'Sanctuary'} & ${selectedSound}`;

    storageService.saveSanctuaryPreset({
      name: finalName,
      environmentId: selectedEnv,
      soundType: selectedSound,
      durationMinutes: selectedDuration,
    });

    setSavedNotice(true);
    setPresetName('');
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const handleLaunch = () => {
    // 1. Trigger audio combination
    soundEngine.stopAll();

    if (selectedSound === 'flute') {
      soundEngine.playNature(selectedEnv);
      soundEngine.playMusic('bansuri_yaman', 'flute');
    } else if (selectedSound === 'tanpura') {
      soundEngine.playNature(selectedEnv);
      soundEngine.playMusic('tanpura_sa_pa', 'tanpura');
    } else if (selectedSound === 'nature') {
      soundEngine.playNature(selectedEnv);
    } // silence: no audio

    soundEngine.setSleepTimer(selectedDuration);

    onStartCustomSanctuary({
      environmentId: selectedEnv,
      soundType: selectedSound,
      durationMinutes: selectedDuration,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-[#F7F5EE] rounded-3xl shadow-2xl border border-[#91A88C]/30 overflow-hidden flex flex-col max-h-[92vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="customizer-title"
      >
        {/* Modal Header */}
        <div className="p-4 border-b border-[#91A88C]/20 flex items-center justify-between bg-[#EDE9DC]/60">
          <div className="flex items-center gap-2">
            <Sparkles size={17} className="text-[#244C3A]" />
            <h2 id="customizer-title" className="font-serif text-lg font-medium text-[#244C3A]">
              Create Your Own Sanctuary
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#827666] hover:text-[#244C3A]"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Configuration Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs text-[#27332C]">
          {/* Live Preview Artwork Banner */}
          <div className="h-32 rounded-2xl overflow-hidden relative border border-[#91A88C]/30 shadow-inner">
            <NatureVisual environmentId={selectedEnv} className="w-full h-full" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-3 text-white">
              <div>
                <p className="font-serif text-base font-normal">
                  {NATURE_ENVIRONMENTS.find((n) => n.id === selectedEnv)?.name}
                </p>
                <p className="text-[10px] text-white/80">
                  {selectedSound.toUpperCase()} • {selectedDuration} MINUTES
                </p>
              </div>
            </div>
          </div>

          {/* 1. Choose Environment */}
          <div className="space-y-2">
            <label className="font-semibold text-[#244C3A] flex items-center gap-1.5">
              <TreePine size={14} />
              <span>1. Choose Environment</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {NATURE_ENVIRONMENTS.map((env) => {
                const isSelected = selectedEnv === env.id;
                return (
                  <button
                    key={env.id}
                    type="button"
                    onClick={() => setSelectedEnv(env.id)}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      isSelected
                        ? 'bg-[#244C3A] text-[#F7F5EE] border-[#244C3A] shadow-sm'
                        : 'bg-white text-[#27332C] border-[#91A88C]/30 hover:bg-[#EDE9DC]'
                    }`}
                  >
                    <p className="font-medium text-xs truncate">{env.name.split(' ')[0]}</p>
                    <p className={`text-[10px] truncate ${isSelected ? 'text-[#91A88C]' : 'text-[#827666]'}`}>
                      {env.id}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Choose Sound Resonance */}
          <div className="space-y-2">
            <label className="font-semibold text-[#244C3A] flex items-center gap-1.5">
              <Music size={14} />
              <span>2. Choose Sound Resonance</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'flute', label: 'Classical Flute', desc: 'Bansuri Yaman' },
                { id: 'tanpura', label: 'Tanpura Drone', desc: 'Sa-Pa overtones' },
                { id: 'nature', label: 'Nature Ambience', desc: 'Pure environment' },
                { id: 'silence', label: 'Silence', desc: 'Quiet visual only' },
              ].map((sound) => {
                const isSelected = selectedSound === sound.id;
                return (
                  <button
                    key={sound.id}
                    type="button"
                    onClick={() => setSelectedSound(sound.id as any)}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      isSelected
                        ? 'bg-[#244C3A] text-[#F7F5EE] border-[#244C3A] shadow-sm'
                        : 'bg-white text-[#27332C] border-[#91A88C]/30 hover:bg-[#EDE9DC]'
                    }`}
                  >
                    <p className="font-medium text-xs truncate">{sound.label}</p>
                    <p className={`text-[10px] truncate ${isSelected ? 'text-[#91A88C]' : 'text-[#827666]'}`}>
                      {sound.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Choose Duration */}
          <div className="space-y-2">
            <label className="font-semibold text-[#244C3A] flex items-center gap-1.5">
              <Clock size={14} />
              <span>3. Choose Duration</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[2, 5, 10, 20].map((mins) => {
                const isSelected = selectedDuration === mins;
                return (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setSelectedDuration(mins)}
                    className={`py-2 px-3 rounded-xl border text-center font-medium transition-all ${
                      isSelected
                        ? 'bg-[#244C3A] text-[#F7F5EE] border-[#244C3A]'
                        : 'bg-white text-[#27332C] border-[#91A88C]/30 hover:bg-[#EDE9DC]'
                    }`}
                  >
                    {mins} min
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional: Save as Favorite Preset */}
          <form onSubmit={handleSavePreset} className="pt-2 border-t border-[#91A88C]/20 space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                placeholder="Name this sanctuary combination (optional)..."
                className="flex-1 p-2.5 rounded-xl bg-white border border-[#91A88C]/30 text-xs text-[#27332C] focus:outline-none focus:border-[#244C3A]"
              />
              <button
                type="submit"
                className="px-3.5 py-2 rounded-xl bg-[#EDE9DC] hover:bg-[#244C3A] hover:text-[#F7F5EE] text-[#244C3A] font-medium transition-colors flex items-center gap-1"
              >
                <BookmarkCheck size={14} />
                <span>Save</span>
              </button>
            </div>
            {savedNotice && (
              <p className="text-[11px] text-emerald-800 font-medium flex items-center gap-1">
                <Check size={12} />
                <span>Saved to your personal presets!</span>
              </p>
            )}
          </form>
        </div>

        {/* Modal Action Footer */}
        <div className="p-4 border-t border-[#91A88C]/20 bg-[#EDE9DC]/60 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-full border border-[#91A88C]/40 text-[#827666] hover:text-[#27332C] text-xs font-medium"
          >
            Cancel
          </button>

          <button
            onClick={handleLaunch}
            className="px-6 py-2.5 rounded-full bg-[#244C3A] hover:bg-[#193629] text-[#F7F5EE] text-xs font-medium shadow-md flex items-center gap-1.5 transition-transform active:scale-95"
          >
            <Play size={13} fill="#F7F5EE" />
            <span>Enter Custom Sanctuary</span>
          </button>
        </div>
      </div>
    </div>
  );
};
