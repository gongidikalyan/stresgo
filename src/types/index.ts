export type NavigationTab = 'home' | 'stress' | 'meditate' | 'notes';

export type StressToolId =
  | 'teddy_bop'
  | 'sos_calm'
  | 'sigh'
  | 'box_breath'
  | 'breath_478'
  | 'bilateral_tapping'
  | 'circle_of_control'
  | 'brown_noise'
  | 'perspective_101010'
  | 'calming_stone'
  | 'worry_dissolve'
  | 'grounding_54321'
  | 'body_detense'
  | 'sound_resonance';

export type StressCategory = 'all' | 'instant' | 'breath' | 'physical' | 'mental';

export interface StressToolMeta {
  id: StressToolId;
  title: string;
  subtitle: string;
  category: 'instant' | 'breath' | 'physical' | 'mental';
  durationText: string;
  iconName: string;
  accentColor: string;
}

export type MeditationPracticeId =
  | 'one_minute_pause'
  | 'three_minute_breath'
  | 'five_minute_grounding'
  | 'ten_minute_stillness'
  | 'body_awareness';

export interface MeditationPractice {
  id: MeditationPracticeId;
  title: string;
  durationMinutes: number;
  description: string;
  guidanceStyle: 'breath_animation' | 'gentle_steps' | 'timer_stillness';
  steps?: {
    title: string;
    instruction: string;
    durationSeconds: number;
  }[];
}

export type MoodType = 'overwhelmed' | 'anxious' | 'tired' | 'restless' | 'unfocused' | 'peaceful';

export interface MoodRecommendation {
  mood: MoodType;
  label: string;
  suggestionTitle: string;
  suggestionText: string;
  targetTab: NavigationTab;
  targetId?: string;
}

export interface SessionHistoryItem {
  id: string;
  title: string;
  type: 'meditation' | 'stress';
  durationSeconds: number;
  completedAt: number;
}

export interface JournalEntry {
  id: string;
  date: string;
  timestamp: number;
  prompt: string;
  content: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  reducedMotion: boolean;
  soundEnabled: boolean;
  masterVolume: number;
}

