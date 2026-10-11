import {
  UserPreferences,
  SessionHistoryItem,
  JournalEntry,
} from '../types';

const STORAGE_KEYS = {
  PREFERENCES: 'stressgo_preferences_v1',
  SESSION_HISTORY: 'stressgo_session_history_v1',
  JOURNAL_ENTRIES: 'stressgo_journal_entries_v1',
};

// Purge any legacy stillora keys from previous sessions
if (typeof window !== 'undefined' && window.localStorage) {
  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (k && k.startsWith('stillora_')) {
        localStorage.removeItem(k);
      }
    }
  } catch (_) {}
}

const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'light',
  reducedMotion: false,
  soundEnabled: true,
  masterVolume: 0.9,
};

export const storageService = {
  getPreferences(): UserPreferences {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
      if (data) {
        return { ...DEFAULT_PREFERENCES, ...JSON.parse(data) };
      }
    } catch (e) {
      console.warn('Storage read failed', e);
    }
    return DEFAULT_PREFERENCES;
  },

  savePreferences(prefs: Partial<UserPreferences>): UserPreferences {
    const current = this.getPreferences();
    const updated = { ...current, ...prefs };
    try {
      localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(updated));
    } catch (e) {
      console.warn('Storage write failed', e);
    }
    return updated;
  },

  // Session History
  getSessionHistory(): SessionHistoryItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SESSION_HISTORY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Storage read history failed', e);
    }
    return [
      {
        id: 'session_sample_1',
        title: 'Physiological Sigh',
        type: 'stress',
        durationSeconds: 45,
        completedAt: Date.now() - 3600000 * 2,
      },
      {
        id: 'session_sample_2',
        title: '3-Minute Breathing',
        type: 'meditation',
        durationSeconds: 180,
        completedAt: Date.now() - 3600000 * 8,
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
      console.warn('Storage write history failed', e);
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

  // Journal / Notes Entries
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
        prompt: 'Daily Pause',
        content: 'Felt my breath slow down. Ready for the rest of today.',
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
      localStorage.removeItem(STORAGE_KEYS.SESSION_HISTORY);
      localStorage.removeItem(STORAGE_KEYS.JOURNAL_ENTRIES);
    } catch (e) {
      console.warn('Storage clear all failed', e);
    }
  },
};
