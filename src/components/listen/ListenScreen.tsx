import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  Music,
  Heart,
  Sliders,
  TreePine,
  Volume2,
  Info,
  ChevronLeft,
  Moon,
} from 'lucide-react';
import { MUSIC_TRACKS, NATURE_ENVIRONMENTS } from '../../data/sanctuaryContent';
import { MusicGenre, MusicTrack } from '../../types';
import { soundEngine, AudioEngineState } from '../../services/soundEngine';
import { storageService } from '../../services/storage';

interface ListenScreenProps {
  onBackToHome?: () => void;
}

export const ListenScreen: React.FC<ListenScreenProps> = ({ onBackToHome }) => {
  const [selectedGenre, setSelectedGenre] = useState<MusicGenre | 'all'>('all');
  const [engineState, setEngineState] = useState<AudioEngineState>(soundEngine.getState());
  const [favorites, setFavorites] = useState<string[]>(
    storageService.getPreferences().favoriteTrackIds
  );

  useEffect(() => {
    return soundEngine.subscribe((state) => {
      setEngineState(state);
    });
  }, []);

  const handleTogglePlay = (track: MusicTrack) => {
    if (!track.playable) return;
    soundEngine.toggleMusic(track.id, track.engineType);
    if (!engineState.isPlayingMusic) {
      storageService.addSessionHistory({
        title: track.title,
        type: 'music',
        durationSeconds: 300,
      });
    }
  };

  const handleToggleFavorite = (trackId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    storageService.toggleFavoriteTrack(trackId);
    setFavorites(storageService.getPreferences().favoriteTrackIds);
  };

  const filteredTracks = MUSIC_TRACKS.filter((t) => {
    if (selectedGenre === 'all') return true;
    return t.genre === selectedGenre;
  });

  return (
    <div className="pb-28 sm:pb-20 max-w-4xl mx-auto px-4 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          {onBackToHome && (
            <button
              onClick={onBackToHome}
              className="p-1.5 rounded-xl text-[#827666] hover:text-[#244C3A]"
              aria-label="Back"
            >
              <ChevronLeft size={20} />
            </button>
          )}
          <div>
            <h1 className="font-serif text-2xl font-medium text-[#244C3A]">
              Classical Music & Sounds
            </h1>
            <p className="text-xs text-[#827666]">
              Authentic Indian classical instruments, felt piano, and pure acoustic resonance.
            </p>
          </div>
        </div>
      </div>

      {/* Genre Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
        {[
          { id: 'all', label: 'All Sounds' },
          { id: 'indian_classical', label: 'Indian Classical' },
          { id: 'piano_instrumental', label: 'Piano & Instrumental' },
          { id: 'nature_ambient', label: 'Nature Ambience' },
        ].map((genre) => (
          <button
            key={genre.id}
            onClick={() => setSelectedGenre(genre.id as any)}
            className={`px-3.5 py-1.5 rounded-full font-medium whitespace-nowrap transition-colors ${
              selectedGenre === genre.id
                ? 'bg-[#244C3A] text-[#F7F5EE]'
                : 'bg-[#EDE9DC]/70 hover:bg-[#EDE9DC] text-[#27332C]'
            }`}
          >
            {genre.label}
          </button>
        ))}
      </div>

      {/* Dual Ambience Mixer Card */}
      <div className="p-4 sm:p-5 rounded-3xl bg-[#EDE9DC]/60 border border-[#91A88C]/30 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Sliders size={15} className="text-[#244C3A]" />
            <span className="font-serif text-sm font-medium text-[#244C3A]">
              Blend Ambience with Classical Music
            </span>
          </div>
          <span className="text-[11px] text-[#827666]">
            Two-layer harmonic soundscape
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {/* Layer 1: Classical Track Volume */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-[#27332C]">
              <span className="flex items-center gap-1.5">
                <Music size={13} className="text-[#244C3A]" />
                <span className="font-medium">Music Track Volume</span>
              </span>
              <span className="font-mono text-[#827666]">
                {Math.round(engineState.musicVolume * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={engineState.musicVolume}
              onChange={(e) => soundEngine.setMusicVolume(parseFloat(e.target.value))}
              className="w-full accent-[#244C3A] h-1.5 bg-[#F7F5EE] rounded-lg cursor-pointer"
            />
          </div>

          {/* Layer 2: Nature Ambience Volume */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-[#27332C]">
              <span className="flex items-center gap-1.5">
                <TreePine size={13} className="text-[#244C3A]" />
                <span className="font-medium">Nature Ambience Volume</span>
              </span>
              <span className="font-mono text-[#827666]">
                {Math.round(engineState.natureVolume * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={engineState.natureVolume}
              onChange={(e) => soundEngine.setNatureVolume(parseFloat(e.target.value))}
              className="w-full accent-[#244C3A] h-1.5 bg-[#F7F5EE] rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Quick Nature Ambience Buttons */}
        <div className="flex items-center gap-2 pt-1 overflow-x-auto scrollbar-none">
          <span className="text-[11px] text-[#827666] shrink-0">Add Nature:</span>
          {NATURE_ENVIRONMENTS.map((env) => {
            const isPlaying =
              engineState.isPlayingNature && engineState.currentNatureId === env.id;
            return (
              <button
                key={env.id}
                onClick={() => soundEngine.toggleNature(env.id)}
                className={`px-2.5 py-1 rounded-full text-xs transition-colors shrink-0 ${
                  isPlaying
                    ? 'bg-[#244C3A] text-[#F7F5EE]'
                    : 'bg-white/80 hover:bg-white text-[#27332C] border border-[#91A88C]/30'
                }`}
              >
                {isPlaying ? `Playing ${env.name.split(' ')[0]}` : `+ ${env.name.split(' ')[0]}`}
              </button>
            );
          })}
        </div>
      </div>

      {/* Music Catalogue List */}
      <div className="space-y-3">
        <h3 className="font-serif text-base font-medium text-[#244C3A]">
          Sound Catalogue
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredTracks.map((track) => {
            const isPlaying =
              engineState.isPlayingMusic && engineState.currentMusicId === track.id;
            const isFav = favorites.includes(track.id);

            return (
              <div
                key={track.id}
                onClick={() => track.playable && handleTogglePlay(track)}
                className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                  !track.playable
                    ? 'bg-[#EDE9DC]/30 border-dashed border-[#91A88C]/40 opacity-75 cursor-default'
                    : isPlaying
                    ? 'bg-white border-[#244C3A] shadow-md ring-1 ring-[#244C3A] cursor-pointer'
                    : 'bg-white/90 hover:bg-white border-[#91A88C]/30 hover:border-[#244C3A]/50 shadow-sm cursor-pointer'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#91A88C]">
                      {track.ragaOrStyle}
                    </span>

                    {track.playable ? (
                      <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
                        Original Asset
                      </span>
                    ) : (
                      <span className="text-[10px] text-[#827666] bg-[#EDE9DC] px-2 py-0.5 rounded-full">
                        Catalogue Preview
                      </span>
                    )}
                  </div>

                  <h4 className="font-serif text-base font-medium text-[#244C3A] mt-1">
                    {track.title}
                  </h4>
                  <p className="text-xs text-[#827666] mt-0.5">
                    {track.instrument} • {track.description}
                  </p>
                </div>

                <div className="pt-3 flex items-center justify-between border-t border-[#91A88C]/20 mt-3 text-xs">
                  <div className="flex items-center gap-2">
                    {track.playable ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTogglePlay(track);
                        }}
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform active:scale-95 ${
                          isPlaying
                            ? 'bg-[#244C3A] text-[#F7F5EE]'
                            : 'bg-[#EDE9DC] text-[#244C3A] hover:bg-[#244C3A] hover:text-[#F7F5EE]'
                        }`}
                        aria-label={isPlaying ? 'Pause' : 'Play'}
                      >
                        {isPlaying ? (
                          <Pause size={12} fill="currentColor" />
                        ) : (
                          <Play size={12} fill="currentColor" className="ml-0.5" />
                        )}
                      </button>
                    ) : (
                      <span className="text-[11px] text-[#827666] italic flex items-center gap-1">
                        <Info size={12} />
                        <span>Requires studio recording asset</span>
                      </span>
                    )}

                    {track.playable && (
                      <span className="text-[11px] text-[#827666] font-mono">
                        {Math.floor(track.durationSeconds / 60)} min
                      </span>
                    )}
                  </div>

                  {track.playable && (
                    <button
                      onClick={(e) => handleToggleFavorite(track.id, e)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isFav ? 'text-rose-500' : 'text-[#827666] hover:text-[#244C3A]'
                      }`}
                      aria-label="Toggle favorite"
                    >
                      <Heart size={16} fill={isFav ? 'currentColor' : 'none'} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
