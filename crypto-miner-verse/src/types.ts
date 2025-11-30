export enum LevelStatus {
  LOCKED = 'LOCKED',
  UNLOCKED = 'UNLOCKED',
  COMPLETED = 'COMPLETED',
}

export enum QuestionType {
  FILL_BLANK = 'FILL_BLANK',
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  SORTING = 'SORTING',
}

export interface Question {
  id: string;
  type: QuestionType;
  prompt: string;
  options: string[]; // For multiple choice or fill blank options
  correctAnswer: string | string[]; // Array for sorting
  explanation: string;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  levelId: number;
  content: string; // Markdown or simple text
  questions: Question[];
  xpReward: number;
}

export interface Level {
  id: number;
  name: string;
  description: string;
  status: LevelStatus;
  lessons: Lesson[];
  color: string;
  videoSrc?: string;
  youtubeUrl?: string;
}

export interface UserProgress {
  currentLevel: number;
  completedLessonIds: string[];
  streakDays: number;
  xp: number;
  badges: string[];
  isPro: boolean;
}

export interface AnalysisResult {
  score: number; // 0-100 (0 = Safe, 100 = Scam)
  reasoning: string;
  signals: string[];
}
