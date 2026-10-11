import React, { useState } from 'react';
import {
  X,
  Heart,
  BookOpen,
  Play,
  Trash2,
  TreePine,
  Music,
  Clock,
  Sparkles,
} from 'lucide-react';
import { storageService } from '../../services/storage';
import { MUSIC_TRACKS, NATURE_ENVIRONMENTS } from '../../data/sanctuaryContent';
import { soundEngine } from '../../services/soundEngine';

interface FavoritesJournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectEnvironment?: (envId: any) => void;
  onSelectTrack?: (trackId: string) => void;
}

export const FavoritesJournalModal: React.FC<FavoritesJournalModalProps> = ({
  isOpen,
  onClose,
  onSelectEnvironment,
  onSelectTrack,
}) => {
  const [activeTab, setActiveTab] = useState<'favorites' | 'presets' | 'journal'>('favorites');
  const [prefs, setPrefs] = useState(storageService.getPreferences());
  const [presets, setPresets] = useState(storageService.getSanctuaryPresets());
  const [journalEntries, setJournalEntries] = useState(storageService.getJournalEntries());

  if (!isOpen) return null;

  const favoriteTracks = MUSIC_TRACKS.filter((t) =>
    prefs.favoriteTrackIds.includes(t.id)
  );

  const favoriteEnvironments = NATURE_ENVIRONMENTS.filter((e) =>
    prefs.favoriteEnvironmentIds.includes(e.id)
  );

  const handleDeletePreset = (id: string) => {
    storageService.deleteSanctuaryPreset(id);
    setPresets(storageService.getSanctuaryPresets());
  };

  const handleDeleteJournal = (id: string) => {
    storageService.deleteJournalEntry(id);
    setJournalEntries(storageService.getJournalEntries());
  };

  const handlePlayPreset = (preset: (typeof presets)[0]) => {
    soundEngine.stopAll();
    soundEngine.playNature(preset.environmentId);
    if (preset.soundType === 'flute') {
      soundEngine.playMusic('bansuri_yaman', 'flute');
    } else if (preset.soundType === 'tanpura') {
      soundEngine.playMusic('tanpura_sa_pa', 'tanpura');
    }
    soundEngine.setSleepTimer(preset.durationMinutes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-[#F7F5EE] rounded-3xl shadow-2xl border border-[#91A88C]/30 overflow-hidden flex flex-col max-h-[92vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="favs-title"
      >
        {/* Header */}
        <div className="p-4 border-b border-[#91A88C]/20 flex items-center justify-between bg-[#EDE9DC]/60">
          <div className="flex items-center gap-2">
            <Heart size={17} className="text-[#244C3A]" />
            <h2 id="favs-title" className="font-serif text-lg font-medium text-[#244C3A]">
              Favorites & Reflections
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

        {/* Tab switcher */}
        <div className="px-4 pt-3 flex items-center gap-2 text-xs border-b border-[#91A88C]/20 bg-[#F7F5EE]">
          <button
            onClick={() => setActiveTab('favorites')}
            className={`pb-2.5 px-3 font-medium border-b-2 transition-colors ${
              activeTab === 'favorites'
                ? 'border-[#244C3A] text-[#244C3A]'
                : 'border-transparent text-[#827666] hover:text-[#27332C]'
            }`}
          >
            Favorites ({favoriteTracks.length + favoriteEnvironments.length})
          </button>
          <button
            onClick={() => setActiveTab('presets')}
            className={`pb-2.5 px-3 font-medium border-b-2 transition-colors ${
              activeTab === 'presets'
                ? 'border-[#244C3A] text-[#244C3A]'
                : 'border-transparent text-[#827666] hover:text-[#27332C]'
            }`}
          >
            Custom Presets ({presets.length})
          </button>
          <button
            onClick={() => setActiveTab('journal')}
            className={`pb-2.5 px-3 font-medium border-b-2 transition-colors ${
              activeTab === 'journal'
                ? 'border-[#244C3A] text-[#244C3A]'
                : 'border-transparent text-[#827666] hover:text-[#27332C]'
            }`}
          >
            Journal ({journalEntries.length})
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs text-[#27332C]">
          {/* TAB 1: Favorites */}
          {activeTab === 'favorites' && (
            <div className="space-y-4">
              <div>
                <span className="font-semibold text-[#244C3A] flex items-center gap-1.5 mb-2">
                  <TreePine size={14} />
                  <span>Favorite Nature Environments</span>
                </span>
                {favoriteEnvironments.length === 0 ? (
                  <p className="text-[#827666] italic text-[11px]">No favorite environments saved yet.</p>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {favoriteEnvironments.map((env) => (
                      <div
                        key={env.id}
                        className="p-3 rounded-2xl bg-white border border-[#91A88C]/30 flex items-center justify-between"
                      >
                        <span className="font-medium text-[#244C3A]">{env.name}</span>
                        <button
                          onClick={() => {
                            soundEngine.playNature(env.id);
                            if (onSelectEnvironment) onSelectEnvironment(env.id);
                            onClose();
                          }}
                          className="p-1.5 rounded-full bg-[#EDE9DC] hover:bg-[#244C3A] hover:text-[#F7F5EE] text-[#244C3A]"
                          title="Play"
                        >
                          <Play size={11} fill="currentColor" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-[#91A88C]/20">
                <span className="font-semibold text-[#244C3A] flex items-center gap-1.5 mb-2">
                  <Music size={14} />
                  <span>Favorite Classical Tracks</span>
                </span>
                {favoriteTracks.length === 0 ? (
                  <p className="text-[#827666] italic text-[11px]">No favorite tracks saved yet.</p>
                ) : (
                  <div className="space-y-2">
                    {favoriteTracks.map((track) => (
                      <div
                        key={track.id}
                        className="p-3 rounded-2xl bg-white border border-[#91A88C]/30 flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium text-[#244C3A]">{track.title}</p>
                          <p className="text-[10px] text-[#827666]">{track.instrument}</p>
                        </div>
                        <button
                          onClick={() => {
                            soundEngine.playMusic(track.id, track.engineType);
                            if (onSelectTrack) onSelectTrack(track.id);
                            onClose();
                          }}
                          className="p-1.5 rounded-full bg-[#EDE9DC] hover:bg-[#244C3A] hover:text-[#F7F5EE] text-[#244C3A]"
                          title="Play"
                        >
                          <Play size={11} fill="currentColor" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Custom Presets */}
          {activeTab === 'presets' && (
            <div className="space-y-2.5">
              {presets.length === 0 ? (
                <p className="text-[#827666] italic text-center py-6">
                  No custom sanctuary presets saved yet. Create one from the Home or Nature screen!
                </p>
              ) : (
                presets.map((preset) => (
                  <div
                    key={preset.id}
                    className="p-3.5 rounded-2xl bg-white border border-[#91A88C]/30 flex items-center justify-between gap-3"
                  >
                    <div>
                      <h4 className="font-serif text-sm font-medium text-[#244C3A]">
                        {preset.name}
                      </h4>
                      <p className="text-[10px] text-[#827666]">
                        {preset.environmentId.toUpperCase()} • {preset.soundType.toUpperCase()} • {preset.durationMinutes}M
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handlePlayPreset(preset)}
                        className="px-3 py-1.5 rounded-full bg-[#244C3A] text-[#F7F5EE] text-[11px] font-medium hover:bg-[#193629] flex items-center gap-1"
                      >
                        <Play size={10} fill="currentColor" />
                        <span>Launch</span>
                      </button>

                      <button
                        onClick={() => handleDeletePreset(preset.id)}
                        className="p-1.5 text-[#827666] hover:text-red-700"
                        title="Delete"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: Journal */}
          {activeTab === 'journal' && (
            <div className="space-y-2.5">
              {journalEntries.length === 0 ? (
                <p className="text-[#827666] italic text-center py-6">
                  No journal entries recorded. Complete a Gratitude Reflection in the Meditate studio!
                </p>
              ) : (
                journalEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-3.5 rounded-2xl bg-white border border-[#91A88C]/25 space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-[11px] text-[#827666]">
                      <span className="font-mono">{entry.date}</span>
                      <button
                        onClick={() => handleDeleteJournal(entry.id)}
                        className="text-[#827666] hover:text-red-700"
                        title="Delete"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <p className="text-xs text-[#27332C] leading-relaxed italic bg-[#EDE9DC]/40 p-2.5 rounded-xl">
                      "{entry.content}"
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
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
