import {
  UserPreferences,
  CustomSanctuaryPreset,
  SessionHistoryItem,
  JournalEntry,
  NatureEnvironmentId,
} from '../types';

const STORAGE_KEYS = {
  PREFERENCES: 'stillora_preferences_v4',
  SANCTUARY_PRESETS: 'stillora_sanctuary_presets_v4',
  SESSION_HISTORY: 'stillora_session_history_v4',
  JOURNAL_ENTRIES: 'stillora_journal_entries_v4',
};

const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'light',
  reducedMotion: false,
  masterVolume: 0.9,
  natureVolume: 0.75,
  musicVolume: 0.8,
  defaultDurationMinutes: 5,
  favoriteTrackIds: ['bansuri_yaman', 'tanpura_sa_pa'],
  favoriteEnvironmentIds: ['forest', 'ocean'],
};

export const storageService = {
  // Preferences
  getPreferences(): UserPreferences {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
      if (data) {
        return { ...DEFAULT_PREFERENCES, ...JSON.parse(data) };
      }
    } catch (e) {
      console.warn('Storage read preferences failed', e);
    }
    return DEFAULT_PREFERENCES;
  },

  savePreferences(prefs: Partial<UserPreferences>): UserPreferences {
    const current = this.getPreferences();
    const updated = { ...current, ...prefs };
    try {
      localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(updated));
    } catch (e) {
      console.warn('Storage write preferences failed', e);
    }
    return updated;
  },

  toggleFavoriteTrack(trackId: string): boolean {
    const prefs = this.getPreferences();
    const exists = prefs.favoriteTrackIds.includes(trackId);
    const updated = exists
      ? prefs.favoriteTrackIds.filter((id) => id !== trackId)
      : [...prefs.favoriteTrackIds, trackId];
    this.savePreferences({ favoriteTrackIds: updated });
    return !exists;
  },

  toggleFavoriteEnvironment(envId: NatureEnvironmentId): boolean {
    const prefs = this.getPreferences();
    const exists = prefs.favoriteEnvironmentIds.includes(envId);
    const updated = exists
      ? prefs.favoriteEnvironmentIds.filter((id) => id !== envId)
      : [...prefs.favoriteEnvironmentIds, envId];
    this.savePreferences({ favoriteEnvironmentIds: updated });
    return !exists;
  },

  // Custom Sanctuary Presets
  getSanctuaryPresets(): CustomSanctuaryPreset[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SANCTUARY_PRESETS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Storage read presets failed', e);
    }
    return [
      {
        id: 'preset_morning_calm',
        name: 'Morning Forest & Flute',
        environmentId: 'forest',
        soundType: 'flute',
        durationMinutes: 10,
        createdAt: Date.now() - 86400000,
      },
      {
        id: 'preset_ocean_dusk',
        name: 'Ocean Shore & Tanpura',
        environmentId: 'ocean',
        soundType: 'tanpura',
        durationMinutes: 5,
        createdAt: Date.now() - 43200000,
      },
    ];
  },

  saveSanctuaryPreset(preset: Omit<CustomSanctuaryPreset, 'id' | 'createdAt'>): CustomSanctuaryPreset {
    const presets = this.getSanctuaryPresets();
    const newPreset: CustomSanctuaryPreset = {
      ...preset,
      id: 'preset_' + Date.now(),
      createdAt: Date.now(),
    };
    const updated = [newPreset, ...presets];
    try {
      localStorage.setItem(STORAGE_KEYS.SANCTUARY_PRESETS, JSON.stringify(updated));
    } catch (e) {
      console.warn('Storage write preset failed', e);
    }
    return newPreset;
  },

  deleteSanctuaryPreset(id: string) {
    const presets = this.getSanctuaryPresets().filter((p) => p.id !== id);
    try {
      localStorage.setItem(STORAGE_KEYS.SANCTUARY_PRESETS, JSON.stringify(presets));
    } catch (e) {
      console.warn('Storage delete preset failed', e);
    }
  },

  // Session History
  getSessionHistory(): SessionHistoryItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SESSION_HISTORY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Storage read session history failed', e);
    }
    return [
      {
        id: 'session_sample_1',
        title: 'Ancient Forest Sanctuary',
        type: 'nature',
        durationSeconds: 300,
        completedAt: Date.now() - 3600000 * 2,
      },
      {
        id: 'session_sample_2',
        title: 'Three-Minute Breathing',
        type: 'meditation',
        durationSeconds: 180,
        completedAt: Date.now() - 3600000 * 6,
      },
    ];
  },

  addSessionHistory(session: Omit<SessionHistoryItem, 'id' | 'completedAt'>): SessionHistoryItem {
    const history = this.getSessionHistory();
    const newItem: SessionHistoryItem = {
      ...session,
      id: 'session_' + Date.now(),
      completedAt: Date.now(),
    };
    const updated = [newItem, ...history.slice(0, 49)];
    try {
      localStorage.setItem(STORAGE_KEYS.SESSION_HISTORY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Storage write session history failed', e);
    }
    return newItem;
  },

  clearSessionHistory() {
    try {
      localStorage.removeItem(STORAGE_KEYS.SESSION_HISTORY);
    } catch (e) {
      console.warn('Storage clear history failed', e);
    }
  },

  // Journal Entries
  getJournalEntries(): JournalEntry[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.JOURNAL_ENTRIES);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Storage read journal failed', e);
    }
    return [
      {
        id: 'sample_note_1',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        timestamp: Date.now() - 3600000 * 12,
        prompt: 'Daily Sanctuary Reflection',
        content: 'Felt my breath slow down under the soft forest canopy. Ready for the day.',
      },
    ];
  },

  addJournalEntry(prompt: string, content: string): JournalEntry {
    const list = this.getJournalEntries();
    const newEntry: JournalEntry = {
      id: 'entry_' + Date.now(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      timestamp: Date.now(),
      prompt,
      content,
    };
    const updated = [newEntry, ...list];
    try {
      localStorage.setItem(STORAGE_KEYS.JOURNAL_ENTRIES, JSON.stringify(updated));
    } catch (e) {
      console.warn('Storage write journal failed', e);
    }
    return newEntry;
  },

  deleteJournalEntry(id: string) {
    const list = this.getJournalEntries().filter((e) => e.id !== id);
    try {
      localStorage.setItem(STORAGE_KEYS.JOURNAL_ENTRIES, JSON.stringify(list));
    } catch (e) {
      console.warn('Storage delete journal failed', e);
    }
  },

  clearAllData() {
    try {
      localStorage.removeItem(STORAGE_KEYS.PREFERENCES);
      localStorage.removeItem(STORAGE_KEYS.SANCTUARY_PRESETS);
      localStorage.removeItem(STORAGE_KEYS.SESSION_HISTORY);
      localStorage.removeItem(STORAGE_KEYS.JOURNAL_ENTRIES);
    } catch (e) {
      console.warn('Storage clear all failed', e);
    }
  },
};
